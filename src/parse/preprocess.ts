import type { RawGlimmerTemplate } from '../types/glimmer';

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
  templateNode: RawGlimmerTemplate,
  originalCode: string,
  currentCode: string,
): string {
  let prefix: string;
  let suffix: string;

  if (templateNode.type === 'class-member') {
    prefix = 'static{`';
    suffix = '`}';
  } else {
    const nextWord = originalCode.slice(templateNode.range.end).match(/\S+/);
    prefix = '{';
    suffix = '}';
    if (nextWord && nextWord[0] === 'as') {
      prefix = '(' + prefix;
      suffix = suffix + ')';
    } else if (!nextWord || ![',', ')'].includes(nextWord[0][0] || '')) {
      suffix += ';';
    }
  }

  const totalLength = templateNode.range.end - templateNode.range.start;
  const placeholderLength = totalLength - prefix.length - suffix.length;
  const placeholder = ' '.repeat(placeholderLength);

  return replaceRange(
    currentCode,
    templateNode.range,
    `${prefix}${placeholder}${suffix}`,
  );
}
