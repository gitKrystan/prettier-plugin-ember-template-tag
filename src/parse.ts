import { traverse } from '@babel/core';
import type { Node } from '@babel/types';
import { type Comment } from '@babel/types';
import { Preprocessor } from 'content-tag';
import type { Parser } from 'prettier';
import { parsers as babelParsers } from 'prettier/plugins/babel.js';

import { PRINTER_NAME } from './config';
import type { Options } from './options.js';
import { assert } from './utils';

const typescript = babelParsers['babel-ts'] as Parser<Node | undefined>;
const p = new Preprocessor();

export interface TemplateNode {
  type: 'FunctionDeclaration';
  leadingComments: Comment[];
  range: [number, number];
  start: number;
  end: number;
  extra: {
    isGlimmerTemplate: boolean;
    isDefaultTemplate: boolean;
    isAssignment: boolean;
    isAlreadyExportDefault: boolean;
    template: string;
  };
}

interface PreprocessedResult {
  templateVisitorKeys: Record<string, string[]>;
  templateInfos: {
    /** Range of the template including <template></template> tags */
    templateRange: [number, number];
    /** Range of the template content, excluding <template></template> tags */
    range: [number, number];
    ast: TemplateNode | undefined;
  }[];
}

/** Traverses the AST and replaces the transformed template parts with other AST */
function convertAst(
  result: { ast: Node; code: string },
  preprocessedResult: PreprocessedResult,
): void {
  const templateInfos = preprocessedResult.templateInfos;
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
        const ast = template.ast as TemplateNode;
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

interface Info {
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

/**
 * Preprocesses the template info, parsing the template content to Glimmer AST,
 * fixing the offsets and locations of all nodes also calculates the block
 * params locations & ranges and adding it to the info
 */
function preprocessGlimmerTemplates(
  info: Info,
  code: string,
): PreprocessedResult {
  const templateInfos = info.templateInfos.map((r) => ({
    range: [r.contentRange.start, r.contentRange.end] as [number, number],
    templateRange: [r.range.start, r.range.end] as [number, number],
    ast: undefined as undefined | TemplateNode,
  }));
  const templateVisitorKeys = {};
  for (const tpl of templateInfos) {
    const range = tpl.range;
    const template = code.slice(...range);
    const ast: TemplateNode = {
      type: 'FunctionDeclaration',
      leadingComments: [],
      range: [tpl.templateRange[0], tpl.templateRange[1]],
      start: tpl.templateRange[0],
      end: tpl.templateRange[1],
      extra: {
        isGlimmerTemplate: true,
        isDefaultTemplate: false,
        isAssignment: false,
        isAlreadyExportDefault: false,
        template,
      },
    };
    tpl.ast = ast;
  }
  return {
    templateVisitorKeys,
    templateInfos,
  };
}

function replaceRange(
  s: string,
  start: number,
  end: number,
  substitute: string,
): string {
  return s.slice(0, start) + substitute + s.slice(end);
}

function transformForPrettier(code: string): Info {
  let jsCode = code;
  const result = p.parse(code) as Info['templateInfos'];
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

  preprocess(text: string): string {
    return text;
  },

  async parse(code: string, options: Options): Promise<Node> {
    const info = transformForPrettier(code);
    const ast = await typescript.parse(info.output, options);
    const preprocessedResult = preprocessGlimmerTemplates(info, code);
    assert('expected ast', ast);
    convertAst({ ast, code }, preprocessedResult);
    return ast;
  },
};
