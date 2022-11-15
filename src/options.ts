import type {
  BooleanSupportOption,
  ParserOptions,
  SupportOptions,
} from 'prettier';

import type { BaseNode } from './types/ast';

export interface Options extends ParserOptions<BaseNode | undefined> {
  templateExportDefault?: boolean;
  templateSingleQuote?: boolean;
  __inputWasPreprocessed?: boolean;
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

const __inputWasPreprocessed: BooleanSupportOption = {
  since: '0.1.0',
  category: 'Format',
  type: 'boolean',
  description:
    'Internal: If true, the template was preprocessed before being run through Prettier.',
};

export const options: SupportOptions = {
  templateExportDefault,
  templateSingleQuote,
  __inputWasPreprocessed,
};
