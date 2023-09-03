import type { doc } from 'prettier';
import { isRecord } from '../utils/index.js';

/** Type predicate */
export function isDocGroup(value: unknown): value is doc.builders.Group {
  return isRecord(value) && value['type'] === 'group';
}
