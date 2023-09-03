import type { Plugin } from 'prettier';
import { format as prettierFormat } from 'prettier';

import { PARSER_NAME } from '../../src/config.js';
import plugin from '../../src/main.js';
import type { Options } from '../../src/options.js';

const DEFAULT_OPTIONS: Partial<Options> = {
  parser: PARSER_NAME,
  plugins: [plugin as Plugin],
};

/**
 * Formats the given code with default options that ensure our plugin is used.
 *
 * Optionally, provide Options overrides, which will be merged with the default
 * options.
 */
export async function format(
  code: string,
  overrides: Partial<Options> = {},
): Promise<string> {
  return await prettierFormat(code, {
    ...DEFAULT_OPTIONS,
    ...overrides,
  });
}
