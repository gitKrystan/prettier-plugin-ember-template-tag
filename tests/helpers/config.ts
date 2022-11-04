import path from 'path';
import type { Options } from 'prettier';
import { describe, expect, test } from 'vitest';

import { AMBIGUOUS_PLACEHOLDER } from '../helpers/ambiguous';
import type { TestCase } from '../helpers/cases';
import { getCases } from '../helpers/cases';
import { format } from '../helpers/format';

export interface Config {
  name: string;
  options?: Options;
}

/**
 * Generates a test for each case in the `cases` directory and tests it against
 * the given config.
 *
 * You can optionally pass in a `testCallback`. If no `testCallback` is
 * supplied, it will run a simple `format` test with ambiguous expressions
 * removed.
 *
 * You can optionally pass in a `caseFilter`. If no `caseFilter` is supplied, it
 * will run the test against all cases.
 */
export function describeConfig(
  config: Config,
  testCallback = simpleConfigTest,
  caseFilter = allCases
): void {
  describe('config', async () => {
    const caseDir = path.join(__dirname, '../cases');
    const cases = (await getCases(__dirname, caseDir)).filter(caseFilter);

    describe(config.name, () => {
      for (const testCase of cases) {
        testCallback(config, testCase);
      }
    });
  });
}

function simpleConfigTest(config: Config, testCase: TestCase): void {
  test(`it formats ${testCase.name}`, () => {
    const code = testCase.code.replaceAll(AMBIGUOUS_PLACEHOLDER, '');
    const result = format(code, config.options);
    expect(result).toMatchSnapshot();
  });
}

function allCases(
  _testCase: TestCase,
  _index: number,
  _cases: TestCase[]
): boolean {
  return true;
}
