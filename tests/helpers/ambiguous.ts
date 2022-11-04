import { describe, expect, test } from 'vitest';

import type { Options } from '../../src/options';
import type { TestCase } from '../helpers/cases';
import { getAllCases } from '../helpers/cases';
import { format } from '../helpers/format';
import type { Config } from './make-suite';

/**
 * Add this comment to any test case and it will be replaced by the
 * `AMBIGUOUS_EXPRESSIONS` below in the test cases.
 */
export const AMBIGUOUS_PLACEHOLDER = '/*AMBIGUOUS*/';

const AMBIGUOUS_EXPRESSIONS = [
  '(oops) => {}',
  '(oh, no) => {}',
  '["oops"]',
  '`oops`',
  '/oops/',
  '+"oops"',
  '-"oops"',
  '<template>oops</template>',
];

/**
 * `caseFilter` for `describeConfig` that will return only cases that include
 * the `AMBIGUOUS_PLACEHOLDER`.
 */
export async function getAmbiguousCases(): Promise<TestCase[]> {
  return (await getAllCases()).filter((c) =>
    c.code.includes(AMBIGUOUS_PLACEHOLDER)
  );
}

/**
 * Tests the provided `config` and `testCase` against each ambiguous expression
 * from `AMBIGUOUS_EXPRESSIONS`, with and without user-provided semicolons.
 *
 * @see https://github.com/gitKrystan/prettier-plugin-ember-template-tag/issues/1 for more details
 */
export function ambiguousExpressionTest(
  config: Config,
  testCase: TestCase
): void {
  for (const ambiguousExpression of AMBIGUOUS_EXPRESSIONS) {
    describe(ambiguousExpression, () => {
      describe('without semi', () => {
        test(`it formats ${testCase.name}`, () => {
          const code = testCase.code
            .replaceAll(AMBIGUOUS_PLACEHOLDER, ambiguousExpression)
            .replaceAll(';', '');
          behavesLikeFormattedAmbiguousCase(code, config.options);
        });
      });
      describe('with semi', () => {
        test(`it formats ${testCase.name}`, () => {
          const code = testCase.code
            .replaceAll(AMBIGUOUS_PLACEHOLDER, ambiguousExpression)
            .replaceAll(/<\/template>\n/g, '</template>;')
            .replaceAll(/<Signature>\n/g, '<Signature>;');
          behavesLikeFormattedAmbiguousCase(code, config.options);
        });
      });
    });
  }
}

function behavesLikeFormattedAmbiguousCase(
  code: string,
  formatOptions: Partial<Options> = {}
): void {
  try {
    const result = format(code, formatOptions);
    expect(result).toMatchSnapshot();
  } catch (e: unknown) {
    // Some of the ambiguous cases are Syntax Errors when parsed
    const isSyntaxError =
      e instanceof SyntaxError || String(e).startsWith('SyntaxError');
    if (!isSyntaxError) {
      throw e;
    }
    expect(isSyntaxError, 'Expected SyntaxError').toBeTruthy();
  }
}
