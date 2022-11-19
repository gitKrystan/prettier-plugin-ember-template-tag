import type { NodePath } from '@babel/core';
import { traverse } from '@babel/core';
import type { Node, TemplateLiteral } from '@babel/types';
import {
  isBinaryExpression,
  isMemberExpression,
  isTaggedTemplateExpression,
} from '@babel/types';
import { getTemplateLocals } from '@glimmer/syntax';
import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import type { Parser } from 'prettier';
import { parsers as babelParsers } from 'prettier/parser-babel';

import {
  PRINTER_NAME,
  TEMPLATE_TAG_NAME,
  TEMPLATE_TAG_PLACEHOLDER,
} from './config';
import type { Options } from './options';
import { definePrinter } from './print/index';
import type { BaseNode } from './types/ast';
import type {
  GlimmerExpressionExtra,
  GlimmerTemplateExtra,
} from './types/glimmer';
import {
  getGlimmerExpression,
  isGlimmerClassProperty,
  isGlimmerExportDefaultDeclaration,
  isGlimmerExportDefaultDeclarationTS,
} from './types/glimmer';
import type {
  RawGlimmerArrayExpression,
  RawGlimmerClassProperty,
} from './types/raw';
import {
  hasRawGlimmerArrayExpression,
  isRawGlimmerArrayExpression,
  isRawGlimmerCallExpression,
  isRawGlimmerClassProperty,
} from './types/raw';
import { hasAmbiguousNextLine } from './utils/ambiguity';
import { assert, squish } from './utils/index';

const typescript = babelParsers['babel-ts'] as Parser<BaseNode | undefined>;

const preprocess: Required<Parser<BaseNode | undefined>>['preprocess'] = (
  text: string,
  options: Options
) => {
  let preprocessed: string;
  if (text.includes(TEMPLATE_TAG_PLACEHOLDER)) {
    // This happens when Prettier is being run via eslint + eslint-plugin-ember
    // See https://github.com/ember-cli/eslint-plugin-ember/issues/1659
    options.__inputWasPreprocessed = true;
    preprocessed = text;
  } else {
    options.__inputWasPreprocessed = false;
    preprocessed = preprocessEmbeddedTemplates(text, {
      getTemplateLocals,

      templateTag: TEMPLATE_TAG_NAME,
      templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,

      includeSourceMaps: false,
      includeTemplateTokens: false,

      relativePath: options.filepath,
    }).output;
  }

  return desugarDefaultExportTemplates(preprocessed);
};

export const parser: Parser<BaseNode | undefined> = {
  ...typescript,
  astFormat: PRINTER_NAME,

  preprocess(text: string, options: Options): string {
    definePrinter(options);
    const js = preprocess(text, options);
    return typescript.preprocess?.(js, options) ?? js;
  },

  parse(
    text: string,
    parsers: Record<string, Parser<unknown>>,
    options: Options
  ): BaseNode {
    const ast = typescript.parse(text, parsers, options);
    traverse(ast as Node, {
      enter: makeEnter(options),
      exit: makeExit(),
    });
    assert('expected ast', ast);
    return ast;
  },
};

function makeEnter(options: Options): (path: NodePath) => void {
  return (path: NodePath) => {
    const node = path.node;
    const parentNode = path.parentPath?.node;

    if (
      parentNode &&
      'property' in parentNode &&
      isRawGlimmerCallExpression(parentNode.property)
    ) {
      throw new SyntaxError('Ember <template> tag used as an object property.');
    } else if (
      isBinaryExpression(node) &&
      (hasRawGlimmerArrayExpression(node.left) ||
        hasRawGlimmerArrayExpression(node.right))
    ) {
      throw new SyntaxError('Ember <template> tag used in binary expression.');
    } else if (
      isTaggedTemplateExpression(node) &&
      hasRawGlimmerArrayExpression(node.tag)
    ) {
      throw new SyntaxError(
        'Ember <template> tag used as tagged template expression.'
      );
    } else if (
      isMemberExpression(node) &&
      hasRawGlimmerArrayExpression(node.object)
    ) {
      throw new SyntaxError('Ember <template> tag used as member expression.');
    }

    if (isRawGlimmerArrayExpression(node)) {
      tagGlimmerExpression(node, hasAmbiguousNextLine(path, options));
      tagGlimmerTemplate(node.elements[0].arguments[0]);
    } else if (isRawGlimmerClassProperty(node)) {
      tagGlimmerExpression(node, hasAmbiguousNextLine(path, options));
      tagGlimmerTemplate(node.key.arguments[0]);
    }
  };
}

function makeExit(): (path: NodePath) => void {
  return ({ node }: NodePath) => {
    if (
      isGlimmerExportDefaultDeclaration(node) ||
      isGlimmerExportDefaultDeclarationTS(node) ||
      isGlimmerClassProperty(node)
    ) {
      getGlimmerExpression(node).extra.isDefaultTemplate = true;
    }
  };
}

function tagGlimmerExpression(
  node: RawGlimmerArrayExpression | RawGlimmerClassProperty,
  forceSemi: boolean
): void {
  const extra: GlimmerExpressionExtra = {
    isGlimmerTemplate: true,
    forceSemi,
  };
  node.extra =
    typeof node.extra === 'object' ? { ...node.extra, ...extra } : extra;
}

function tagGlimmerTemplate(node: TemplateLiteral): void {
  const extra: GlimmerTemplateExtra = {
    isGlimmerTemplate: true,
  };
  node.extra =
    typeof node.extra === 'object' ? { ...node.extra, ...extra } : extra;
}

/**
 * Desugar template tag default exports because they parse as
 * ExpressionStatement, which has a bunch of irrelevant custom semicolon
 * handling in Prettier that is very difficult to undo. We can optionally
 * re-sugar on print. See `templateExportDefault` option.
 *
 * HACK: An attempt was made to do this via babel transforms but it destroyed
 * Prettier's newline preservation logic.
 */
function desugarDefaultExportTemplates(preprocessed: string): string {
  const placeholderOpen = `[${TEMPLATE_TAG_PLACEHOLDER}`; // intentionally missing ]

  // (^|;)\s*(\()?\s*\[__GLIMMER_TEMPLATE
  const sugaredDefaultExport = new RegExp(
    `(^|;)\\s*(\\()?\\s*\\${placeholderOpen}`
  );
  const desugaredDefaultExport = `$1 export default $2${placeholderOpen}`;

  const lines = preprocessed.split(/\r?\n/);
  const desugaredLines: string[] = [];
  let previousLine = '';
  let blockLevel = 0;

  for (let line of lines) {
    // HACK: This is pretty fragile as it will increment for, e.g., "{" which
    // doesn't actually increment the block level IRL
    const inc = (line.match(/{/g) ?? []).length;
    blockLevel += inc;

    const dec = (line.match(/}/g) ?? []).length;
    blockLevel -= dec;

    let squished = squish(line);

    if (
      !squished.endsWith('// prettier-ignore') &&
      !squished.endsWith('/* prettier-ignore */') &&
      previousLine !== '// prettier-ignore' &&
      previousLine !== '/* prettier-ignore */' &&
      !previousLine.endsWith('=') &&
      blockLevel === 0
    ) {
      line = line.replace(sugaredDefaultExport, desugaredDefaultExport);
      squished = squish(line);
    }

    desugaredLines.push(line);

    if (squished.length > 0) {
      previousLine = squished;
    }
  }

  return desugaredLines.join('\r\n');
}
