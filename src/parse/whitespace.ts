import type { RawGlimmerTemplate } from '../types/glimmer.js';

const STATIC_OPEN = 'static{`';
const STATIC_CLOSE = '`}';
const NEWLINE = '\n';

function replaceRange(
  original: string,
  range: { start: number; end: number },
  substitute: string,
): string {
  return (
    original.slice(0, range.start) + substitute + original.slice(range.end)
  );
}

/** Hacks to normalize whitespace. */
export function normalizeWhitespace(
  templateNode: RawGlimmerTemplate,
  originalCode: string,
  currentCode: string,
): string {
  let prefix: string;
  let suffix: string;

  if (templateNode.type === 'class-member') {
    prefix = STATIC_OPEN;
    suffix = STATIC_CLOSE;
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

  const lineBreakCount = [...templateNode.contents].reduce(
    (sum, currentContents) => sum + (currentContents === NEWLINE ? 1 : 0),
    0,
  );
  const totalLength = templateNode.range.end - templateNode.range.start;
  const spaces = totalLength - prefix.length - suffix.length - lineBreakCount;
  const content = ' '.repeat(spaces) + NEWLINE.repeat(lineBreakCount);

  return replaceRange(
    currentCode,
    templateNode.range,
    `${prefix}${content}${suffix}`,
  );
}
