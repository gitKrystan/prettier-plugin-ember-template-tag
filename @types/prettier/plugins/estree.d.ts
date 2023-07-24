import type { Printer, SupportLanguage, SupportOptions } from 'prettier';

declare const printers: {
  estree: Printer;
  'estree-json': Printer;
};

declare const languages: SupportLanguage[];

declare const options: SupportOptions;
