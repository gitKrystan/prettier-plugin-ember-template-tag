import type { Node, ObjectExpression, StaticBlock } from '@babel/types';
import type { Parsed as RawGlimmerTemplate } from 'content-tag';

interface GlimmerTemplateProperties {
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
}

type GlimmerTemplate = (ObjectExpression | StaticBlock) &
  GlimmerTemplateProperties;

/** Returns true if the node is a GlimmerTemplate. */
export function isGlimmerTemplate(node: Node): node is Node & GlimmerTemplate {
  return node.extra?.['isGlimmerTemplate'] === true;
}

/** Extracts GlimmerTemplate from parent node. */
export function isGlimmerTemplateParent(
  node: Node | undefined,
): GlimmerTemplate | null {
  if (!node) return null;
  if (isGlimmerTemplate(node)) {
    return node;
  }

  // <template></template>;
  if (
    node.type === 'ExpressionStatement' &&
    isGlimmerTemplate(node.expression)
  ) {
    return node.expression;
  }

  // export default <template></template> as TemplateOnlyComponent<Signature>;
  if (
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'TSAsExpression' &&
    isGlimmerTemplate(node.expression.expression)
  ) {
    return node.expression.expression;
  }

  // export default <template></template>;
  if (
    node.type === 'ExportDefaultDeclaration' &&
    isGlimmerTemplate(node.declaration)
  ) {
    return node.declaration;
  }

  // export default <template></template> as TemplateOnlyComponent<Signature>;
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration.type === 'TSAsExpression' &&
    isGlimmerTemplate(node.declaration.expression)
  ) {
    return node.declaration.expression;
  }

  // FIXME: Do we need to handle this for the non export default case?
  // SUPER edge case:
  // export default <template></template> + 'oops';
  // TODO: content-tag should probably consider this a syntax error
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration.type === 'BinaryExpression'
  ) {
    if (isGlimmerTemplate(node.declaration.left)) {
      return node.declaration.left;
    }
    if (isGlimmerTemplate(node.declaration.right)) {
      return node.declaration.right;
    }
  }

  // FIXME: Do we need to handle this for the non export default case?
  // SUPER edge case:
  // export default <template></template>;
  // <template></template>
  // TODO: content-tag should probably consider this a syntax error
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration.type === 'CallExpression' &&
    isGlimmerTemplate(node.declaration.callee)
  ) {
    return node.declaration.callee;
  }

  return null;
}
