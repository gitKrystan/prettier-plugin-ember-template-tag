import { BaseNode } from 'estree';
import type { AstPath, ParserOptions } from 'prettier';
import { doc } from 'prettier';

import { TEMPLATE_TAG_CLOSE, TEMPLATE_TAG_OPEN } from '../config';
import type {
  GlimmerArrayExpression,
  GlimmerCallExpression,
  GlimmerClassProperty
} from '../types/glimmer';

const {
  builders: { group, indent, softline }
} = doc;

export function printGlimmerClassProperty(
  path: AstPath<GlimmerClassProperty>,
  textToDoc: (
    text: string,
    options: ParserOptions<BaseNode>
  ) => doc.builders.Doc,
  options: ParserOptions<BaseNode>,
  hasPrettierIgnore: boolean
): doc.builders.Group {
  return printTemplateTag(
    path.getValue().key,
    textToDoc,
    options,
    hasPrettierIgnore
  );
}

export function printGlimmerArrayExpression(
  path: AstPath<GlimmerArrayExpression>,
  textToDoc: (
    text: string,
    options: ParserOptions<BaseNode>
  ) => doc.builders.Doc,
  options: ParserOptions<BaseNode>,
  hasPrettierIgnore: boolean
): doc.builders.Group {
  const node = path.getValue();
  return printTemplateTag(
    node.elements[0],
    textToDoc,
    options,
    node.hasPrettierIgnore ?? hasPrettierIgnore
  );
}

function printTemplateTag(
  node: GlimmerCallExpression,
  textToDoc: (
    text: string,
    options: ParserOptions<BaseNode>
  ) => doc.builders.Doc,
  options: ParserOptions<BaseNode>,
  hasPrettierIgnore: boolean
): doc.builders.Group {
  const text = node.arguments[0].quasis.map(quasi => quasi.value.raw).join();

  if (hasPrettierIgnore) {
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
