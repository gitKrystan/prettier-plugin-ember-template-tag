import type {
  ArrayExpression,
  BaseNode,
  ExportDefaultDeclaration,
  Expression,
  ExpressionStatement,
  Identifier,
  Pattern,
  PrivateIdentifier,
  SimpleCallExpression,
  TemplateLiteral,
  VariableDeclaration
} from 'estree';

import { isRecord } from '../utils';

// FIXME: Type might not be accurate...derive from Prettier estree types?
export interface ClassProperty extends BaseNode {
  type: 'ClassProperty';
  start?: number;
  end?: number;
  key: Expression | PrivateIdentifier;
  value: Expression | Pattern | null;
  static: boolean;
  variance: unknown;
  computed: boolean;
}

export function isArrayExpression(value: unknown): value is ArrayExpression {
  return isRecord(value) && value.type === 'ArrayExpression';
}

export function isClassProperty(value: unknown): value is ClassProperty {
  return isRecord(value) && value.type === 'ClassProperty';
}

export function isExportDefaultDeclaration(
  value: unknown
): value is ExportDefaultDeclaration {
  return isRecord(value) && value.type === 'ExportDefaultDeclaration';
}

export function isExpressionStatement(
  value: unknown
): value is ExpressionStatement {
  return isRecord(value) && value.type === 'ExpressionStatement';
}

export function isIdentifier(value: unknown): value is Identifier {
  return isRecord(value) && value.type === 'Identifier';
}

export function isSimpleCallExpression(
  value: unknown
): value is SimpleCallExpression {
  return isRecord(value) && value.type === 'CallExpression';
}

export function isTemplateLiteral(value: unknown): value is TemplateLiteral {
  return isRecord(value) && value.type === 'TemplateLiteral';
}

export function isVariableDeclaration(
  value: unknown
): value is VariableDeclaration {
  return isRecord(value) && value.type === 'VariableDeclaration';
}
