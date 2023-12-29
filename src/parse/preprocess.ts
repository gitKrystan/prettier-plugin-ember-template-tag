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
  originalBuffer: Buffer,
  range: { start: number; end: number },
  options: { prefix: string; suffix: string },
): string {
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
      `Invalid byte range:\n\tstart=${range.start}\n\tend=${
        range.end
      }\n\tprefix=${options.prefix}\n\tsuffix=${
        options.suffix
      }\n\tstring=\n\t${originalBuffer.toString()}`,
    );
  }

  // Adjust the space length to account for the prefix and suffix lengths
  const totalReplacementLength = range.end - range.start;
  const spaceLength =
    totalReplacementLength - prefixBuffer.length - suffixBuffer.length;

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
    throw new Error(
      `Result length (${result.length}) does not match original length (${originalBuffer.length})`,
    );
  }

  return result.toString('utf8');
}

/**
 * Replace the template with a parsable placeholder that takes up the same
 * range.
 */
export function preprocessTemplateRange(
  rawTemplate: RawGlimmerTemplate,
  code: string,
): string {
  const codeBuffer = Buffer.from(code);

  let prefix: string;
  let suffix: string;

  if (rawTemplate.type === 'class-member') {
    // Replace with StaticBlock
    prefix = 'static{';
    suffix = '}';
  } else {
    // Replace with BlockStatement or ObjectExpression
    prefix = '{';
    suffix = '}';

    const nextToken = codeBuffer
      .subarray(rawTemplate.range.end)
      .toString()
      .match(/\S+/);
    if (nextToken && nextToken[0] === 'as') {
      // Replace with parenthesized ObjectExpression
      prefix = '(' + prefix;
      suffix = suffix + ')';
    }
  }

  return replaceByteRange(codeBuffer, rawTemplate.range, {
    prefix,
    suffix,
  });
}
