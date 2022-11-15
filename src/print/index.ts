import type { AstPath, Plugin, Printer } from 'prettier';

import {
  TEMPLATE_TAG_CLOSE,
  TEMPLATE_TAG_OPEN,
  TEMPLATE_TAG_PLACEHOLDER,
} from '../config';
import type { Options } from '../options';
import type { BaseNode } from '../types/ast';
import {
  getGlimmerExpression,
  isGlimmerExportDefaultDeclarationPath,
  isGlimmerExportDefaultDeclarationTSPath,
  isGlimmerExpressionPath,
  isGlimmerExpressionStatementPath,
  isGlimmerExpressionStatementTSPath,
} from '../types/glimmer';
import {
  isRawGlimmerArrayExpressionPath,
  isRawGlimmerClassPropertyPath,
} from '../types/raw';
import { assert, assertExists } from '../utils/index';
import { printTemplateTag } from './template';

// @ts-expect-error FIXME: HACK because estree printer isn't exported. See below.
export const printer: Printer<BaseNode> = {};

let originalOptions: Options;

/**
 * FIXME: HACK because estree printer isn't exported.
 *
 * @see https://github.com/prettier/prettier/issues/10259
 * @see https://github.com/prettier/prettier/issues/4424
 */
export function definePrinter(options: Options): void {
  originalOptions = { ...options };
  const estreePlugin = assertExists(options.plugins.find(isEstreePlugin));
  const estreePrinter = estreePlugin.printers.estree;

  const defaultHasPrettierIgnore = assertExists(
    estreePrinter.hasPrettierIgnore
  );

  // Part of the HACK described above
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const defaultPrint = estreePrinter.print;

  Reflect.setPrototypeOf(
    printer,
    Object.create(estreePrinter) as Printer<BaseNode>
  );

  printer.print = (path, options, print, args) => {
    const hasPrettierIgnore = checkPrettierIgnore(
      path,
      defaultHasPrettierIgnore
    );

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
        const printed = defaultPrint(path, options, print, args);
        const glimmerExpression = getGlimmerExpression(path);

        if (Array.isArray(printed)) {
          const { semi } = options;
          const { forceSemi } = glimmerExpression.extra;
          const hasSemi = printed[printed.length - 1] === ';';
          // I think prettier is mutating the options somewhere, making the semi
          // check necessary
          /* eslint-disable @typescript-eslint/no-unnecessary-condition */
          if (semi && forceSemi && !hasSemi) {
            // We only need to push the semi-colon in semi: true mode because
            // in semi: false mode, the ambiguous statement will get a prefixing
            // semicolon
            printed.push(';');
          } else if ((!semi || !forceSemi) && hasSemi) {
            // HACK: Prettier hardcodes a semicolon for GlimmerExportDefaultDeclarationTSPath
            printed.pop();
          }
          /* eslint-enable @typescript-eslint/no-unnecessary-condition */
        } else {
          // FIXME: Should we throw in DEBUG mode?
          console.error(
            'Expected GlimmerExpression to be printed within an array',
            path.getValue()
          );
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
    const hasPrettierIgnore = checkPrettierIgnore(
      path,
      defaultHasPrettierIgnore
    );

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
    typeof plugin !== 'string' && plugin.printers && plugin.printers['estree']
  );
}

function printRawText(path: AstPath<BaseNode>, options: Options): string {
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
      path.callParent((parent) =>
        checkPrettierIgnore(parent, hasPrettierIgnore)
      ))
  );
}
