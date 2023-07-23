import type { Node } from '@babel/types';
import type { Parser, Plugin, Printer, SupportLanguage } from 'prettier';
import { PARSER_NAME, PRINTER_NAME } from './config';
import { options } from './options';
import { parser } from './parse';
import { printer } from './print/index';

const languages: SupportLanguage[] = [
  {
    extensions: ['.gjs', '.gts'],
    name: 'Ember Template Tag',
    parsers: [PARSER_NAME],
  },
];

const parsers: Record<string, Parser<Node | undefined>> = {
  [PARSER_NAME]: parser,
};

const printers: Record<string, Printer<Node | undefined>> = {
  [PRINTER_NAME]: printer,
};

const plugin: Plugin<Node | undefined> = {
  languages,
  parsers,
  printers,
  options,
};

export default plugin;
