import { AstPath, ParserOptions, Plugin, Printer } from 'prettier';

import {
  TEMPLATE_TAG_CLOSE,
  TEMPLATE_TAG_OPEN,
  TEMPLATE_TAG_PLACEHOLDER
} from '../config';
import type { BaseNode } from '../types/ast';
import {
  isGlimmerExportDefaultDeclarationPath,
  isGlimmerExportDefaultDeclarationTSPath,
  isGlimmerExpressionPath,
  isGlimmerExpressionStatementPath,
  isGlimmerExpressionStatementTSPath
} from '../types/glimmer';
import {
  isRawGlimmerArrayExpressionPath,
  isRawGlimmerClassPropertyPath
} from '../types/raw';
import { assert, assertExists } from '../utils';
import { printTemplateTag } from './template';

// @ts-expect-error
export let printer: Printer<BaseNode> = {};

let originalOptions: ParserOptions<BaseNode>;

// FIXME: HACK because estree printer isn't exported
// see https://github.com/prettier/prettier/issues/10259 and
// https://github.com/prettier/prettier/issues/4424
// Need to find another solution if we want to be listed in community plugins
export function definePrinter(options: ParserOptions<BaseNode>) {
  originalOptions = { ...options };
  const estreePlugin = assertExists(options.plugins.find(isEstreePlugin));
  const estreePrinter = estreePlugin.printers.estree;

  const defaultHasPrettierIgnore = assertExists(
    estreePrinter.hasPrettierIgnore
  );
  const defaultPrint = estreePrinter.print;

  Reflect.setPrototypeOf(printer, Object.create(estreePrinter));

  printer.print = (path, options, print, args) => {
    let hasPrettierIgnore = checkPrettierIgnore(path, defaultHasPrettierIgnore);

    if (
      isGlimmerExportDefaultDeclarationPath(path) ||
      isGlimmerExportDefaultDeclarationTSPath(path) ||
      isGlimmerExpressionStatementPath(path) ||
      isGlimmerExpressionStatementTSPath(path)
    ) {
      if (hasPrettierIgnore) {
        return printRawText(path, options);
      } else {
        options.semi = false;
        let printed = defaultPrint(path, options, print, args);
        // HACK: Prettier hardcodes a semicolon for GlimmerExportDefaultDeclarationTSPath
        if (Array.isArray(printed) && printed[printed.length - 1] === ';') {
          printed.pop();
        }
        return printed;
      }
    } else {
      options.semi = originalOptions.semi;
      if (hasPrettierIgnore) {
        return printRawText(path, options);
      } else {
        return defaultPrint(path, options, print, args);
      }
    }
  };

  /** Prints embedded GlimmerExpressions. */
  printer.embed = (path, _print, textToDoc, embedOptions) => {
    let hasPrettierIgnore = checkPrettierIgnore(path, defaultHasPrettierIgnore);

    if (isGlimmerExpressionPath(path)) {
      return printTemplateTag(
        path.getValue(),
        textToDoc,
        embedOptions,
        hasPrettierIgnore
      );
    } else if (isRawGlimmerClassPropertyPath(path)) {
      // FIXME: Should we throw in DEBUG mode?
      console.error('Found untagged GlimmerClassProperty', path.getValue());
      return printTemplateTag(
        path.getValue().key.arguments[0],
        textToDoc,
        embedOptions,
        hasPrettierIgnore
      );
    } else if (isRawGlimmerArrayExpressionPath(path)) {
      // FIXME: Should we throw in DEBUG mode?
      console.error('Found untagged GlimmerArrayExpression', path.getValue());
      return printTemplateTag(
        path.getValue().elements[0].arguments[0],
        textToDoc,
        embedOptions,
        hasPrettierIgnore
      );
    } else {
      // Nothing to embed, so move on to the regular printer.
      return null;
    }
  };

  /**
   * Turn off built-in prettier-ignore handling because it will skip embedding,
   * which will print `[__GLIMMER_TEMPLATE(...)]` instead of
   * `<template>...</template>`.
   */
  printer.hasPrettierIgnore = (_path): boolean => {
    return false;
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

function printRawText(
  path: AstPath<BaseNode>,
  options: ParserOptions<BaseNode>
): string {
  const node = path.getValue();
  assert('expected start', node.start);
  assert('expected end', node.end);
  let raw = options.originalText.slice(node.start, node.end);
  // HACK: We don't have access to the original raw text :-(
  raw = raw.replaceAll(`[${TEMPLATE_TAG_PLACEHOLDER}(\``, TEMPLATE_TAG_OPEN);
  raw = raw.replaceAll('`, { strictMode: true })]', TEMPLATE_TAG_CLOSE);
  return raw;
}

function checkPrettierIgnore(
  path: AstPath<BaseNode>,
  hasPrettierIgnore: (path: AstPath<BaseNode>) => boolean
): boolean {
  return (
    hasPrettierIgnore(path) ||
    (!!path.getParentNode() &&
      path.callParent(parent => checkPrettierIgnore(parent, hasPrettierIgnore)))
  );
}
