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

/** Returns true if the GlimmerTemplate path is already a default template. */
export function isDefaultTemplate(path: NodePath): boolean {
  return (
    // Top level `<template></template>`
    path.parent.type === 'Program' ||
    // Top level `<template></template> as TemplateOnlyComponent<Signature>`
    (path.parent.type === 'TSAsExpression' &&
      path.parentPath?.parentPath?.parent.type === 'Program')
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
  return null;
}
