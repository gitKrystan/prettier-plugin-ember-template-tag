import type { AstPath } from 'prettier';

import { TEMPLATE_TAG_PLACEHOLDER } from '../config';
import { isRecord } from '../utils';
import type {
  ArrayExpression,
  BaseNode,
  ClassProperty,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ExpressionStatement,
  Identifier,
  SimpleCallExpression,
  TemplateLiteral,
  TSAsExpression,
  VariableDeclaration,
  VariableDeclarator
} from './estree';
import {
  isArrayExpression,
  isClassProperty,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isExpressionStatement,
  isIdentifier,
  isSimpleCallExpression,
  isTemplateLiteral,
  isTSAsExpression,
  isVariableDeclaration,
  isVariableDeclarator
} from './estree';

/**
 * Before preprocess:
 * @example
 * ```gts
 * class MyComponent {
 *   <template>hello</template>
 * }
 *
 * class MyComponent extends Component<MySignature> {
 *   <template>hello</template>
 * }
 * ```
 *
 * After preprocess:
 * @example
 * ```ts
 * class MyComponent {
 *   // Note, this is NOT an array! This is a computed property name
 *   [__GLIMMER_TEMPLATE(...)]
 * }
 *
 * class MyComponent extends Component<MySignature> {
 *   // Note, this is NOT an array! This is a computed property name
 *   [__GLIMMER_TEMPLATE(...)]
 * }
 * ```
 */
export interface GlimmerClassProperty extends ClassProperty {
  key: GlimmerCallExpression;
  value: null;
}

export function isGlimmerClassPropertyPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerClassProperty> {
  return path.match((node: BaseNode | null) => {
    return isClassProperty(node) && isGlimmerCallExpression(node.key);
  });
}

/**
 * Before preprocess:
 * @example
 * ```gts
 * export default <template>hello</template>
 * ```
 *
 * After preprocess:
 * @example
 * ```ts
 * export default [__GLIMMER_TEMPLATE(...)]
 * ```
 */
export interface GlimmerExportDefaultDeclaration
  extends ExportDefaultDeclaration {
  declaration: GlimmerArrayExpression;
}

export function isGlimmerExportDefaultDeclarationPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExportDefaultDeclaration> {
  return path.match((node: BaseNode | null) => {
    return (
      isExportDefaultDeclaration(node) &&
      isGlimmerArrayExpression(node.declaration)
    );
  });
}

/**
 * Before preprocess:
 * @example
 * ```gts
 * export default <template>hello</template> as Component<MySignature>
 * ```
 *
 * After preprocess:
 * @example
 * ```ts
 * export default [__GLIMMER_TEMPLATE(...)] as Component<MySignature>
 * ```
 */
export interface GlimmerExportDefaultDeclarationTS
  extends ExportDefaultDeclaration {
  declaration: GlimmerTSAsExpression;
}

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
 * Before preprocess:
 * @example
 * ```gts
 * <template>hello</template>
 * ```
 *
 * After preprocess (and de-sugaring):
 * @example
 * ```ts
 * export default [__GLIMMER_TEMPLATE(...)]
 * ```
 */
export interface GlimmerExpressionStatement extends ExpressionStatement {
  expression: GlimmerArrayExpression;
}

export function isGlimmerExpressionStatementPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExpressionStatement> {
  return path.match((node: BaseNode | null) => {
    return (
      isExpressionStatement(node) && isGlimmerArrayExpression(node.expression)
    );
  });
}

/**
 * Before preprocess:
 * @example
 * ```gts
 * <template>hello</template> as Component<MySignature>
 * ```
 *
 * After preprocess (and desugaring):
 * @example
 * ```ts
 * export default [__GLIMMER_TEMPLATE(...)] as Component<MySignature>
 * ```
 */
export interface GlimmerExpressionStatementTS
  extends Omit<ExpressionStatement, 'expression'> {
  expression: GlimmerTSAsExpression;
}

export function isGlimmerExpressionStatementTSPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExpressionStatementTS> {
  return path.match((node: BaseNode | null) => {
    return (
      isExpressionStatement(node) && isGlimmerTSAsExpression(node.expression)
    );
  });
}

/**
 * Before preprocess:
 * @example
 * ```gts
 * const MyComponent = <template>hello</template>
 *
 * const MyComponent = <template>hello</template> as Component<MySignature>
 * ```
 *
 * After preprocess:
 * @example
 * ```ts
 * const MyComponent = [__GLIMMER_TEMPLATE(...)]
 *
 * const MyComponent = [__GLIMMER_TEMPLATE(...)] as Component<MySignature>
 * ```
 */
export interface GlimmerVariableDeclaration
  extends Omit<VariableDeclaration, 'declarations'> {
  declarations: Array<
    GlimmerVariableDeclarator | GlimmerVariableDeclaratorTS | VariableDeclarator
  >;
}

export function isGlimmerVariableDeclarationPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerVariableDeclaration> {
  return path.match((node: BaseNode | null) => {
    return isGlimmerVariableDeclaration(node);
  });
}

function isGlimmerVariableDeclaration(
  value: unknown
): value is GlimmerVariableDeclaration {
  return (
    isVariableDeclaration(value) &&
    (value.declarations.some(isGlimmerVariableDeclarator) ||
      value.declarations.some(isGlimmerVariableDeclaratorTS))
  );
}

export interface GlimmerExportNamedDeclaration
  extends Omit<ExportNamedDeclaration, 'declaration'> {
  declaration: GlimmerVariableDeclaration;
}

/**
 * Before preprocess:
 * @example
 * ```gts
 * export const MyComponent = <template>hello</template>
 *
 * export const MyComponent = <template>hello</template> as Component<MySignature>
 * ```
 *
 * After preprocess:
 * @example
 * ```ts
 * export const MyComponent = [__GLIMMER_TEMPLATE(...)]
 *
 * export const MyComponent = [__GLIMMER_TEMPLATE(...)] as Component<MySignature>
 * ```
 */
export function isGlimmerExportNamedDeclarationPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExportNamedDeclaration> {
  return path.match((node: BaseNode | null) => {
    return (
      isExportNamedDeclaration(node) &&
      isGlimmerVariableDeclaration(node.declaration)
    );
  });
}

/**
 * Before preprocess: n/a
 *
 * After preprocess:
 * The array expression is the `[__GLIMMER_TEMPLATE(...)]` portion of many of
 * the top-level nodes (except `GlimmerClassProperty`).
 */
export interface GlimmerArrayExpression extends ArrayExpression {
  type: 'ArrayExpression';
  elements: [GlimmerCallExpression];
}

export function isGlimmerArrayExpressionPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerArrayExpression> {
  return path.match((node: BaseNode | null) => {
    return isGlimmerArrayExpression(node);
  });
}

function isGlimmerArrayExpression(
  value: unknown
): value is GlimmerArrayExpression {
  return isArrayExpression(value) && isGlimmerCallExpression(value.elements[0]);
}

export function tagGlimmerArrayExpression(
  value: GlimmerArrayExpression,
  hasPrettierIgnore: boolean
): void {
  let tagged = value as unknown as TaggedGlimmerArrayExpression;
  tagged.type = 'GlimmerArrayExpression';
  tagged.hasPrettierIgnore = hasPrettierIgnore;
}

/**
 * A tagged version of `GlimmerArrayExpression` that tracks if its parent
 * has a prettier-ignore comment so that we can transform the pre-processed
 * expression back into an unformatted `<template>` tag in those cases.
 */
export interface TaggedGlimmerArrayExpression
  extends Omit<GlimmerArrayExpression, 'type'> {
  // HACK: We need to change the type to avoid Prettier mistakenly adding a
  // semi-colon to prevent ASI issues.
  type: 'GlimmerArrayExpression';
  hasPrettierIgnore: boolean;
}

export function isTaggedGlimmerArrayExpressionPath(
  path: AstPath<BaseNode>
): path is AstPath<TaggedGlimmerArrayExpression> {
  return path.match((node: BaseNode | null) => {
    return isTaggedGlimmerArrayExpression(node);
  });
}

function isTaggedGlimmerArrayExpression(
  value: unknown
): value is TaggedGlimmerArrayExpression {
  return isRecord(value) && value.type === 'GlimmerArrayExpression';
}

/**
 * Before preprocess: n/a
 *
 * After preprocess, this represents the declarator in a declaration statement:
 * ```gts
 * const MyComponent = [__GLIMMER_TEMPLATE(...)]
 *                     ^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GlimmerVariableDeclarator extends VariableDeclarator {
  init: GlimmerArrayExpression;
}

export function isGlimmerVariableDeclarator(
  value: unknown
): value is GlimmerVariableDeclarator {
  return isVariableDeclarator(value) && isGlimmerArrayExpression(value.init);
}

/**
 * Before preprocess: n/a
 *
 * After preprocess, this represents the declarator in a declaration statement:
 * ```gts
 * const MyComponent = [__GLIMMER_TEMPLATE(...)] as Component<MySignature>
 *                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GlimmerVariableDeclaratorTS
  extends Omit<VariableDeclarator, 'init'> {
  init: GlimmerTSAsExpression;
}

export function isGlimmerVariableDeclaratorTS(
  value: unknown
): value is GlimmerVariableDeclaratorTS {
  return isVariableDeclarator(value) && isGlimmerTSAsExpression(value.init);
}

/**
 * Before preprocess: n/a
 *
 * After preprocess:
 * ```ts
 * __GLIMMER_TEMPLATE(...)
 * ```
 */
export interface GlimmerCallExpression extends SimpleCallExpression {
  callee: GlimmerIdentifier;
  arguments: [TemplateLiteral];
}

function isGlimmerCallExpression(
  value: unknown
): value is GlimmerCallExpression {
  return (
    isSimpleCallExpression(value) &&
    isIdentifier(value.callee) &&
    value.callee.name === TEMPLATE_TAG_PLACEHOLDER &&
    Array.isArray(value.arguments) &&
    isTemplateLiteral(value.arguments[0])
  );
}

/**
 * Before preprocess: n/a
 *
 * After preprocess, this is the Identifier portion of the
 * `GlimmerCallExpression`:
 * ```ts
 * __GLIMMER_TEMPLATE(...)
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GlimmerIdentifier extends Identifier {
  name: typeof TEMPLATE_TAG_PLACEHOLDER; // This is just `string` so not SUPER useful, just documentation
}

/**
 * Before preprocess: n/a
 *
 * After preprocess, this is the TypeScript `as` expression used in many of the
 * other TS nodes, e.g.
 * ```ts
 * export default [__GLIMMER_TEMPLATE(...)] as Component<MySignature>
 *                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GlimmerTSAsExpression extends TSAsExpression {
  expression: GlimmerArrayExpression;
}

function isGlimmerTSAsExpression(
  value: unknown
): value is GlimmerTSAsExpression {
  return isTSAsExpression(value) && isGlimmerArrayExpression(value.expression);
}
