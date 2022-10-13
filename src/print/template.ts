import { BaseNode } from 'estree';
import type { AstPath, ParserOptions } from 'prettier';
import { doc } from 'prettier';

import { TEMPLATE_TAG_CLOSE, TEMPLATE_TAG_OPEN } from '../config';
import type {
  GlimmerArrayExpression,
  GlimmerCallExpression,
  GlimmerClassProperty,
  GlimmerExportDefaultDeclaration,
  GlimmerExpressionStatement
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
  options: ParserOptions<BaseNode>
): doc.builders.Group {
  return printTemplateTag(
    path.getValue().key,
    textToDoc,
    options,
    'CLASS_PROPERTY'
  );
}

export function printGlimmerArrayExpression(
  path: AstPath<GlimmerArrayExpression>,
  textToDoc: (
    text: string,
    options: ParserOptions<BaseNode>
  ) => doc.builders.Doc,
  options: ParserOptions<BaseNode>
): doc.builders.Group {
  return printTemplateTag(
    path.getValue().elements[0],
    textToDoc,
    options,
    'ARRAY_EXPRESSION'
  );
}

function printTemplateTag(
  node: GlimmerCallExpression,
  textToDoc: (
    text: string,
    options: ParserOptions<BaseNode>
  ) => doc.builders.Doc,
  options: ParserOptions<BaseNode>,
  debug?: string // FIXME: REMOVE
): doc.builders.Group {
  const text = node.arguments[0].quasis.map(quasi => quasi.value.raw).join();

  const contents = textToDoc(text, {
    ...options,
    parser: 'glimmer',
    // @ts-expect-error FIXME:
    singleQuote: options.hbsSingleQuote
  });

  return group([
    TEMPLATE_TAG_OPEN,
    debug ?? '',
    indent([softline, group(contents)]),
    softline,
    TEMPLATE_TAG_CLOSE
  ]);
}
