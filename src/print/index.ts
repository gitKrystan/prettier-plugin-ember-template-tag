import type { BaseNode } from 'estree';
import type { ParserOptions, Plugin, Printer } from 'prettier';

import {
  isGlimmerArrayExpressionPath,
  isGlimmerClassPropertyPath,
  isGlimmerExportDefaultDeclarationPath,
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

  Reflect.setPrototypeOf(printer, Object.create(estreePrinter));

  /**
   * We really only need to `embed` Glimmer Array Expressions and Glimmer Class
   * Properties. Otherwise, we can rely on the built-in estree printer, but we
   * need to conditionally turn off semi-colon printing to ensure we don't end
   * up with `</template>;`.
   */
  printer.embed = (path, print, textToDoc, embedOptions) => {
    if (
      isGlimmerExportDefaultDeclarationPath(path) ||
      isGlimmerExpressionStatementPath(path)
    ) {
      embedOptions.semi = false;
      return printer.print(path, embedOptions, print);
    } else if (isGlimmerVariableDeclarationPath(path)) {
      const node = path.getValue();
      const lastDeclarator = node.declarations[node.declarations.length - 1];
      if (isGlimmerVariableDeclarator(lastDeclarator)) {
        embedOptions.semi = false;
      }
      return printer.print(path, embedOptions, print);
    }

    if (isGlimmerArrayExpressionPath(path)) {
      return printGlimmerArrayExpression(path, textToDoc, embedOptions);
    } else if (isGlimmerClassPropertyPath(path)) {
      return printGlimmerClassProperty(path, textToDoc, embedOptions);
    } else {
      embedOptions.semi = originalOptions.semi;
      return printer.embed?.(path, print, textToDoc, embedOptions) ?? null;
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
