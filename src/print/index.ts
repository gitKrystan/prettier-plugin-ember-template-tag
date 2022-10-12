import type { BaseNode } from 'estree';
import type { ParserOptions, Plugin, Printer } from 'prettier';

import {
  isTemplateInvocationExpressionPath,
  isTemplateInvocationPropertyPath
} from '../types';
import { assertExists } from '../utils';
import {
  printTemplateTagForExpression,
  printTemplateTagForProperty
} from './template';

// @ts-expect-error
export let printer: Printer<BaseNode> = {};

// FIXME: HACK because estree printer isn't exported
// see https://github.com/prettier/prettier/issues/10259 and
// https://github.com/prettier/prettier/issues/4424
// Need to find another solution if we want to be listed in community plugins
export function definePrinter(options: ParserOptions<BaseNode>) {
  const estreePlugin = assertExists(options.plugins.find(isEstreePlugin));
  const estreePrinter = estreePlugin.printers.estree;

  Reflect.setPrototypeOf(printer, Object.create(estreePrinter));

  printer.embed = (path, print, textToDoc, options) => {
    if (isTemplateInvocationExpressionPath(path)) {
      return printTemplateTagForExpression(path, print, textToDoc, options);
    } else if (isTemplateInvocationPropertyPath(path)) {
      return printTemplateTagForProperty(path, print, textToDoc, options);
    } else {
      return printer.embed?.(path, print, textToDoc, options) ?? null;
    }
  };
}

function isEstreePlugin(
  plugin: string | Plugin<BaseNode>
): plugin is Plugin<BaseNode> & {
  printers: { estree: Printer<BaseNode> };
} {
  return Boolean(
    typeof plugin !== 'string' && plugin.printers && plugin.printers.estree
  );
}
