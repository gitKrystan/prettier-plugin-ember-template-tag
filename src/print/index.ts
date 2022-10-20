import { ParserOptions, Plugin, Printer } from 'prettier';

import type { BaseNode } from '../types/estree';
import {
  isGlimmerArrayExpressionPath,
  isGlimmerClassPropertyPath,
  isGlimmerExportDefaultDeclarationPath,
  isGlimmerExportDefaultDeclarationTSPath,
  isGlimmerExportNamedDeclaration,
  isGlimmerExpressionStatementPath,
  isGlimmerExpressionStatementTSPath,
  isGlimmerVariableDeclarationPath,
  isGlimmerVariableDeclarator,
  isGlimmerVariableDeclaratorTS,
  isTaggedGlimmerArrayExpressionPath,
  tagGlimmerArrayExpression
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

    if (isGlimmerExportDefaultDeclarationPath(path)) {
      embedOptions.semi = false;
      const node = path.getValue();
      tagGlimmerArrayExpression(node.declaration, hasPrettierIgnore);
      return defaultPrint(path, embedOptions, print);
    } else if (isGlimmerExportNamedDeclaration(path)) {
      embedOptions.semi = false;
      for (let declarator of path.getValue().declaration.declarations) {
        if (isGlimmerVariableDeclarator(declarator)) {
          tagGlimmerArrayExpression(declarator.init, hasPrettierIgnore);
        } else if (isGlimmerVariableDeclaratorTS(declarator)) {
          tagGlimmerArrayExpression(
            declarator.init.expression,
            hasPrettierIgnore
          );
        }
      }
      return defaultPrint(path, embedOptions, print);
    } else if (isGlimmerExportDefaultDeclarationTSPath(path)) {
      embedOptions.semi = false;
      const node = path.getValue();
      tagGlimmerArrayExpression(node.declaration.expression, hasPrettierIgnore);
      let printed = defaultPrint(path, embedOptions, print);
      // HACK: Prettier hardcodes a semicolon here
      if (Array.isArray(printed) && printed[printed.length - 1] === ';') {
        printed.pop();
      }
      return printed;
    } else if (isGlimmerExpressionStatementPath(path)) {
      embedOptions.semi = false;
      tagGlimmerArrayExpression(path.getValue().expression, hasPrettierIgnore);
      return defaultPrint(path, embedOptions, print);
    } else if (isGlimmerExpressionStatementTSPath(path)) {
      embedOptions.semi = false;
      tagGlimmerArrayExpression(
        path.getValue().expression.expression,
        hasPrettierIgnore
      );
      return defaultPrint(path, embedOptions, print);
    } else if (isGlimmerVariableDeclarationPath(path)) {
      const node = path.getValue();
      const lastDeclarator = node.declarations[node.declarations.length - 1];
      if (
        isGlimmerVariableDeclarator(lastDeclarator) ||
        isGlimmerVariableDeclaratorTS(lastDeclarator)
      ) {
        embedOptions.semi = false;
      }
      for (let declarator of node.declarations) {
        if (isGlimmerVariableDeclarator(declarator)) {
          tagGlimmerArrayExpression(declarator.init, hasPrettierIgnore);
        } else if (isGlimmerVariableDeclaratorTS(declarator)) {
          tagGlimmerArrayExpression(
            declarator.init.expression,
            hasPrettierIgnore
          );
        }
      }
      return defaultPrint(path, embedOptions, print);
    }

    if (isTaggedGlimmerArrayExpressionPath(path)) {
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
      let ret = defaultPrint(path, embedOptions, print);
      embedOptions.semi = originalOptions.semi;
      return ret;
    }
  };

  printer.hasPrettierIgnore = (path): boolean => {
    if (
      [
        isGlimmerArrayExpressionPath,
        isGlimmerClassPropertyPath,
        isGlimmerExportDefaultDeclarationPath,
        isGlimmerExportDefaultDeclarationTSPath,
        isGlimmerExportNamedDeclaration,
        isGlimmerExpressionStatementPath,
        isGlimmerExpressionStatementTSPath,
        isGlimmerVariableDeclarationPath,
        isTaggedGlimmerArrayExpressionPath
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
