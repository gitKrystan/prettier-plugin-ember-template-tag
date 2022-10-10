import type { BaseNode } from 'estree';
import type { ParserOptions, Plugin, Printer } from 'prettier';

import {
  isTemplateInvocationExpressionPath,
  isTemplateInvocationPropertyPath
} from '../types';
import { assert } from '../utils';
import {
  printTemplateTagForExpression,
  printTemplateTagForProperty
} from './template';

// @ts-expect-error
const estreePrinter: Printer<BaseNode> = {};

// @ts-expect-error
export const GJSPrinter: Printer<BaseNode> = {
  embed(path, print, textToDoc, options) {
    if (isTemplateInvocationExpressionPath(path)) {
      return printTemplateTagForExpression(path, print, textToDoc, options);
    } else if (isTemplateInvocationPropertyPath(path)) {
      return printTemplateTagForProperty(path, print, textToDoc, options);
    } else {
      return estreePrinter.embed?.(path, print, textToDoc, options) ?? null;
    }
  }
};

// FIXME: HACK because estree printer isn't exported
// see https://github.com/prettier/prettier/issues/10259 and
// https://github.com/prettier/prettier/issues/4424
// Need to find another solution if we want to be listed in community plugins
export function mergePrinters(options: ParserOptions<BaseNode>) {
  let isEstreePlugin = (
    plugin: string | Plugin<BaseNode>
  ): plugin is Plugin<BaseNode> & {
    printers: { estree: Printer<BaseNode> };
  } =>
    Boolean(
      typeof plugin !== 'string' && plugin.printers && plugin.printers.estree
    );
  const estreePlugin = options.plugins.find(isEstreePlugin);
  assert(
    'expected to find estree printer',
    estreePlugin && isEstreePlugin(estreePlugin)
  );
  const estreePrinter = estreePlugin.printers.estree;

  for (let [key, value] of Object.entries(estreePrinter)) {
    estreePrinter[key as keyof typeof estreePrinter] = value;
    if (!(key in GJSPrinter)) {
      GJSPrinter[key as keyof typeof GJSPrinter] = value;
    }
  }
}
