import { describe, test, expect } from 'vitest';

describe('hello world', () => {
  test('it says hello', () => {
    expect('hello').toBe('hello');
  })
})