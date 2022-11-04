import { format as prettierFormat } from 'prettier';

import { PARSER_NAME } from '../../src/config';
import plugin from '../../src/main';
import type { Options } from '../../src/options';

const DEFAULT_OPTIONS: Partial<Options> = {
  parser: PARSER_NAME,
  plugins: [plugin],
};

/**
 * Formats the given code with default options that ensure our plugin is used.
 *
 * Optionally, provide Options overrides, which will be merged with the default
 * options.
 */
export function format(code: string, overrides: Partial<Options> = {}): string {
  return prettierFormat(code, {
    ...DEFAULT_OPTIONS,
    ...overrides,
  });
}
