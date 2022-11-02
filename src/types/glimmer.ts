import type {
  ExportDefaultDeclaration,
  ExpressionStatement,
  TemplateLiteral,
  TSAsExpression,
} from '@babel/types';
import {
  isExportDefaultDeclaration,
  isExpressionStatement,
  isTSAsExpression,
} from '@babel/types';
import type { AstPath } from 'prettier';

import { GLIMMER_EXPRESSION_TYPE } from '../config';
import { isRecord } from '../utils/index';
import type { BaseNode } from './ast';

/**
 * Extracts a `GlimmerExpression` node from the given parent node.
 *
 * @param templateLiteral The `TemplateLiteral` node associated with the parent.
 * @param parentNode The parent node.
 */
export function extractGlimmerExpression(
  templateLiteral: TemplateLiteral,
  {
    start,
    end,
    range,
    loc,
    leadingComments,
    trailingComments,
    innerComments,
    extra,
  }: BaseNode,
  forceSemi = false
): GlimmerExpression {
  return {
    ...templateLiteral,
    type: GLIMMER_EXPRESSION_TYPE,
    start,
    end,
    range,
    loc,
    leadingComments,
    trailingComments,
    innerComments,
    extra: {
      ...extra,
      ...templateLiteral.extra,
      forceSemi,
    },
  };
}

/**
 * A custom node similar to a `TemplateLiteral` that contains the template's
 * content and also tracks if its parent has a prettier-ignore comment so that
 * we can transform the pre-processed expression back into an unformatted
 * `<template>` tag in those cases.
 */
export interface GlimmerExpression extends Omit<TemplateLiteral, 'type'> {
  type: typeof GLIMMER_EXPRESSION_TYPE;
  extra: {
    forceSemi: boolean;
    [key: string]: unknown;
  };
}

/** Type predicate */
export function isGlimmerExpressionPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExpression> {
  return path.match((node: BaseNode | null) => {
    return isGlimmerExpression(node);
  });
}

/** Type predicate */
export function isGlimmerExpression(
  node: BaseNode | null | undefined
): node is GlimmerExpression {
  return isRecord(node) && node.type === GLIMMER_EXPRESSION_TYPE;
}

/**
 * @example
 *
 * ```gts
 * export default <template>hello</template>;
 * ```
 */
export interface GlimmerExportDefaultDeclaration
  extends Omit<ExportDefaultDeclaration, 'declaration'> {
  declaration: GlimmerExpression;
}

/** Type predicate */
export function isGlimmerExportDefaultDeclarationPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExportDefaultDeclaration> {
  return path.match((node: BaseNode | null) => {
    return (
      isExportDefaultDeclaration(node) && isGlimmerExpression(node.declaration)
    );
  });
}

/**
 * @example
 *
 * ```gts
 * export default <template>hello</template> as Component<MySignature>
 * ```
 */
export interface GlimmerExportDefaultDeclarationTS
  extends Omit<ExportDefaultDeclaration, 'declaration'> {
  declaration: GlimmerTSAsExpression;
}

/** Type predicate */
export function isGlimmerExportDefaultDeclarationTSPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExportDefaultDeclarationTS> {
  return path.match((node: BaseNode | null) => {
    return (
      isExportDefaultDeclaration(node) &&
      isGlimmerTSAsExpression(node.declaration)
    );
  });
}

/**
 * This is the TypeScript `as` expression used in many of the other TS nodes,
 *
 * @example
 *
 * ```ts
 * export default <template>Hello</template> as Component<MySignature>
 *                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GlimmerTSAsExpression
  extends Omit<TSAsExpression, 'expression'> {
  expression: GlimmerExpression;
}

/** Type predicate */
export function isGlimmerTSAsExpression(
  node: BaseNode | null | undefined
): node is GlimmerTSAsExpression {
  return isTSAsExpression(node) && isGlimmerExpression(node.expression);
}

/**
 * @example
 *
 * ```gts
 * <template>hello</template>;
 * ```
 */
export interface GlimmerExpressionStatement
  extends Omit<ExpressionStatement, 'expression'> {
  expression: GlimmerExpression;
}

/** Type predicate */
export function isGlimmerExpressionStatementPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExpressionStatement> {
  return path.match((node: BaseNode | null) => {
    return isExpressionStatement(node) && isGlimmerExpression(node.expression);
  });
}

/**
 * @example
 *
 * ```gts
 * <template>hello</template> as Component<MySignature>
 * ```
 */
export interface GlimmerExpressionStatementTS
  extends Omit<ExpressionStatement, 'expression'> {
  expression: GlimmerTSAsExpression;
}

/** Type predicate */
export function isGlimmerExpressionStatementTSPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExpressionStatementTS> {
  return path.match((node: BaseNode | null) => {
    return (
      isExpressionStatement(node) && isGlimmerTSAsExpression(node.expression)
    );
  });
}

/** Returns the `GlimmerExpression` within the given `path`. */
export function getGlimmerExpression(
  path: AstPath<
    | GlimmerExportDefaultDeclaration
    | GlimmerExportDefaultDeclarationTS
    | GlimmerExpressionStatement
    | GlimmerExpressionStatementTS
  >
): GlimmerExpression {
  const node = path.getValue();

  switch (node.type) {
    case 'ExportDefaultDeclaration':
      if ('expression' in node.declaration) {
        return node.declaration.expression;
      } else {
        return node.declaration;
      }
    case 'ExpressionStatement':
      if ('expression' in node.expression) {
        return node.expression.expression;
      } else {
        return node.expression;
      }
  }
}
