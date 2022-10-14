import type { BaseNode } from 'estree';
import type { ParserOptions, Plugin, Printer } from 'prettier';

import {
  isGlimmerArrayExpressionPath,
  isGlimmerClassPropertyPath,
  isGlimmerExportDefaultDeclarationPath,
  isGlimmerExportNamedDeclaration,
  isGlimmerExpressionStatementPath,
  isGlimmerVariableDeclarationPath,
  isGlimmerVariableDeclarator
} from '../types/glimmer';
import { assertExists } from '../utils';
import {
  printGlimmerArrayExpression,
  printGlimmerClassProperty
} from './template';

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

  const defaultEmbed = assertExists(estreePrinter.embed);
  const defaultHasPrettierIgnore = assertExists(
    estreePrinter.hasPrettierIgnore
  );

  Reflect.setPrototypeOf(printer, Object.create(estreePrinter));

  /**
   * We really only need to `embed` Glimmer Array Expressions and Glimmer Class
   * Properties. Otherwise, we can rely on the built-in estree printer, but we
   * need to conditionally turn off semi-colon printing to ensure we don't end
   * up with `</template>;`.
   */
  printer.embed = (path, print, textToDoc, embedOptions) => {
    let hasPrettierIgnore = defaultHasPrettierIgnore(path);

    if (isGlimmerExportDefaultDeclarationPath(path)) {
      embedOptions.semi = false;
      if (hasPrettierIgnore) {
        path.getValue().declaration.hasPrettierIgnore = true;
      }
      // FIXME: Should call printer.embed here but it adds an extraneous ;
      return printer.print(path, embedOptions, print);
    } else if (isGlimmerExportNamedDeclaration(path)) {
      embedOptions.semi = false;
      if (hasPrettierIgnore) {
        path
          .getValue()
          .declaration.declarations.filter(isGlimmerVariableDeclarator)
          .forEach(d => (d.init.hasPrettierIgnore = true));
      }
      // FIXME: Should call printer.embed here but it adds an extraneous ;
      return printer.print(path, embedOptions, print);
    } else if (isGlimmerExpressionStatementPath(path)) {
      embedOptions.semi = false;
      if (hasPrettierIgnore) {
        path.getValue().expression.hasPrettierIgnore = true;
      }
      // FIXME: Should call printer.embed here but it adds an extraneous ;
      return printer.print(path, embedOptions, print);
    } else if (isGlimmerVariableDeclarationPath(path)) {
      const node = path.getValue();
      const lastDeclarator = node.declarations[node.declarations.length - 1];
      if (isGlimmerVariableDeclarator(lastDeclarator)) {
        embedOptions.semi = false;
      }
      if (hasPrettierIgnore) {
        node.declarations
          .filter(isGlimmerVariableDeclarator)
          .forEach(d => (d.init.hasPrettierIgnore = true));
      }
      return assertExists(printer.embed)(path, print, textToDoc, embedOptions);
    }

    if (isGlimmerArrayExpressionPath(path)) {
      return printGlimmerArrayExpression(
        path,
        textToDoc,
        embedOptions,
        hasPrettierIgnore
      );
    } else if (isGlimmerClassPropertyPath(path)) {
      return printGlimmerClassProperty(
        path,
        textToDoc,
        embedOptions,
        hasPrettierIgnore
      );
    } else {
      embedOptions.semi = originalOptions.semi;
      return defaultEmbed(path, print, textToDoc, embedOptions);
    }
  };

  printer.hasPrettierIgnore = (path): boolean => {
    if (
      isGlimmerArrayExpressionPath(path) ||
      isGlimmerClassPropertyPath(path) ||
      isGlimmerExportDefaultDeclarationPath(path) ||
      isGlimmerExportNamedDeclaration(path) ||
      isGlimmerExpressionStatementPath(path) ||
      isGlimmerVariableDeclarationPath(path)
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
