import fs from 'fs';
import path from 'path';

export interface TestCase {
  name: string;
  code: string;
}

/**
 * Recursively retrieves all case files from the `dir` within the `baseDir` and
 * returns an array of `TestCase` objects with information about each case.
 */
export async function getCases(
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

/** Gets all of the Test Cases in the `cases` directory. */
export async function getAllCases(): Promise<TestCase[]> {
  const caseDir = path.join(__dirname, '../cases');
  return await getCases(__dirname, caseDir);
}
