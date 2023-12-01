import type { Node } from '@babel/types';
import type { doc, Options as PrettierOptions, Printer } from 'prettier';
import type { AstPath } from 'prettier';
import { printers as estreePrinters } from 'prettier/plugins/estree.js';

import type { Options } from '../options.js';
import type { TemplateNode } from '../parse';
import { assert } from '../utils';
import { printTemplateContent, printTemplateTag } from './template';

const estreePrinter = estreePrinters['estree'] as Printer<Node | undefined>;

function getGlimmerExpression(node: Node | undefined): Node | null {
  if (!node) return null;
  if (node.extra?.['isGlimmerTemplate']) {
    return node;
  }
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration.extra?.['isGlimmerTemplate']
  ) {
    return node.declaration;
  }
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration.type === 'TSAsExpression' &&
    node.declaration.expression.extra?.['isGlimmerTemplate']
  ) {
    return node.declaration.expression;
  }
  return null;
}

function flattenDoc(doc: doc.builders.Doc): string[] {
  const array = (doc as unknown as doc.builders.Group).contents || doc;
  if (!Array.isArray(array)) return array as unknown as string[];
  return array.flatMap((x) =>
    (x as doc.builders.Group).contents
      ? flattenDoc((x as doc.builders.Group).contents)
      : Array.isArray(x)
      ? flattenDoc(x)
      : x,
  ) as string[];
}

/**
 * Search next non EmptyStatement node and set current print, so we can fix it
 * later if its ambiguous
 */
function saveCurrentPrintOnSiblingNode(
  path: AstPath<Node | undefined>,
  printed: doc.builders.Doc,
): void {
  const { index, siblings } = path;
  if (index !== null) {
    const nextNode = siblings
      ?.slice(index + 1)
      .find((n) => n?.type !== 'EmptyStatement');
    if (nextNode) {
      nextNode.extra = nextNode.extra || {};
      nextNode.extra['prevTemplatePrinted'] = printed;
    }
  }
}

function fixPreviousPrint(
  path: AstPath<Node | undefined>,
  options: Options,
  print: (path: AstPath<Node | undefined>) => doc.builders.Doc,
  args: unknown,
): void {
  const printedSemiFalse = estreePrinter.print(
    path,
    { ...options, semi: false },
    print,
    args,
  );
  const flat = flattenDoc(printedSemiFalse);
  const previousTemplatePrinted = path.node?.extra?.[
    'prevTemplatePrinted'
  ] as string[];
  const previousFlat = flattenDoc(previousTemplatePrinted);
  if (flat[0]?.startsWith(';') && previousFlat.at(-1) !== ';') {
    previousTemplatePrinted.push(';');
  }
}

export const printer: Printer<Node | undefined> = {
  ...estreePrinter,

  getVisitorKeys(node, nonTraversableKeys) {
    if (node === undefined) {
      return [];
    }
    if (node.extra?.['isGlimmerTemplate']) {
      return [];
    }
    return estreePrinter.getVisitorKeys?.(node, nonTraversableKeys) || [];
  },

  print(
    path: AstPath<Node | undefined>,
    options: Options,
    print: (path: AstPath<Node | undefined>) => doc.builders.Doc,
    args: unknown,
  ) {
    const { node } = path;
    const hasPrettierIgnore = checkPrettierIgnore(path);
    if (getGlimmerExpression(node)) {
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
        saveCurrentPrintOnSiblingNode(path, printed);
        return printed;
      }
    }

    if (options.semi && node?.extra?.['prevTemplatePrinted']) {
      fixPreviousPrint(path, options, print, args);
    }

    return hasPrettierIgnore
      ? printRawText(path, options)
      : estreePrinter.print(path, options, print, args);
  },

  /** Prints embedded GlimmerExpressions/GlimmerTemplates. */
  embed(path: AstPath<Node | undefined>, embedOptions: PrettierOptions) {
    const { node } = path;

    const hasPrettierIgnore = checkPrettierIgnore(path);
    const options = { ...embedOptions } as Options;

    if (hasPrettierIgnore) {
      return printRawText(path, embedOptions as Options);
    }

    return async (textToDoc) => {
      try {
        if (node?.extra?.['isGlimmerTemplate'] && node.extra['template']) {
          let content = null;
          let raw = false;
          try {
            content = await printTemplateContent(
              node.extra['template'] as string,
              textToDoc,
              embedOptions as Options,
            );
          } catch {
            content = node.extra['template'] as string;
            raw = true;
          }
          const extra = node.extra as TemplateNode['extra'];
          const { isDefaultTemplate, isAssignment, isAlreadyExportDefault } =
            extra;
          const useHardline = !isAssignment || isDefaultTemplate || false;
          const shouldExportDefault =
            (!isAlreadyExportDefault &&
              isDefaultTemplate &&
              options.templateExportDefault) ||
            false;
          const printed = printTemplateTag(content, {
            exportDefault: shouldExportDefault,
            useHardline,
            raw,
          });
          saveCurrentPrintOnSiblingNode(path, printed);
          return printed;
        }
      } catch (error) {
        console.log(error);
        const printed = [printRawText(path, embedOptions as Options)];
        saveCurrentPrintOnSiblingNode(path, printed);
        return printed;
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
  while (docMatchesString(printed[0], '')) {
    printed.shift();
  }
}

function printRawText(
  { node }: AstPath<Node | undefined>,
  options: Options,
): string {
  if (!node) {
    return '';
  }
  assert('expected start', typeof node.start == 'number');
  assert('expected end', typeof node.end == 'number');
  return options.originalText.slice(node.start, node.end);
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
