import type { Parser, Plugin, Printer, SupportLanguage } from 'prettier';

import { PARSER_NAME, PRINTER_NAME } from './config';
import { options } from './options';
import { parser } from './parse';
import { printer } from './print/index';
import type { BaseNode } from './types/ast';

// Can remove once we remove Node 14 from engines
import 'ts-replace-all';

const languages: SupportLanguage[] = [
  {
    extensions: ['.gjs', '.gts'],
    name: 'Ember Template Tag',
    parsers: [PARSER_NAME],
  },
];

const parsers: Record<string, Parser<BaseNode | undefined>> = {
  [PARSER_NAME]: parser,
};

const printers: Record<string, Printer<BaseNode | undefined>> = {
  [PRINTER_NAME]: printer,
};

const plugin: Plugin<BaseNode | undefined> = {
  languages,
  parsers,
  printers,
  options,
};

export default plugin;
