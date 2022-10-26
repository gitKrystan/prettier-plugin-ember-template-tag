import { ParserOptions, Plugin, Printer } from 'prettier';

import type { BaseNode } from '../types/ast';
import {
  isGlimmerExportDefaultDeclarationPath,
  isGlimmerExportDefaultDeclarationTSPath,
  isGlimmerExportNamedDeclarationPath,
  isGlimmerExpressionPath,
  isGlimmerExpressionStatementPath,
  isGlimmerExpressionStatementTSPath,
  isGlimmerVariableDeclarationPath,
  isGlimmerVariableDeclarator,
  isGlimmerVariableDeclaratorTS
} from '../types/glimmer';
import {
  isRawGlimmerArrayExpressionPath,
  isRawGlimmerClassPropertyPath
} from '../types/raw';
import { assertExists } from '../utils';
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

  /**
   * We really only need to `embed` Glimmer Array Expressions and Glimmer Class
   * Properties. Otherwise, we can rely on the built-in estree printer, but we
   * need to conditionally turn off semi-colon printing to ensure we don't end
   * up with `</template>;`.
   */
  printer.embed = (path, print, textToDoc, embedOptions) => {
    let hasPrettierIgnore = defaultHasPrettierIgnore(path);
    if (
      isGlimmerExportDefaultDeclarationPath(path) ||
      isGlimmerExportDefaultDeclarationTSPath(path) ||
      isGlimmerExportNamedDeclarationPath(path) ||
      isGlimmerExpressionStatementPath(path) ||
      isGlimmerExpressionStatementTSPath(path)
    ) {
      embedOptions.semi = false;
      let printed = defaultPrint(path, embedOptions, print);
      // HACK: Prettier hardcodes a semicolon for GlimmerExportDefaultDeclarationTSPath
      if (Array.isArray(printed) && printed[printed.length - 1] === ';') {
        printed.pop();
      }
      return printed;
    } else if (isGlimmerVariableDeclarationPath(path)) {
      const node = path.getValue();
      const lastDeclarator = node.declarations[node.declarations.length - 1];
      if (
        isGlimmerVariableDeclarator(lastDeclarator) ||
        isGlimmerVariableDeclaratorTS(lastDeclarator)
      ) {
        embedOptions.semi = false;
      }
      return defaultPrint(path, embedOptions, print);
    }

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
      let ret = defaultPrint(path, embedOptions, print);
      embedOptions.semi = originalOptions.semi;
      return ret;
    }
  };

  printer.hasPrettierIgnore = (path): boolean => {
    if (
      [
        isGlimmerExportDefaultDeclarationPath,
        isGlimmerExportDefaultDeclarationTSPath,
        isGlimmerExportNamedDeclarationPath,
        isGlimmerExpressionStatementPath,
        isGlimmerExpressionStatementTSPath,
        isGlimmerVariableDeclarationPath,
        isGlimmerExpressionPath,
        isRawGlimmerArrayExpressionPath,
        isRawGlimmerClassPropertyPath
      ].some(test => test(path))
    ) {
      // On the first pass, ignore prettier-ignore comments on Glimmer embed
      // paths. We need to handle them specially to ensure they are transformed
      // back to `<template>`.
      return false;
    } else {
      return defaultHasPrettierIgnore(path);
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
