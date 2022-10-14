import type { BaseNode } from 'estree';
import type { Parser, ParserOptions, Printer, SupportLanguage } from 'prettier';
import { parsers as babelParsers } from 'prettier/parser-babel';

import { preprocess } from './preprocess';
import { definePrinter, printer } from './print/index';

const typescript = babelParsers['babel-ts'] as Parser<BaseNode>;

const PARSER_NAME = 'ember-template-tag';
const PRINTER_NAME = 'ember-template-tag-estree';

export const languages: SupportLanguage[] = [
  {
    extensions: ['.gjs'],
    name: 'Ember Template Tag',
    parsers: [PARSER_NAME]
  }
];

export const parsers: Record<string, Parser<BaseNode>> = {
  [PARSER_NAME]: {
    ...typescript,
    astFormat: PRINTER_NAME,

    preprocess(text: string, options: ParserOptions<BaseNode>): string {
      definePrinter(options);
      let js = preprocess(text, options);
      return typescript.preprocess?.(js, options) ?? js;
    }
  }
};

export const printers: Record<string, Printer<BaseNode>> = {
  [PRINTER_NAME]: printer
};
