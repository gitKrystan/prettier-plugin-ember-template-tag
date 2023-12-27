import type { Parsed as RawGlimmerTemplate } from 'content-tag';

const EMPTY_SPACE = ' ';

/**
 * Given a string (`original`), replaces the bytes in the given `range` with
 * equivalent bytes of empty space (' ') surrounded by the given prefix and
 * suffix. The total byte length will not change.
 *
 * Returns the resulting string.
 */
function replaceByteRange(
  original: string,
  range: { start: number; end: number },
  options: { prefix: string; suffix: string },
): string {
  // Convert the original string and the prefix, suffix to buffers for byte manipulation
  const originalBuffer = Buffer.from(original);
  const prefixBuffer = Buffer.from(options.prefix);
  const suffixBuffer = Buffer.from(options.suffix);

  // Validate range
  if (
    range.start < 0 ||
    range.end > originalBuffer.length ||
    range.start > range.end ||
    prefixBuffer.length + suffixBuffer.length > range.end - range.start
  ) {
    throw new Error(
      `Invalid byte range:\n\tstart=${range.start}\n\tend=${range.end}\n\tprefix=${options.prefix}\n\tsuffix=${options.suffix}\n\tstring=\n\t${original}`,
    );
  }

  // Adjust the space length to account for the prefix and suffix lengths
  const totalReplacementLength = range.end - range.start;
  // FIXME: Shouldn't need Math.max here because of the validation above
  const spaceLength = Math.max(
    0,
    totalReplacementLength - prefixBuffer.length - suffixBuffer.length,
  );

  // Create a buffer for the replacement
  const spaceBuffer = Buffer.alloc(spaceLength, EMPTY_SPACE);

  // Concatenate prefix, space, and suffix buffers
  const replacementBuffer = Buffer.concat([
    prefixBuffer,
    spaceBuffer,
    suffixBuffer,
  ]);

  // Create buffers for before and after the range using subarray
  const beforeRange = originalBuffer.subarray(0, range.start);
  const afterRange = originalBuffer.subarray(range.end);

  // Concatenate all parts and convert back to a string
  const result = Buffer.concat([beforeRange, replacementBuffer, afterRange]);

  if (result.length !== originalBuffer.length) {
    debugger;
    throw new Error(
      `Result length (${result.length}) does not match original length (${originalBuffer.length})`,
    );
  }

  return result.toString('utf-8');
}

/**
 * Replace the template with a parsable placeholder that takes up the same
 * range.
 */
export function preprocessTemplateRange(
  rawTemplate: RawGlimmerTemplate,
  code: string,
): string {
  let prefix: string;
  let suffix: string;

  if (rawTemplate.type === 'class-member') {
    prefix = 'static{`';
    suffix = '`}';
  } else {
    prefix = '{';
    suffix = '}';
    // FIXME: Don't bufferify code twice
    const codeBuffer = Buffer.from(code);
    const nextWord = codeBuffer
      .subarray(rawTemplate.range.end)
      .toString()
      .match(/\S+/);
    if (nextWord && nextWord[0] === 'as') {
      prefix = '(' + prefix;
      suffix = suffix + ')';
    } else if (!nextWord || ![',', ')'].includes(nextWord[0][0] || '')) {
      suffix += ';';
    }
  }

  return replaceByteRange(code, rawTemplate.range, {
    prefix,
    suffix,
  });
}
