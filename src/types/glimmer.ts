import type {
  ExportDefaultDeclaration,
  ExpressionStatement,
  Node,
  ObjectExpression,
  StaticBlock,
  TSAsExpression,
} from '@babel/types';
import type { Parsed as RawGlimmerTemplate } from 'content-tag';

type GlimmerTemplate = (ObjectExpression | StaticBlock) & {
  /**
   * Range of the contents, inclusive of inclusive of the
   * `<template></template>` tags.
   */
  range: [start: number, end: number];

  /** Beginning of the range, before the opening `<template>` tag. */
  start: number;

  /** End of the range, after the closing `</template>` tag. */
  end: number;

  extra: {
    isGlimmerTemplate: true;
    template: RawGlimmerTemplate;
    [key: string]: unknown;
  };
};

/** Returns true if the node is a GlimmerTemplate. */
export function isGlimmerTemplate(node: Node): node is Node & GlimmerTemplate {
  return node.extra?.['isGlimmerTemplate'] === true;
}

export type GlimmerTemplateParent =
  | GlimmerExpressionStatement
  | GlimmerExpressionStatementTS
  | GlimmerExportDefaultDeclaration
  | GlimmerExportDefaultDeclarationTS;

/**
 * Type predicate for nodes that should be special-cased as the parent of a
 * GlimmerTemplate.
 */
export function isGlimmerTemplateParent(
  node: Node | undefined,
): node is GlimmerTemplateParent {
  if (!node) return false;

  return (
    isGlimmerTemplate(node) ||
    isGlimmerExpressionStatement(node) ||
    isGlimmerExpressionStatementTS(node) ||
    isGlimmerExportDefaultDeclaration(node) ||
    isGlimmerExportDefaultDeclarationTS(node)
  );
}

type GlimmerExpressionStatement = ExpressionStatement & {
  expression: GlimmerTemplate;
};

/**
 * Type predicate for:
 *
 * ```gts
 * <template></template>;
 * ```
 */
function isGlimmerExpressionStatement(
  node: Node,
): node is GlimmerExpressionStatement {
  return (
    node.type === 'ExpressionStatement' && isGlimmerTemplate(node.expression)
  );
}

type GlimmerExpressionStatementTS = ExpressionStatement & {
  expression: TSAsExpression & {
    expression: GlimmerTemplate;
  };
};

/**
 * Type predicate for:
 *
 * ```gts
 * <template></template> as TemplateOnlyComponent<Signature>
 * ```
 */
function isGlimmerExpressionStatementTS(
  node: Node,
): node is GlimmerExpressionStatementTS {
  return (
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'TSAsExpression' &&
    isGlimmerTemplate(node.expression.expression)
  );
}

type GlimmerExportDefaultDeclaration = ExportDefaultDeclaration & {
  declaration: GlimmerTemplate;
};

/**
 * Type predicate for:
 *
 * ```gts
 * export default <template></template>;
 * ```
 */
function isGlimmerExportDefaultDeclaration(
  node: Node,
): node is GlimmerExportDefaultDeclaration {
  return (
    node.type === 'ExportDefaultDeclaration' &&
    isGlimmerTemplate(node.declaration)
  );
}

type GlimmerExportDefaultDeclarationTS = ExportDefaultDeclaration & {
  declaration: TSAsExpression & {
    expression: GlimmerTemplate;
  };
};

/**
 * Type predicate for:
 *
 * ```gts
 * export default <template></template> as TemplateOnlyComponent<Signature>
 * ```
 */
function isGlimmerExportDefaultDeclarationTS(
  node: Node,
): node is GlimmerExportDefaultDeclarationTS {
  return (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration.type === 'TSAsExpression' &&
    isGlimmerTemplate(node.declaration.expression)
  );
}
