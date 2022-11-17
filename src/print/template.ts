import type { TemplateLiteral } from '@babel/types';
import type { doc, ParserOptions } from 'prettier';

import type { Options } from '../options';
import { getTemplateSingleQuote } from '../options';
import type { BaseNode } from '../types/ast';

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
    options: ParserOptions<BaseNode | undefined>
  ) => doc.builders.Doc,
  options: Options
): doc.builders.Doc {
  const text = node.quasis.map((quasi) => quasi.value.raw).join(' ');
  return textToDoc(text.trim(), {
    ...options,
    parser: 'glimmer',
    singleQuote: getTemplateSingleQuote(options),
  });
}
