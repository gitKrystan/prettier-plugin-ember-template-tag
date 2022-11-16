import type {
  ArrayExpression,
  CallExpression,
  ClassProperty,
  Identifier,
  Node,
  TemplateLiteral,
} from '@babel/types';
import {
  isArrayExpression,
  isCallExpression,
  isClassProperty,
  isIdentifier,
  isNode,
  isTemplateLiteral,
} from '@babel/types';

import { TEMPLATE_TAG_PLACEHOLDER } from '../config';
import type { BaseNode } from './ast';

/**
 * Before preprocess: n/a
 *
 * After preprocess: The array expression is the `[__GLIMMER_TEMPLATE(...)]`
 * portion of many of the raw top-level nodes (except `GlimmerClassProperty`).
 */
export interface RawGlimmerArrayExpression extends ArrayExpression {
  type: 'ArrayExpression';
  elements: [RawGlimmerCallExpression];
}

/** Type predicate */
export function isRawGlimmerArrayExpression(
  value: Node | BaseNode | null | undefined
): value is RawGlimmerArrayExpression {
  return (
    isArrayExpression(value) && isRawGlimmerCallExpression(value.elements[0])
  );
}

/**
 * Before preprocess:
 *
 * @example
 *
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
 *
 * @example
 *
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
export interface RawGlimmerClassProperty extends ClassProperty {
  key: RawGlimmerCallExpression;
  value: null;
}

/** Type predicate */
export function isRawGlimmerClassProperty(
  value: BaseNode | null | undefined
): value is RawGlimmerClassProperty {
  return isClassProperty(value) && isRawGlimmerCallExpression(value.key);
}

/**
 * Before preprocess: n/a
 *
 * After preprocess:
 *
 * ```ts
 * __GLIMMER_TEMPLATE(...)
 * ```
 */
export interface RawGlimmerCallExpression extends CallExpression {
  callee: RawGlimmerIdentifier;
  arguments: [TemplateLiteral];
}

/** Type predicate */
export function isRawGlimmerCallExpression(
  value: BaseNode | null | undefined
): value is RawGlimmerCallExpression {
  return (
    isCallExpression(value) &&
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
 *
 * ```ts
 * __GLIMMER_TEMPLATE(...)
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
interface RawGlimmerIdentifier extends Identifier {
  name: typeof TEMPLATE_TAG_PLACEHOLDER; // This is just `string` so not SUPER useful, just documentation
}

/** Recursively checks if the node has a Glimmer Array Expression. */
export function hasRawGlimmerArrayExpression(node: Node): boolean {
  return (
    isRawGlimmerArrayExpression(node) ||
    ('expression' in node &&
      isNode(node.expression) &&
      hasRawGlimmerArrayExpression(node.expression))
  );
}
