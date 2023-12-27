import type { Parsed as RawGlimmerTemplate } from 'content-tag';

function replaceRange(
  original: string,
  range: { start: number; end: number },
  substitute: string,
): string {
  return (
    original.slice(0, range.start) + substitute + original.slice(range.end)
  );
}

/**
 * Replace the template with a parsable placeholder that takes up the same
 * range.
 */
export function preprocessTemplateRange(
  rawTemplate: RawGlimmerTemplate,
  originalCode: string,
  currentCode: string,
): string {
  let prefix: string;
  let suffix: string;

  if (rawTemplate.type === 'class-member') {
    prefix = 'static{`';
    suffix = '`}';
  } else {
    prefix = '{';
    suffix = '}';
    const nextWord = originalCode.slice(rawTemplate.range.end).match(/\S+/);
    if (nextWord && nextWord[0] === 'as') {
      prefix = '(' + prefix;
      suffix = suffix + ')';
    } else if (!nextWord || ![',', ')'].includes(nextWord[0][0] || '')) {
      suffix += ';';
    }
  }

  const totalLength = rawTemplate.range.end - rawTemplate.range.start;
  const placeholderLength = totalLength - prefix.length - suffix.length;
  const placeholder = ' '.repeat(placeholderLength);

  return replaceRange(
    currentCode,
    rawTemplate.range,
    `${prefix}${placeholder}${suffix}`,
  );
}
