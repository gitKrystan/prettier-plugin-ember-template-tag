import type { TemplateLiteral } from '@babel/types';
import type { ParserOptions } from 'prettier';
import { doc } from 'prettier';
import { TEMPLATE_TAG_CLOSE, TEMPLATE_TAG_OPEN } from '../config';

import type { Options } from '../options';
import { getTemplateSingleQuote } from '../options';
import type { BaseNode } from '../types/ast';

const {
  builders: { group, hardline, indent, softline },
} = doc;

/**
 * Returns a Prettier `Doc` for the given `TemplateLiteral` contents formatted
 * using Prettier's built-in glimmer parser.
 *
 * NOTE: The contents are not surrounded with "`"
 */
export function printTemplateContent(
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

/**
 * Prints the given template content as a template tag.
 *
 * If `useHardline` is `true`, will use Prettier's hardline builder to force
 * each tag to print on a new line.
 *
 * If `useHardline` is `false`, will use Prettier's softline builder to allow
 * the tags to print on the same line if they fit.
 */
export function printTemplateTag(
  content: doc.builders.Doc,
  useHardline: boolean
): doc.builders.Doc {
  const line = useHardline ? hardline : softline;
  return group([
    TEMPLATE_TAG_OPEN,
    indent([line, group(content)]),
    line,
    TEMPLATE_TAG_CLOSE,
  ]);
}

/** Prints the given template content as a template literal. */
export function printTemplateLiteral(
  content: doc.builders.Doc
): doc.builders.Doc {
  return group(['`', content, '`']);
}
