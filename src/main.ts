import type { BaseNode } from 'estree';
import type { Parser, ParserOptions, Printer, SupportLanguage } from 'prettier';
import { parsers as babelParsers } from 'prettier/parser-babel';

import { parse } from './parse';
import { estreePrinter, mergePrinters } from './print/index';

const PARSER_NAME = 'gjs-parse';
const PRINTER_NAME = 'gjs-ast';

export const languages: SupportLanguage[] = [
  {
    extensions: ['.gjs'],
    name: 'Ember Template Tag',
    parsers: [PARSER_NAME]
  }
];

export const parsers: Record<string, Parser<BaseNode>> = {
  [PARSER_NAME]: {
    ...babelParsers.babel,
    parse,
    astFormat: PRINTER_NAME,

    preprocess(text: string, options: ParserOptions<BaseNode>): string {
      mergePrinters(options);
      return babelParsers.babel.preprocess?.(text, options) ?? text;
    }
  }
};

export const printers: Record<string, Printer<BaseNode>> = {
  [PRINTER_NAME]: estreePrinter
};
