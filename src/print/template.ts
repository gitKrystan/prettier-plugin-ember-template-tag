import type { TemplateLiteral } from 'estree';
import type { ParserOptions, Printer } from 'prettier';
import { doc } from 'prettier';

import { TEMPLATE_TAG_CLOSE, TEMPLATE_TAG_OPEN } from '../config';
import type {
  TemplateInvocationExpression,
  TemplateInvocationProperty
} from '../types';
import { isDocGroup, isTemplateLiteral } from '../types';
import { assert } from '../utils';

const {
  builders: { group, indent, softline, hardline },
  utils: { stripTrailingHardline, getDocParts }
} = doc;

export const printTemplateTagForExpression: Required<
  Printer<TemplateInvocationExpression>
>['embed'] = (
  path,
  _print, // By not calling print we are replacing this node and all of its children
  textToDoc,
  options
) => {
  const invocationNode = path.getValue();
  const templateNode = invocationNode.elements[0].arguments[0];
  assert('expected TemplateLiteral node', isTemplateLiteral(templateNode));
  return printTemplateTag(templateNode, textToDoc, options);
};

export const printTemplateTagForProperty: Required<
  Printer<TemplateInvocationProperty>
>['embed'] = (
  path,
  _print, // By not calling print we are replacing this node and all of its children
  textToDoc,
  options
) => {
  const invocationNode = path.getValue();
  const templateNode = invocationNode.key.arguments[0];
  assert('expected TemplateLiteral node', isTemplateLiteral(templateNode));
  return printTemplateTag(templateNode, textToDoc, options);
};

function printTemplateTag<T>(
  node: TemplateLiteral,
  textToDoc: (text: string, options: ParserOptions<T>) => doc.builders.Doc,
  options: ParserOptions<T>
) {
  const text = node.quasis.map(quasi => quasi.value.raw).join();
  const contents = stripTrailingHardline(
    textToDoc(text, {
      ...options,
      parser: 'glimmer',
      // @ts-expect-error FIXME
      singleQuote: options.hbsSingleQuote
    })
  );
  console.info('here is the doc', {
    doc: contents,
    isMultiLine: isMultiLine(text, node, options.printWidth),
    isDocGroup: isDocGroup(contents),
    // @ts-expect-error
    startsWithHardline: startsWithHardline(contents),
    // @ts-expect-error
    contents: contents.contents
  });
  if (!isMultiLine(text, node, options.printWidth)) {
    // FIXME
    throw new Error('not isMultiline happened');
    return group([TEMPLATE_TAG_OPEN, contents, TEMPLATE_TAG_OPEN]);
  } else if (isDocGroup(contents) && startsWithHardline(contents)) {
    // FIXME
    throw new Error('startsWithHardline happened');
    return group([
      TEMPLATE_TAG_OPEN,
      indent(group(contents)),
      softline,
      TEMPLATE_TAG_CLOSE
    ]);
  } else {
    return group([
      TEMPLATE_TAG_OPEN,
      // indent([hardline, group(doc)]),
      softline,
      group(contents),
      softline,
      TEMPLATE_TAG_CLOSE
    ]);
  }
}

function isMultiLine(text: string, node: TemplateLiteral, printWidth: number) {
  return (
    text.startsWith('\n') || (node.loc && node.loc.end.column >= printWidth)
  );
}

function startsWithHardline(doc: doc.builders.Group) {
  // @ts-expect-error FIXME
  const [first, second] = getDocParts(doc.contents);
  return (
    first &&
    first.type === 'line' &&
    first.hard &&
    second &&
    second.type === 'break-parent'
  );
}
