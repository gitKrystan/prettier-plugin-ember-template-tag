import type { TemplateLiteral } from '@babel/types';
import type { ParserOptions } from 'prettier';
import { doc } from 'prettier';

import { TEMPLATE_TAG_CLOSE, TEMPLATE_TAG_OPEN } from '../config';
import type { Options } from '../options';
import { getTemplateSingleQuote } from '../options';
import type { BaseNode } from '../types/ast';

const {
  builders: { group, indent, softline },
} = doc;

/**
 * Returns a Prettier `Doc` for the given `TemplateLiteral` that is formatted
 * using Prettier's built-in glimmer parser.
 */
export function printTemplateTag(
  node: TemplateLiteral,
  textToDoc: (
    text: string,
    // Don't use our `Options` here even though technically they are available
    // because we don't want to accidentally pass them into `textToDoc`. We
    // should normalize them into standard Prettier options at this point.
    options: ParserOptions<BaseNode>
  ) => doc.builders.Doc,
  options: Options,
  hasPrettierIgnore: boolean
): doc.builders.Doc {
  const text = node.quasis.map((quasi) => quasi.value.raw).join();

  if (hasPrettierIgnore) {
    return `${TEMPLATE_TAG_OPEN}${node.quasis
      .map((quasi) => quasi.value.raw)
      .join()}${TEMPLATE_TAG_CLOSE}`;
  } else {
    // FIXME: Maybe could just concat tags before parse and allow glimmer printer to format it
    const contents = textToDoc(text.trim(), {
      ...options,
      parser: 'glimmer',
      singleQuote: getTemplateSingleQuote(options),
    });
    return group([
      TEMPLATE_TAG_OPEN,
      indent([softline, group(contents)]),
      softline,
      TEMPLATE_TAG_CLOSE,
    ]);
  }
}
