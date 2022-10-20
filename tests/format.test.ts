import fs from 'fs';
import path from 'path';
import { format, Options } from 'prettier';
import { describe, expect, test } from 'vitest';

import { PARSER_NAME } from '../src/config';
import plugin from '../src/main';

interface TestCase {
  name: string;
  code: string;
}

const formatOptions: Options = {
  parser: PARSER_NAME,
  plugins: [plugin]
};

describe('format', async () => {
  const caseDir = path.join(__dirname, './cases');
  const cases = await getCases(__dirname, caseDir);

  for (let testCase of cases) {
    test(`it formats ${testCase.name}`, () => {
      let result = format(testCase.code, formatOptions);
      expect(result).toMatchSnapshot();
    });
  }
});

async function getCases(
  baseDir: fs.PathLike,
  dir: fs.PathLike
): Promise<TestCase[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const cases = await Promise.all(
    entries.map(async entry => {
      if (entry.isDirectory()) {
        return getCases(baseDir, path.join(dir.toString(), entry.name));
      } else {
        const filename = path.join(dir.toString(), entry.name);
        const code = fs.readFileSync(filename, 'utf8');
        const name = path.relative(baseDir.toString(), filename);

        return {
          name,
          code
        };
      }
    })
  );

  return ([] as TestCase[]).concat(...cases);
}
