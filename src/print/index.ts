import type { AstPath, doc, Plugin, Printer } from 'prettier';

import {
  TEMPLATE_TAG_CLOSE,
  TEMPLATE_TAG_OPEN,
  TEMPLATE_TAG_PLACEHOLDER,
} from '../config';
import type { Options } from '../options';
import type { BaseNode } from '../types/ast';
import {
  getGlimmerExpression,
  isGlimmerArrayExpression,
  isGlimmerClassProperty,
  isGlimmerExportDefaultDeclaration,
  isGlimmerExportDefaultDeclarationTS,
  isGlimmerExpressionStatement,
  isGlimmerExpressionStatementTS,
  isGlimmerTemplateLiteral,
} from '../types/glimmer';
import { assert, assertExists } from '../utils/index';
import {
  printTemplateContent,
  printTemplateLiteral,
  printTemplateTag,
} from './template';

// @ts-expect-error FIXME: HACK because estree printer isn't exported. See below.
export const printer: Printer<BaseNode | undefined> = {};

/**
 * FIXME: HACK because estree printer isn't exported.
 *
 * @see https://github.com/prettier/prettier/issues/10259
 * @see https://github.com/prettier/prettier/issues/4424
 */
export function definePrinter(options: Options): void {
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
    Object.create(estreePrinter) as Printer<BaseNode | undefined>
  );

  printer.print = (
    path: AstPath<BaseNode | undefined>,
    options: Options,
    print: (path: AstPath<BaseNode | undefined>) => doc.builders.Doc,
    args: unknown
  ) => {
    const node = path.getValue();
    const hasPrettierIgnore = checkPrettierIgnore(
      path,
      defaultHasPrettierIgnore
    );

    if (
      isGlimmerClassProperty(node) ||
      isGlimmerExportDefaultDeclaration(node) ||
      isGlimmerExportDefaultDeclarationTS(node) ||
      isGlimmerExpressionStatement(node) ||
      isGlimmerExpressionStatementTS(node)
    ) {
      if (hasPrettierIgnore) {
        return printRawText(path, options);
      } else {
        let printed = defaultPrint(path, options, print, args);

        assert('Expected Glimmer doc to be an array', Array.isArray(printed));

        // Remove the semicolons that Prettier added so we can manage them
        if (docMatchesString(printed[0], ';')) {
          printed.shift();
        }

        if (docMatchesString(printed[printed.length - 1], ';')) {
          printed.pop();
        }

        if (
          !options.templateExportDefault &&
          docMatchesString(printed[0], 'export') &&
          docMatchesString(printed[1], 'default')
        ) {
          printed = printed.slice(2);
          if (docMatchesString(printed[0], '')) {
            printed.shift();
          }
        }

        if (options.semi && getGlimmerExpression(node).extra.forceSemi) {
          // We only need to push the semi-colon in semi: true mode because
          // in semi: false mode, the ambiguous statement will get a prefixing
          // semicolon
          printed.push(';');
        }

        return printed;
      }
    } else if (hasPrettierIgnore) {
      return printRawText(path, options);
    } else {
      return defaultPrint(path, options, print, args);
    }
  };

  /** Prints embedded GlimmerExpressions/GlimmerTemplates. */
  printer.embed = (
    path: AstPath<BaseNode | undefined>,
    _print: (path: AstPath<BaseNode | undefined>) => doc.builders.Doc,
    textToDoc: (text: string, options: Options) => doc.builders.Doc,
    embedOptions: Options
  ) => {
    const wasPreprocessed = options.__inputWasPreprocessed;
    const node = path.getValue();
    const hasPrettierIgnore = checkPrettierIgnore(
      path,
      defaultHasPrettierIgnore
    );

    if (hasPrettierIgnore) {
      return printRawText(path, embedOptions);
    }

    try {
      if (wasPreprocessed && isGlimmerTemplateLiteral(node)) {
        return printTemplateLiteral(
          printTemplateContent(node, textToDoc, embedOptions)
        );
      } else if (!wasPreprocessed && isGlimmerClassProperty(node)) {
        return printTemplateTag(
          printTemplateContent(node.key.arguments[0], textToDoc, embedOptions),
          node.extra.isDefaultTemplate ?? false
        );
      } else if (!wasPreprocessed && isGlimmerArrayExpression(node)) {
        return printTemplateTag(
          printTemplateContent(
            node.elements[0].arguments[0],
            textToDoc,
            embedOptions
          ),
          node.extra.isDefaultTemplate ?? false
        );
      }
    } catch (error: unknown) {
      console.error(error);
      return printRawText(path, embedOptions);
    }

    // Nothing to embed, so move on to the regular printer.
    return null;
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
  plugin: string | Plugin<BaseNode | undefined>
): plugin is Plugin<BaseNode | undefined> & {
  printers: { estree: Printer<BaseNode | undefined> };
} {
  return Boolean(
    typeof plugin !== 'string' && plugin.printers && plugin.printers['estree']
  );
}

function printRawText(
  path: AstPath<BaseNode | undefined>,
  options: Options
): string {
  const node = path.getValue();
  if (!node) {
    return '';
  }
  assert('expected start', node.start);
  assert('expected end', node.end);
  let raw = options.originalText.slice(node.start, node.end);

  if (!options.__inputWasPreprocessed) {
    // HACK: We don't have access to the original raw text :-(
    raw = raw.replaceAll(`[${TEMPLATE_TAG_PLACEHOLDER}(\``, TEMPLATE_TAG_OPEN);
    raw = raw.replaceAll('`, { strictMode: true })]', TEMPLATE_TAG_CLOSE);
  }

  return raw;
}

function checkPrettierIgnore(
  path: AstPath<BaseNode | undefined>,
  hasPrettierIgnore: (path: AstPath<BaseNode | undefined>) => boolean
): boolean {
  return (
    hasPrettierIgnore(path) ||
    (!!path.getParentNode() &&
      path.callParent((parent) =>
        checkPrettierIgnore(parent, hasPrettierIgnore)
      ))
  );
}

function docMatchesString(
  doc: doc.builders.Doc | undefined,
  string: string
): doc is string {
  return typeof doc === 'string' && doc.trim() === string;
}
