import type { NodePath } from '@babel/core';
import type { Comment, Node } from '@babel/types';

/** The raw GlimmerTemplate node as parsed by the content-tag parser. */
export interface RawGlimmerTemplate {
  type: 'expression' | 'class-member';

  tagName: 'template';

  /** Raw template contents */
  contents: string;

  /**
   * Range of the contents, inclusive of inclusive of the
   * `<template></template>` tags.
   */
  range: {
    start: number;
    end: number;
  };

  /**
   * Range of the template contents, not inclusive of the
   * `<template></template>` tags.
   */
  contentRange: {
    start: number;
    end: number;
  };

  /** Range of the opening `<template>` tag. */
  startRange: {
    end: number;
    start: number;
  };

  /** Range of the closing `</template>` tag. */
  endRange: {
    start: number;
    end: number;
  };
}

export interface GlimmerTemplate {
  type: 'FunctionDeclaration';

  leadingComments: Comment[];

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
    template: string;
  };
}

/** Returns true if the node is a GlimmerTemplate. */
// @ts-expect-error FIXME:
export function isGlimmerTemplate(node: Node): node is GlimmerTemplate {
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

/**
 *
 */
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
