import { traverse } from '@babel/core';
import type { Comment, Node } from '@babel/types';
import { Preprocessor } from 'content-tag';
import type { Parser } from 'prettier';
import { parsers as babelParsers } from 'prettier/plugins/babel.js';

import { PRINTER_NAME } from '../config';
import type { Options } from '../options.js';
import type { GlimmerTemplate, RawGlimmerTemplate } from '../types/glimmer';
import { isDefaultTemplate } from '../types/glimmer';
import { assert } from '../utils';
import { normalizeWhitespace } from './whitespace';

const typescript = babelParsers['babel-ts'] as Parser<Node | undefined>;
const p = new Preprocessor();

interface Preprocessed {
  code: string;
  results: PreprocessedResult[];
}

interface PreprocessedResult {
  /**
   * Range of the contents, inclusive of inclusive of the
   * `<template></template>` tags.
   */
  range: readonly [start: number, end: number];

  /**
   * Range of the template contents, not inclusive of the
   * `<template></template>` tags.
   */
  contentRange: readonly [start: number, end: number];

  templateNode: GlimmerTemplate;
}

/** Traverses the AST and replaces the transformed template parts with other AST */
function convertAst(ast: Node, preprocessedResult: PreprocessedResult[]): void {
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

        const preprocessedTemplate = preprocessedResult.find(
          (p) =>
            (p.range[0] === range[0] && p.range[1] === range[1]) ||
            (p.range[0] === range[0] - 1 && p.range[1] === range[1] + 1) ||
            (p.range[0] === range[0] && p.range[1] === range[1] + 1),
        );

        if (!preprocessedTemplate) {
          return null;
        }

        const { templateNode } = preprocessedTemplate;
        templateNode.extra.isDefaultTemplate = isDefaultTemplate(path);

        templateNode.leadingComments = node.leadingComments as Comment[];

        Object.assign(node, templateNode);

        counter++;
      }
      return null;
    },
  });

  if (counter !== preprocessedResult.length) {
    throw new Error('failed to process all templates');
  }
}

/**
 * Pre-processes the template info, parsing the template content to Glimmer AST,
 * fixing the offsets and locations of all nodes also calculates the block
 * params locations & ranges and adding it to the info
 */
function preprocess(code: string): Preprocessed {
  const templateNodes = p.parse(code) as RawGlimmerTemplate[];
  const results: PreprocessedResult[] = [];
  let output = code;
  for (const templateNode of templateNodes.reverse()) {
    output = normalizeWhitespace(templateNode, code, output);

    const contentRange = [
      templateNode.contentRange.start,
      templateNode.contentRange.end,
    ] as const;
    const range = [templateNode.range.start, templateNode.range.end] as const;
    const template = code.slice(...contentRange);
    const ast: GlimmerTemplate = {
      type: 'FunctionDeclaration',
      leadingComments: [],
      range: [range[0], range[1]],
      start: range[0],
      end: range[1],
      extra: {
        isGlimmerTemplate: true,
        isDefaultTemplate: false,
        template,
      },
    };
    results.push({
      range,
      contentRange,
      templateNode: ast,
    } satisfies PreprocessedResult);
  }

  return { results, code: output };
}

export const parser: Parser<Node | undefined> = {
  ...typescript,
  astFormat: PRINTER_NAME,

  async parse(code: string, options: Options): Promise<Node> {
    const preprocessed = preprocess(code);
    const ast = await typescript.parse(preprocessed.code, options);
    assert('expected ast', ast);
    convertAst(ast, preprocessed.results);
    return ast;
  },
};
