import type { TemplateLiteral } from 'estree';
import type { ParserOptions, Printer } from 'prettier';
import { doc } from 'prettier';

import { TEMPLATE_TAG_CLOSE, TEMPLATE_TAG_OPEN } from '../config';
import type {
  GlimmerExpressionStatement,
  GlimmerClassProperty
} from '../types';
import { isTemplateLiteral } from '../types';
import { assert } from '../utils';

const {
  builders: { group, indent, softline }
} = doc;

export const printTemplateTagForExpression: Required<
  Printer<GlimmerExpressionStatement>
>['embed'] = (
  path,
  _print, // By not calling print we are replacing this node and all of its children
  textToDoc,
  options
) => {
  const templateNode = path.getValue().expression.elements[0].arguments[0];
  assert('expected TemplateLiteral node', isTemplateLiteral(templateNode));
  return printTemplateTag(templateNode, textToDoc, options);
};

export const printTemplateTagForProperty: Required<
  Printer<GlimmerClassProperty>
>['embed'] = (
  path,
  _print, // By not calling print we are replacing this node and all of its children
  textToDoc,
  options
) => {
  const templateNode = path.getValue().key.arguments[0];
  assert('expected TemplateLiteral node', isTemplateLiteral(templateNode));
  return printTemplateTag(templateNode, textToDoc, options);
};

function printTemplateTag<T>(
  node: TemplateLiteral,
  textToDoc: (text: string, options: ParserOptions<T>) => doc.builders.Doc,
  options: ParserOptions<T>
) {
  const text = node.quasis.map(quasi => quasi.value.raw).join();

  const contents = textToDoc(text, {
    ...options,
    parser: 'glimmer',
    // @ts-expect-error FIXME
    singleQuote: options.hbsSingleQuote
  });

  return group([
    TEMPLATE_TAG_OPEN,
    indent([softline, group(contents)]),
    softline,
    TEMPLATE_TAG_CLOSE
  ]);
}
