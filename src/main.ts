import type { Parser, Plugin, Printer, SupportLanguage } from 'prettier';

import { PARSER_NAME, PRINTER_NAME } from './config';
import { parser } from './parse';
import { printer } from './print/index';
import type { BaseNode } from './types/ast';

const languages: SupportLanguage[] = [
  {
    extensions: ['.gjs', '.gts'],
    name: 'Ember Template Tag',
    parsers: [PARSER_NAME],
  },
];

const parsers: Record<string, Parser<BaseNode>> = {
  [PARSER_NAME]: parser,
};

const printers: Record<string, Printer<BaseNode>> = {
  [PRINTER_NAME]: printer,
};

const plugin: Plugin<BaseNode> = {
  languages,
  parsers,
  printers,
};

export default plugin;
