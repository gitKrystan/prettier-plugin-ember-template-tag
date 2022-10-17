import type { BaseNode } from 'estree';
import type { Parser, Printer, SupportLanguage } from 'prettier';

import { PARSER_NAME, PRINTER_NAME } from './config';
import { parser } from './parse';
import { printer } from './print/index';

export const languages: SupportLanguage[] = [
  {
    extensions: ['.gjs', '.gts'],
    name: 'Ember Template Tag',
    parsers: [PARSER_NAME]
  }
];

export const parsers: Record<string, Parser<BaseNode>> = {
  [PARSER_NAME]: parser
};

export const printers: Record<string, Printer<BaseNode>> = {
  [PRINTER_NAME]: printer
};
