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
): doc.builders.Doc {
  const text = node.quasis.map(quasi => quasi.value.raw).join();

  if (hasPrettierIgnore) {
    return `${TEMPLATE_TAG_OPEN}${node.quasis
      .map(quasi => quasi.value.raw)
      .join()}${TEMPLATE_TAG_CLOSE}`;
  } else {
    // FIXME: Maybe could just concat tags before parse and allow glimmer printer to format it
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
