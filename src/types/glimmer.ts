import { type Comment } from '@babel/types';

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
    isAlreadyExportDefault: boolean;
    isAssignment: boolean;
    isDefaultTemplate: boolean;
    isGlimmerTemplate: boolean;
    template: string;
  };
}
