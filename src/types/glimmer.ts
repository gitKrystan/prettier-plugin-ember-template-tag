import type { NodePath } from '@babel/core';
import { is, type Comment, type Node } from '@babel/types';

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
    // FIXME: Is this actually used?
    isAlreadyExportDefault: boolean;
    isAssignment: boolean;
    isDefaultTemplate: boolean;
    template: string;
  };
}

// @ts-expect-error FIXME:
export function isGlimmerTemplate(node: Node): node is GlimmerTemplate {
  return node.extra?.['isGlimmerTemplate'] === true;
}

/** Returns true if the GlimmerTemplate path is already a default export. */
export function isAlreadyExportDefault(path: NodePath): boolean {
  return (
    path.parent.type === 'ExportDefaultDeclaration' ||
    path.parentPath?.parent.type === 'ExportDefaultDeclaration'
  );
}

// FIXME: Seems to overlap with isAlreadyExportDefault
/** Returns true if the GlimmerTemplate path is already a default template. */
export function isDefaultTemplate(path: NodePath): boolean {
  return (
    path.parent.type === 'ExportDefaultDeclaration' ||
    path.parent.type === 'Program' ||
    (path.parent.type === 'ExpressionStatement' &&
      path.parentPath?.parent.type === 'Program') ||
    (path.parent.type === 'TSAsExpression' &&
      path.parentPath?.parentPath?.parent.type === 'Program') ||
    path.parentPath?.parent.type === 'ExportDefaultDeclaration'
  );
}
