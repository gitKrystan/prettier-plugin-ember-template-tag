import fs from 'fs';
import path from 'path';
import { format, Options } from 'prettier';
import { describe, expect, test } from 'vitest';

import { PARSER_NAME } from '../src/config';
import plugin from '../src/main';

const formatOptions: Options = {
  parser: PARSER_NAME,
  plugins: [plugin]
};

describe('format', () => {
  const caseDir = path.join(__dirname, './cases');
  const cases = fs.readdirSync(caseDir, { withFileTypes: true }).map(file => {
    const name = file.name;
    const filename = path.join(caseDir, name);
    const text = fs.readFileSync(filename, 'utf8');

    return {
      name: file.name,
      filename,
      code: text
    };
  });

  for (let testCase of cases) {
    test(`it formats ${testCase.name}`, () => {
      const code = `
        <template>
                what
              </template>
      `;
      let result = format(code, formatOptions);
      expect(result).toMatchSnapshot();
    });
  }
});
