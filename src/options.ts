import type { Node } from '@babel/types';
import type {
  BooleanSupportOption,
  ParserOptions,
  SupportOptions,
} from 'prettier';

export interface Options extends ParserOptions<Node | undefined> {
  templateExportDefault?: boolean;
  templateSingleQuote?: boolean;
}

const templateExportDefault: BooleanSupportOption = {
  category: 'Format',
  type: 'boolean',
  default: false,
  description:
    'Prepend default export template tags with "export default". Since 0.1.0.',
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
  category: 'Format',
  type: 'boolean',
  description:
    'Use single quotes instead of double quotes within template tags. Since 0.0.3.',
};

export const options: SupportOptions = {
  templateExportDefault,
  templateSingleQuote,
};
