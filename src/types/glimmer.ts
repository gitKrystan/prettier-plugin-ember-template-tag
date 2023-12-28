import type { NodePath } from '@babel/core';
import type { Node } from '@babel/types';
import type { Parsed as RawGlimmerTemplate } from 'content-tag';

interface GlimmerTemplate {
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
    isDefaultTemplate: boolean;
    template: RawGlimmerTemplate;
    [key: string]: unknown;
  };
}

/** Returns true if the node is a GlimmerTemplate. */
export function isGlimmerTemplate(node: Node): node is Node & GlimmerTemplate {
  return node.extra?.['isGlimmerTemplate'] === true;
}

/** Returns true if the GlimmerTemplate path is in a "top level" position. */
export function isTopLevelTemplate(path: NodePath): boolean {
  return (
    // Top level `<template></template>`
    path.parent.type === 'Program' ||
    // Top level `<template></template> as TemplateOnlyComponent<Signature>`
    (path.parent.type === 'TSAsExpression' &&
      path.parentPath?.parentPath?.parent.type === 'Program') ||
    // Top level `class MyComponent { <template></template> }`
    path.node.type === 'StaticBlock'
  );
}

/** Extracts GlimmerTemplate from node. */
export function getGlimmerTemplate(
  node: Node | undefined,
): GlimmerTemplate | null {
  if (!node) return null;
  if (isGlimmerTemplate(node)) {
    return node;
  }
  if (
    node.type === 'ExportDefaultDeclaration' &&
    isGlimmerTemplate(node.declaration)
  ) {
    return node.declaration;
  }
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration.type === 'TSAsExpression' &&
    isGlimmerTemplate(node.declaration.expression)
  ) {
    return node.declaration.expression;
  }
  // SUPER edge case:
  // export default <template></template> + 'oops';
  if (
    node.type === 'ExportDefaultDeclaration' &&
    node.declaration.type === 'BinaryExpression'
  ) {
    if (isGlimmerTemplate(node.declaration.left)) {
      return node.declaration.left;
    } else if (isGlimmerTemplate(node.declaration.right)) {
      return node.declaration.right;
    }
  }
  return null;
}
