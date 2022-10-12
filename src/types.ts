import type {
  ArrayExpression,
  BaseNode,
  CallExpression,
  Expression,
  ExpressionStatement,
  Identifier,
  Pattern,
  PrivateIdentifier,
  TemplateLiteral
} from 'estree';
import type { AstPath, doc } from 'prettier';

import { TEMPLATE_TAG_PLACEHOLDER } from './config';
import { isRecord } from './utils';

export type GlimmerIdentifier = Identifier & {
  name: typeof TEMPLATE_TAG_PLACEHOLDER; // This is just `string` so not SUPER useful lolol
};

export type GlimmerCallExpression = CallExpression & {
  callee: GlimmerIdentifier;
};

export type GlimmerArrayExpression = ArrayExpression & {
  elements: [GlimmerCallExpression];
};

// FIXME: Type might not be accurate...derive from Prettier estree types?
export type ClassProperty = BaseNode & {
  type: 'ClassProperty';
  start?: number;
  end?: number;
  key: Expression | PrivateIdentifier;
  value: Expression | Pattern | null;
  static: boolean;
  variance: unknown;
  computed: boolean;
};

export type GlimmerExpressionStatement = ExpressionStatement & {
  expression: GlimmerArrayExpression;
};

export type GlimmerClassProperty = ClassProperty & {
  key: GlimmerCallExpression;
  value: null;
};

export function isDocGroup(doc: unknown): doc is doc.builders.Group {
  return isRecord(doc) && doc.type === 'group';
}

export function isTemplateLiteral(value: unknown): value is TemplateLiteral {
  return isRecord(value) && value.type === 'TemplateLiteral';
}

export function isGlimmerClassProperty(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerClassProperty> {
  return path.match((node: BaseNode | null) => {
    return isClassProperty(node) && isGlimmerCallExpression(node.key);
  });
}

export function isGlimmerExpressionStatement(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExpressionStatement> {
  return path.match((node: BaseNode | null) => {
    return (
      isExpressionStatement(node) &&
      isArrayExpression(node.expression) &&
      isGlimmerCallExpression(node.expression.elements[0])
    );
  });
}

function isExpressionStatement(value: unknown): value is ExpressionStatement {
  return isRecord(value) && value.type === 'ExpressionStatement';
}

function isArrayExpression(value: unknown): value is ArrayExpression {
  return isRecord(value) && value.type === 'ArrayExpression';
}

function isCallExpression(value: unknown): value is CallExpression {
  return isRecord(value) && value.type === 'CallExpression';
}

function isClassProperty(value: unknown): value is ClassProperty {
  return isRecord(value) && value.type === 'ClassProperty';
}

function isIdentifier(value: unknown): value is Identifier {
  return isRecord(value) && value.type === 'Identifier';
}

function isGlimmerCallExpression(
  value: unknown
): value is GlimmerCallExpression {
  return (
    isCallExpression(value) &&
    isIdentifier(value.callee) &&
    value.callee.name === TEMPLATE_TAG_PLACEHOLDER
  );
}
