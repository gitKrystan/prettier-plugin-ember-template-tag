import { TemplateLiteral } from '@babel/types';
import type { ParserOptions } from 'prettier';
import { doc } from 'prettier';

import { TEMPLATE_TAG_CLOSE, TEMPLATE_TAG_OPEN } from '../config';
import type { BaseNode } from '../types/ast';
import type { GlimmerExpression } from '../types/glimmer';

const {
  builders: { group, indent, softline }
} = doc;

export function printTemplateTag(
  node: TemplateLiteral | GlimmerExpression,
  textToDoc: (
    text: string,
    options: ParserOptions<BaseNode>
  ) => doc.builders.Doc,
  options: ParserOptions<BaseNode>,
  hasPrettierIgnore: boolean
): doc.builders.Group {
  const text = node.quasis.map(quasi => quasi.value.raw).join();

  if (hasPrettierIgnore || node.extra?.hasPrettierIgnore) {
    return group([TEMPLATE_TAG_OPEN, text, TEMPLATE_TAG_CLOSE]);
  } else {
    const contents = textToDoc(text.trim(), {
      ...options,
      parser: 'glimmer',
      // @ts-expect-error FIXME:
      singleQuote: options.hbsSingleQuote
    });
    return group([
      TEMPLATE_TAG_OPEN,
      indent([softline, group(contents)]),
      softline,
      TEMPLATE_TAG_CLOSE
    ]);
  }
}
