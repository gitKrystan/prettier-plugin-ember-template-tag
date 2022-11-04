import type { NodePath } from '@babel/core';
import type { Expression, Node } from '@babel/types';
import {
  isArrayExpression,
  isArrowFunctionExpression,
  isExpressionStatement,
  isParenthesizedExpression,
  isRegExpLiteral,
  isUnaryExpression,
} from '@babel/types';

import type { Options } from '../options';
import type { BaseNode } from '../types/ast';
import { isGlimmerExpression, isGlimmerTSAsExpression } from '../types/glimmer';

/**
 * Checks if the next expression will start with (, [, `, /, +, -
 *
 * HACK: In a perfect world, we'd just print the next line and check the
 * beginning to see if our embedded Glimmer Expression needs a semicolon.
 * Unfortunately, this seems impossible with Prettier's current architecture.
 *
 * Thus, we're checking to see if the next line _should_ start with an ambiguous
 * character based on what we know about Prettier's logic. This is a much
 * simplified version of [Prettier's ASI protection
 * function](https://github.com/prettier/prettier/blob/ca246afacee8e6d5db508dae01730c9523bbff1d/src/language-js/print/statement.js#L89)
 * (which was impossible to use because Prettier doesn't export it or some of
 * the classes necessary to recreate it).
 *
 * If we have bugs re: unnecessary semicolons, this is a great place to look. :)
 */
export function hasAmbiguousNextLine(
  path: NodePath<BaseNode>,
  options: Options
): boolean {
  // Note: getNextSibling().node will be undefined if there is no sibling
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (path.getNextSibling().node) {
    // Assumption: It's part of a list and will likely get some disambiguating
    // punctuation
    return false;
  }

  const nextLine = getNextLine(path as NodePath);

  return (
    !!nextLine &&
    isExpressionStatement(nextLine) &&
    isAmbiguousExpression(nextLine.expression, options)
  );
}

function getNextLine(path: NodePath): Node | null {
  const parentPath = path.parentPath;
  if (parentPath) {
    // Note: getNextSibling().node will be undefined if there is no sibling
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return parentPath.getNextSibling().node ?? getNextLine(parentPath);
  } else {
    return null;
  }
}

function isAmbiguousExpression(
  expression: Expression,
  options: Options
): boolean {
  return (
    isGlimmerExpression(expression) ||
    isGlimmerTSAsExpression(expression) ||
    startsWithParenthesis(expression, options) ||
    startsWithSquareBracket(expression) ||
    startsWithTick(expression) ||
    startsWithPlusOrMinus(expression) ||
    ('expression' in expression &&
      typeof expression.expression === 'object' &&
      isAmbiguousExpression(expression.expression, options))
  );
}

function startsWithParenthesis(
  expression: Expression,
  options: Options
): boolean {
  return (
    isParenthesizedExpression(expression) ||
    (isArrowFunctionExpression(expression) &&
      (options.arrowParens === 'always' || expression.params.length > 1))
  );
}

function startsWithSquareBracket(expression: Expression): boolean {
  return isArrayExpression(expression);
}

function startsWithTick(expression: Expression): boolean {
  return isRegExpLiteral(expression);
}

function startsWithPlusOrMinus(expression: Expression): boolean {
  return (
    isUnaryExpression(expression) &&
    (expression.operator === '+' || expression.operator === '-')
  );
}
