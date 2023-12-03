import type { NodePath } from '@babel/core';
import { traverse } from '@babel/core';
import type {
  BlockStatement,
  Node,
  ObjectExpression,
  StaticBlock,
} from '@babel/types';
import { Preprocessor } from 'content-tag';
import type { Parser } from 'prettier';
import { parsers as babelParsers } from 'prettier/plugins/babel.js';

import { PRINTER_NAME } from '../config';
import type { Options } from '../options.js';
import type { GlimmerTemplateInfo, RawGlimmerTemplate } from '../types/glimmer';
import { isDefaultTemplate } from '../types/glimmer';
import { assert } from '../utils';
import { normalizeWhitespace } from './whitespace';

const typescript = babelParsers['babel-ts'] as Parser<Node | undefined>;
const p = new Preprocessor();

/** Converts a node into a GlimmerTemplate node */
function convertNode(
  path: NodePath,
  node: BlockStatement | ObjectExpression | StaticBlock,
  templateInfo: GlimmerTemplateInfo,
): void {
  Object.assign(node, templateInfo, {
    type: 'FunctionDeclaration',
    extra: Object.assign(node.extra ?? {}, templateInfo.extra, {
      isGlimmerTemplate: true,
      isDefaultTemplate: isDefaultTemplate(path),
    }),
  });
}

/** Traverses the AST and replaces the transformed template parts with other AST */
function convertAst(ast: Node, templateInfos: GlimmerTemplateInfo[]): void {
  let counter = 0;

  traverse(ast, {
    enter(path) {
      const { node } = path;
      if (
        node.type === 'ObjectExpression' ||
        node.type === 'BlockStatement' ||
        node.type === 'StaticBlock'
      ) {
        const { range } = node;
        assert('expected range', range);

        const templateInfo = templateInfos.find(
          (p) =>
            (p.range[0] === range[0] && p.range[1] === range[1]) ||
            (p.range[0] === range[0] - 1 && p.range[1] === range[1] + 1) ||
            (p.range[0] === range[0] && p.range[1] === range[1] + 1),
        );

        if (!templateInfo) {
          return null;
        }

        convertNode(path, node, templateInfo);

        counter++;
      }
      return null;
    },
  });

  if (counter !== templateInfos.length) {
    throw new Error('failed to process all templates');
  }
}

/**
 * Pre-processes the template info, parsing the template content to Glimmer AST,
 * fixing the offsets and locations of all nodes also calculates the block
 * params locations & ranges and adding it to the info
 */
function preprocess(code: string): {
  code: string;
  templateInfos: GlimmerTemplateInfo[];
} {
  const templateNodes = p.parse(code) as RawGlimmerTemplate[];
  const templateInfos: GlimmerTemplateInfo[] = [];
  let output = code;
  for (const templateNode of templateNodes) {
    output = normalizeWhitespace(templateNode, code, output);

    const template = code.slice(
      templateNode.contentRange.start,
      templateNode.contentRange.end,
    );
    const templateInfo: GlimmerTemplateInfo = {
      range: [templateNode.range.start, templateNode.range.end],
      start: templateNode.range.start,
      end: templateNode.range.end,
      extra: {
        template,
      },
    };
    templateInfos.push(templateInfo);
  }

  return { templateInfos, code: output };
}

export const parser: Parser<Node | undefined> = {
  ...typescript,
  astFormat: PRINTER_NAME,

  async parse(code: string, options: Options): Promise<Node> {
    const preprocessed = preprocess(code);
    const ast = await typescript.parse(preprocessed.code, options);
    assert('expected ast', ast);
    convertAst(ast, preprocessed.templateInfos);
    return ast;
  },
};
