import { traverse } from '@babel/core';
import { isBinaryExpression, isExpressionStatement, Node } from '@babel/types';
import { getTemplateLocals } from '@glimmer/syntax';
import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import type { Parser } from 'prettier';
import { parsers as babelParsers } from 'prettier/parser-babel';

import {
  PRINTER_NAME,
  TEMPLATE_TAG_NAME,
  TEMPLATE_TAG_PLACEHOLDER,
} from './config';
import type { Options } from './options';
import { definePrinter } from './print/index';
import type { BaseNode } from './types/ast';
import {
  isRawGlimmerArrayExpression,
  isRawGlimmerCallExpression,
  isRawGlimmerClassProperty,
} from './types/raw';
import { hasAmbiguousNextLine } from './utils/ambiguity';

const typescript = babelParsers['babel-ts'] as Parser<BaseNode>;

/**
 * 1. Transforms the given gjs/gts code into valid js/ts (if this has not already
 *    been done by another library).
 * 2. Detects if the given code has already been preprocessed so that we don't
 *    un-preprocess it in the final output (allowing the library that
 *    preprocessed the code to do so).
 * 3. Transforms the preprocessed `[__GLIMMER_EXPRESSION(...)]` default export
 *    sugar into `export default [__GLIMMER_EXPRESSION(...)]` so that it is not
 *    incorrectly parsed as an ExpressionStatement, which has lots of special-
 *    casing in Prettier that is not relevant to template tags.
 */
const preprocess: Required<Parser<BaseNode>>['preprocess'] = (
  text: string,
  options: Options
) => {
  let preprocessed: string;
  if (text.includes(TEMPLATE_TAG_PLACEHOLDER)) {
    // This happens when Prettier is being run via eslint + eslint-plugin-ember
    // See https://github.com/ember-cli/eslint-plugin-ember/issues/1659
    options.__inputWasPreprocessed = true;
    preprocessed = text;
  } else {
    options.__inputWasPreprocessed = false;
    preprocessed = preprocessEmbeddedTemplates(text, {
      getTemplateLocals,

      templateTag: TEMPLATE_TAG_NAME,
      templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,

      includeSourceMaps: false,
      includeTemplateTokens: false,

      relativePath: options.filepath,
    }).output;
  }

  const placeholderOpen = `[${TEMPLATE_TAG_PLACEHOLDER}`; // intentionally missing ]
  const sugaredDefaultExport = new RegExp(`^\\s*\\(?\\s*\\${placeholderOpen}`);
  const desugaredDefaultExport = `export default ${placeholderOpen}`;
  return preprocessed
    .split(/\r?\n/)
    .map((line, index, array) => {
      const previousLine = findPreviousLine(index, array);
      if (
        previousLine &&
        (previousLine.includes('prettier-ignore') ||
          previousLine.trim().endsWith('{'))
      ) {
        return line;
      } else {
        return line.replace(sugaredDefaultExport, desugaredDefaultExport);
      }
    })
    .join('\r\n');
};

export const parser: Parser<BaseNode> = {
  ...typescript,
  astFormat: PRINTER_NAME,

  preprocess(text: string, options: Options): string {
    definePrinter(options);
    const js = preprocess(text, options);
    return typescript.preprocess?.(js, options) ?? js;
  },

  parse(
    text: string,
    parsers: Record<string, Parser<unknown>>,
    options: Options
  ): BaseNode {
    const ast = typescript.parse(text, parsers, options);
    traverse(ast as Node, {
      enter(path) {
        const node = path.node;
        const parentNode = path.parentPath?.node;

        if (
          parentNode &&
          'property' in parentNode &&
          isRawGlimmerCallExpression(parentNode.property)
        ) {
          throw new SyntaxError(
            'Ember <template> tag used as an object property.'
          );
        } else if (
          isBinaryExpression(node) &&
          (checkForGlimmerArrayExpression(node.left) ||
            checkForGlimmerArrayExpression(node.right))
        ) {
          throw new SyntaxError(
            'Ember <template> tag used in binary expression.'
          );
        }

        if (
          isRawGlimmerArrayExpression(node) ||
          isRawGlimmerClassProperty(node)
        ) {
          const extra = {
            hasGlimmerExpression: true,
            forceSemi: hasAmbiguousNextLine(path, options),
          };
          if (typeof node.extra === 'object') {
            node.extra = { ...node.extra, ...extra };
          } else {
            node.extra = extra;
          }
        }
      },
    });
    return ast;
  },
};

function findPreviousLine(index: number, array: string[]): string | undefined {
  const previousIndex = index - 1;
  const previousLine = array[previousIndex];

  if (previousLine === undefined) {
    return undefined;
  } else if (previousLine.length) {
    return previousLine;
  } else {
    return findPreviousLine(previousIndex, array);
  }
}

function checkForGlimmerArrayExpression(node: Node): boolean {
  return (
    isRawGlimmerArrayExpression(node) ||
    ('expression' in node &&
      typeof node.expression === 'object' &&
      checkForGlimmerArrayExpression(node.expression))
  );
}
