import type { Node } from '@babel/types';
import type {
  AstPath,
  Options as PrettierOptions,
  Printer,
  doc,
} from 'prettier';
import { printers as estreePrinters } from 'prettier/plugins/estree';
import {
  TEMPLATE_TAG_CLOSE,
  TEMPLATE_TAG_OPEN,
  TEMPLATE_TAG_PLACEHOLDER,
} from '../config';
import type { Options } from '../options';
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
import { assert } from '../utils/index';
import {
  printTemplateContent,
  printTemplateLiteral,
  printTemplateTag,
} from './template';

const estreePrinter = estreePrinters['estree'] as Printer<Node | undefined>;

export const printer: Printer<Node | undefined> = {
  ...estreePrinter,

  print(
    path: AstPath<Node | undefined>,
    options: Options,
    print: (path: AstPath<Node | undefined>) => doc.builders.Doc,
    args: unknown,
  ) {
    const { node } = path;
    const hasPrettierIgnore = checkPrettierIgnore(path);

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
        let printed = estreePrinter.print(path, options, print, args);
        assert('Expected Glimmer doc to be an array', Array.isArray(printed));
        trimPrinted(printed);

        if (
          !options.templateExportDefault &&
          docMatchesString(printed[0], 'export') &&
          docMatchesString(printed[1], 'default')
        ) {
          printed = printed.slice(2);
          trimPrinted(printed);
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
      return estreePrinter.print(path, options, print, args);
    }
  },

  /** Prints embedded GlimmerExpressions/GlimmerTemplates. */
  embed(path: AstPath<Node | undefined>, embedOptions: PrettierOptions) {
    const { node } = path;
    const wasPreprocessed = (embedOptions as Options).__inputWasPreprocessed;

    const hasPrettierIgnore = checkPrettierIgnore(path);

    if (hasPrettierIgnore) {
      return printRawText(path, embedOptions as Options);
    }

    return async (textToDoc) => {
      try {
        if (wasPreprocessed && isGlimmerTemplateLiteral(node)) {
          const content = await printTemplateContent(
            node,
            textToDoc,
            embedOptions as Options,
          );
          return printTemplateLiteral(content);
        } else if (!wasPreprocessed && isGlimmerClassProperty(node)) {
          const content = await printTemplateContent(
            node.key.arguments[0],
            textToDoc,
            embedOptions as Options,
          );
          return printTemplateTag(
            content,
            node.extra.isDefaultTemplate ?? false,
          );
        } else if (!wasPreprocessed && isGlimmerArrayExpression(node)) {
          const content = await printTemplateContent(
            node.elements[0].arguments[0],
            textToDoc,
            embedOptions as Options,
          );
          return printTemplateTag(
            content,
            node.extra.isDefaultTemplate ?? false,
          );
        }
      } catch (error: unknown) {
        console.error(error);
        return printRawText(path, embedOptions as Options);
      }

      // Nothing to embed, so move on to the regular printer.
      return;
    };
  },

  /**
   * Turn off any built-in prettier-ignore handling because it will skip
   * embedding, which will print `[__GLIMMER_TEMPLATE(...)]` instead of
   * `<template>...</template>`.
   */
  hasPrettierIgnore: undefined,
};

/**
 * Remove the semicolons and empty strings that Prettier added so we can manage
 * them.
 */
function trimPrinted(printed: doc.builders.Doc[]): void {
  while (
    docMatchesString(printed[0], ';') ||
    docMatchesString(printed[0], '')
  ) {
    printed.shift();
  }

  while (
    docMatchesString(printed.at(-1), ';') ||
    docMatchesString(printed.at(-1), '')
  ) {
    printed.pop();
  }
}

function printRawText(
  { node }: AstPath<Node | undefined>,
  options: Options,
): string {
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

function hasPrettierIgnore(path: AstPath<Node | undefined>): boolean {
  return path.node?.leadingComments?.at(-1)?.value.trim() === 'prettier-ignore';
}

function checkPrettierIgnore(path: AstPath<Node | undefined>): boolean {
  return (
    hasPrettierIgnore(path) ||
    (!!path.getParentNode() &&
      path.callParent((parent) => checkPrettierIgnore(parent)))
  );
}

function docMatchesString(
  doc: doc.builders.Doc | undefined,
  string: string,
): doc is string {
  return typeof doc === 'string' && doc.trim() === string;
}
