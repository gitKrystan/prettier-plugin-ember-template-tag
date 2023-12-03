import { traverse } from '@babel/core';
import type { Node } from '@babel/types';
import { type Comment } from '@babel/types';
import { Preprocessor } from 'content-tag';
import type { Parser } from 'prettier';
import { parsers as babelParsers } from 'prettier/plugins/babel.js';

import { PRINTER_NAME } from './config';
import type { Options } from './options.js';
import type { GlimmerTemplate } from './types/glimmer';
import { assert } from './utils';

const typescript = babelParsers['babel-ts'] as Parser<Node | undefined>;
const p = new Preprocessor();

interface Prepared {
  output: string;
  templateInfos: {
    type: 'expression' | 'class-member';
    tagName: 'template';
    contents: string;
    range: {
      start: number;
      end: number;
    };
    contentRange: {
      start: number;
      end: number;
    };
    startRange: {
      end: number;
      start: number;
    };
    endRange: {
      start: number;
      end: number;
    };
  }[];
}

interface PreprocessedResult {
  /** Range of the template including <template></template> tags */
  templateRange: readonly [start: number, end: number];
  /** Range of the template content, excluding <template></template> tags */
  range: readonly [start: number, end: number];
  ast: GlimmerTemplate;
}

/** Traverses the AST and replaces the transformed template parts with other AST */
function convertAst(
  result: { ast: Node; code: string },
  preprocessedResult: PreprocessedResult[],
): void {
  // FIXME:
  const templateInfos = preprocessedResult;
  let counter = 0;

  traverse(result.ast, {
    enter(path) {
      const node = path.node;
      if (
        node.type === 'ObjectExpression' ||
        node.type === 'BlockStatement' ||
        node.type === 'StaticBlock'
      ) {
        const range = node.range as [number, number];

        const template = templateInfos.find(
          (t) =>
            (t.templateRange[0] === range[0] &&
              t.templateRange[1] === range[1]) ||
            (t.templateRange[0] === range[0] - 1 &&
              t.templateRange[1] === range[1] + 1) ||
            (t.templateRange[0] === range[0] &&
              t.templateRange[1] === range[1] + 1),
        );

        if (!template) {
          return null;
        }
        counter++;
        assert('expected ast on template', template.ast);
        const { ast } = template;
        ast.extra.isAlreadyExportDefault =
          path.parent.type === 'ExportDefaultDeclaration' ||
          path.parentPath?.parent.type === 'ExportDefaultDeclaration';
        ast.extra.isDefaultTemplate =
          path.parent.type === 'ExportDefaultDeclaration' ||
          path.parent.type === 'Program' ||
          (path.parent.type === 'ExpressionStatement' &&
            path.parentPath?.parent.type === 'Program') ||
          (path.parent.type === 'TSAsExpression' &&
            path.parentPath?.parentPath?.parent.type === 'Program') ||
          path.parentPath?.parent.type === 'ExportDefaultDeclaration';

        ast.extra.isAssignment =
          !ast.extra.isDefaultTemplate && node.type !== 'StaticBlock';

        ast.leadingComments = node.leadingComments as Comment[];
        Object.assign(node, ast);
      }
      return null;
    },
  });

  if (counter !== templateInfos.length) {
    throw new Error('failed to process all templates');
  }
}

/**
 * Preprocesses the template info, parsing the template content to Glimmer AST,
 * fixing the offsets and locations of all nodes also calculates the block
 * params locations & ranges and adding it to the info
 */
function preprocess(info: Prepared, code: string): PreprocessedResult[] {
  return info.templateInfos.map((tpl) => {
    const range = [tpl.contentRange.start, tpl.contentRange.end] as const;
    const templateRange = [tpl.range.start, tpl.range.end] as const;
    const template = code.slice(...range);
    return {
      templateRange,
      range,
      ast: {
        type: 'FunctionDeclaration',
        leadingComments: [],
        range: [templateRange[0], templateRange[1]],
        start: templateRange[0],
        end: templateRange[1],
        extra: {
          isGlimmerTemplate: true,
          isDefaultTemplate: false,
          isAssignment: false,
          isAlreadyExportDefault: false,
          template,
        },
      },
    };
  });
}

function replaceRange(
  s: string,
  start: number,
  end: number,
  substitute: string,
): string {
  return s.slice(0, start) + substitute + s.slice(end);
}

function prepare(code: string): Prepared {
  let jsCode = code;
  const result = p.parse(code) as Prepared['templateInfos'];
  for (const tplInfo of result.reverse()) {
    const lineBreaks = [...tplInfo.contents].reduce(
      (previous, current) => previous + (current === '\n' ? 1 : 0),
      0,
    );
    if (tplInfo.type === 'class-member') {
      const tplLength = tplInfo.range.end - tplInfo.range.start;
      const spaces = tplLength - 'static{`'.length - '`}'.length - lineBreaks;
      const total = ' '.repeat(spaces) + '\n'.repeat(lineBreaks);
      const replacementCode = `static{\`${total}\`}`;
      jsCode = replaceRange(
        jsCode,
        tplInfo.range.start,
        tplInfo.range.end,
        replacementCode,
      );
    } else {
      const tplLength = tplInfo.range.end - tplInfo.range.start;
      const nextWord = code.slice(tplInfo.range.end).match(/\S+/);
      let prefix = '{';
      let suffix = '}';
      if (nextWord && nextWord[0] === 'as') {
        prefix = '(' + prefix;
        suffix = suffix + ')';
      } else if (!nextWord || ![',', ')'].includes(nextWord[0][0] || '')) {
        suffix += ';';
      }
      const spaces = tplLength - prefix.length - suffix.length - lineBreaks;
      const total = ' '.repeat(spaces) + '\n'.repeat(lineBreaks);
      const replacementCode = `${prefix}${total}${suffix}`;
      jsCode = replaceRange(
        jsCode,
        tplInfo.range.start,
        tplInfo.range.end,
        replacementCode,
      );
    }
  }
  return {
    templateInfos: result,
    output: jsCode,
  };
}

export const parser: Parser<Node | undefined> = {
  ...typescript,
  astFormat: PRINTER_NAME,

  async parse(code: string, options: Options): Promise<Node> {
    const prepared = prepare(code);
    const preprocessedResult = preprocess(prepared, code);
    const ast = await typescript.parse(prepared.output, options);
    assert('expected ast', ast);
    convertAst({ ast, code }, preprocessedResult);
    return ast;
  },
};
