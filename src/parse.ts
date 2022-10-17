import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import type { BaseNode } from 'estree';
import type { Parser, ParserOptions } from 'prettier';
import { parsers as babelParsers } from 'prettier/parser-babel';

import { PRINTER_NAME } from './config';
import { definePrinter } from './print/index';

const typescript = babelParsers['babel-ts'] as Parser<BaseNode>;

import { TEMPLATE_TAG_NAME, TEMPLATE_TAG_PLACEHOLDER } from './config';

const preprocess: Required<Parser<BaseNode>>['preprocess'] = (
  text,
  options
) => {
  return preprocessEmbeddedTemplates(text, {
    // FIXME: Need to figure this out for ESLint but probably OK not to do it
    // for prettier support?
    getTemplateLocals(_template: string): string[] {
      return [];
    },

    templateTag: TEMPLATE_TAG_NAME,
    templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,

    includeSourceMaps: false,
    includeTemplateTokens: false,

    relativePath: options.filepath
  }).output;
};

export const parser: Parser<BaseNode> = {
  ...typescript,
  astFormat: PRINTER_NAME,

  preprocess(text: string, options: ParserOptions<BaseNode>): string {
    definePrinter(options);
    let js = preprocess(text, options);
    return typescript.preprocess?.(js, options) ?? js;
  }
};
