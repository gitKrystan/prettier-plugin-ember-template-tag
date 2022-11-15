import { isRecord } from '../utils/index';
import type { doc } from 'prettier';

/** Type predicate */
export function isDocGroup(value: unknown): value is doc.builders.Group {
  return isRecord(value) && value['type'] === 'group';
}
