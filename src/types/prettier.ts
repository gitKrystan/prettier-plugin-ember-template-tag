import type { doc } from 'prettier';
import { isRecord } from '../utils/index';

/** Type predicate */
export function isDocGroup(value: unknown): value is doc.builders.Group {
  return isRecord(value) && value['type'] === 'group';
}
