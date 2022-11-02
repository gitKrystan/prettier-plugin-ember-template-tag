/** Checks if the given value is a `Record<string, unknown>`. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

/**
 * Throws an error if the condition is false.
 *
 * If no condition is provided, will always throw.
 */
export function assert(
  message: string,
  condition?: unknown
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/** Asserts that the given item is not undefined. */
export function assertExists<T>(
  item: T | undefined,
  message = 'assertExists failed'
): T {
  assert(message, item !== undefined);
  return item;
}
