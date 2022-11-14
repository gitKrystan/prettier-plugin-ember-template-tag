import { traverse } from '@babel/core';
import type { Node } from '@babel/types';
// @ts-expect-error FIXME: TS7016 Is this a hack? IDK!
import { defineAliasedType } from '@babel/types/lib/definitions/utils';
import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import type { Parser } from 'prettier';
import { parsers as babelParsers } from 'prettier/parser-babel';
import { getTemplateLocals } from '@glimmer/syntax';

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
  return preprocessEmbeddedTemplates(text, {
    getTemplateLocals,

    templateTag: TEMPLATE_TAG_NAME,
    templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,

    includeSourceMaps: false,
    includeTemplateTokens: false,

    relativePath: options.filepath,
  }).output;
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
