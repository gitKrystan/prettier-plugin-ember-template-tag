import type {
  BooleanSupportOption,
  ParserOptions,
  SupportOptions,
} from 'prettier';

import type { BaseNode } from './types/ast';

export interface Options extends ParserOptions<BaseNode> {
  templateExportDefault?: boolean;
  templateSingleQuote?: boolean;
}

const templateExportDefault: BooleanSupportOption = {
  since: '0.1.0',
  category: 'Format',
  type: 'boolean',
  default: false,
  description: 'Prepend default export template tags with "export default".',
};

/**
 * Extracts a valid `templateSingleQuote` option out of the provided options. If
 * `templateSingleQuote` is defined, it will be used, otherwise the value for
 * `singleQuote` will be inherited.
 */
export function getTemplateSingleQuote(options: Options): boolean {
  const { singleQuote, templateSingleQuote } = options;
  return typeof templateSingleQuote === 'boolean'
    ? templateSingleQuote
    : singleQuote;
}

const templateSingleQuote: BooleanSupportOption = {
  since: '0.0.3',
  category: 'Format',
  type: 'boolean',
  description:
    'Use single quotes instead of double quotes within template tags.',
};

export const options: SupportOptions = {
  templateExportDefault,
  templateSingleQuote,
};
