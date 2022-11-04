import fs from 'fs';
import path from 'path';
import type { Options } from 'prettier';
import { format } from 'prettier';
import { describe, expect, test } from 'vitest';

import { PARSER_NAME } from '../src/config';
import plugin from '../src/main';

interface TestCase {
  name: string;
  code: string;
}

const DEFAULT_OPTIONS: Options = {
  parser: PARSER_NAME,
  plugins: [plugin],
};

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

const AMBIGUOUS_PLACEHOLDER = '/*AMBIGUOUS*/';

describe('format', async () => {
  const caseDir = path.join(__dirname, './cases');
  const cases = await getCases(__dirname, caseDir);

  for (const config of [
    { name: 'default', options: DEFAULT_OPTIONS },
    {
      name: 'semi: false',
      options: { ...DEFAULT_OPTIONS, semi: false },
    },
  ]) {
    describe(`with config \`${config.name}\``, () => {
      for (const testCase of cases) {
        test(`it formats ${testCase.name}`, () => {
          const code = testCase.code.replaceAll(AMBIGUOUS_PLACEHOLDER, '');
          const result = format(code, {
            ...DEFAULT_OPTIONS,
            ...config.options,
          });
          expect(result).toMatchSnapshot();
        });
      }
    });
  }

  describe('ambiguous', () => {
    for (const ambiguousExpression of AMBIGUOUS_EXPRESSIONS) {
      describe(`\`${ambiguousExpression}\``, () => {
        for (const config of [
          { name: 'default', options: DEFAULT_OPTIONS },
          {
            name: 'arrowParens: "avoid"',
            options: { ...DEFAULT_OPTIONS, arrowParens: 'avoid' as const },
          },
          {
            name: 'semi: false',
            options: { ...DEFAULT_OPTIONS, semi: false },
          },
        ]) {
          describe(`with config \`${config.name}\``, () => {
            for (const testCase of cases.filter((c) =>
              c.code.includes(AMBIGUOUS_PLACEHOLDER)
            )) {
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
            }
          });
        }
      });
    }
  });
});

async function getCases(
  baseDir: fs.PathLike,
  dir: fs.PathLike
): Promise<TestCase[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const cases = await Promise.all(
    entries.map(async (entry) => {
      if (entry.isDirectory()) {
        return getCases(baseDir, path.join(dir.toString(), entry.name));
      } else {
        const filename = path.join(dir.toString(), entry.name);
        const code = fs.readFileSync(filename, 'utf8');
        const name = path.relative(baseDir.toString(), filename);

        return {
          name,
          code,
        };
      }
    })
  );

  return ([] as TestCase[]).concat(...cases);
}

function behavesLikeFormattedAmbiguousCase(
  code: string,
  formatOptions: Options
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
