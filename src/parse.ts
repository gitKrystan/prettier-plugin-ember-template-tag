import { traverse } from '@babel/core';
import type { Node } from '@babel/types';
import {
  isBinaryExpression,
  isMemberExpression,
  isTaggedTemplateExpression,
} from '@babel/types';
// @ts-expect-error FIXME: TS7016 Is this a hack? IDK!
import { defineAliasedType } from '@babel/types/lib/definitions/utils';
import { getTemplateLocals } from '@glimmer/syntax';
import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import type { Parser } from 'prettier';
import { parsers as babelParsers } from 'prettier/parser-babel';

import {
  GLIMMER_EXPRESSION_TYPE,
  PRINTER_NAME,
  TEMPLATE_TAG_NAME,
  TEMPLATE_TAG_PLACEHOLDER,
} from './config';
import type { Options } from './options';
import { definePrinter } from './print/index';
import type { BaseNode } from './types/ast';
import { extractGlimmerExpression } from './types/glimmer';
import {
  hasGlimmerArrayExpression,
  isRawGlimmerArrayExpression,
  isRawGlimmerCallExpression,
  isRawGlimmerClassProperty,
} from './types/raw';
import { hasAmbiguousNextLine } from './utils/ambiguity';

const typescript = babelParsers['babel-ts'] as Parser<BaseNode>;

// FIXME: This is necessary for babel to not freak out with the custom type.
// If we keep this code long-term we should augment the babel types
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const defineType = defineAliasedType('Glimmer');

const preprocess: Required<Parser<BaseNode>>['preprocess'] = (
  text,
  options
) => {
  const preprocessed = preprocessEmbeddedTemplates(text, {
    getTemplateLocals,

    templateTag: TEMPLATE_TAG_NAME,
    templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,

    includeSourceMaps: false,
    includeTemplateTokens: false,

    relativePath: options.filepath,
  }).output;

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
    // FIXME: This is necessary for babel to not freak out with the custom type.
    // If we keep this code long-term we should augment the babel types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    defineType(GLIMMER_EXPRESSION_TYPE, {
      inherits: 'TemplateExpression',
      aliases: ['Expression'],
    });
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
          (hasGlimmerArrayExpression(node.left) ||
            hasGlimmerArrayExpression(node.right))
        ) {
          throw new SyntaxError(
            'Ember <template> tag used in binary expression.'
          );
        } else if (
          isTaggedTemplateExpression(node) &&
          hasGlimmerArrayExpression(node.tag)
        ) {
          throw new SyntaxError(
            'Ember <template> tag used as tagged template expression.'
          );
        } else if (
          isMemberExpression(node) &&
          hasGlimmerArrayExpression(node.object)
        ) {
          throw new SyntaxError(
            'Ember <template> tag used as member expression.'
          );
        }
      },
      ArrayExpression(path) {
        const node = path.node;
        if (isRawGlimmerArrayExpression(node)) {
          const newNode = extractGlimmerExpression(
            node.elements[0].arguments[0],
            node,
            hasAmbiguousNextLine(path, options)
          );
          // HACK: Babel types don't allow this
          path.replaceWith(newNode as unknown as Node);
        }
      },
      ClassProperty(path) {
        const node = path.node;
        if (isRawGlimmerClassProperty(node)) {
          const newNode = extractGlimmerExpression(node.key.arguments[0], node);
          // HACK: Babel types don't allow this
          path.replaceWith(newNode as unknown as Node);
        }
      },
      CallExpression(path) {
        const node = path.node;
        if (isRawGlimmerCallExpression(node)) {
          throw new SyntaxError('Found unhandled RawGlimmerCallExpression');
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
