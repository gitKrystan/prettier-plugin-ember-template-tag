import type {
  ArrayExpression,
  BaseNode,
  Declaration,
  ExportNamedDeclaration,
  Expression,
  ExpressionStatement,
  Identifier,
  Pattern,
  PrivateIdentifier,
  SimpleCallExpression,
  TemplateLiteral,
  VariableDeclaration
} from 'estree';

export type {
  ArrayExpression,
  BaseNode,
  ExportNamedDeclaration,
  ExpressionStatement,
  Identifier,
  SimpleCallExpression,
  TemplateLiteral,
  VariableDeclaration,
  VariableDeclarator
} from 'estree';

import { isRecord } from '../utils';

// NOTE: Type is likely incomplete
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

// NOTE: Type is likely incomplete
export interface TSAsExpression extends BaseNode {
  type: 'TSAsExpression';
  expression: Expression;
}

export interface ExportDefaultDeclaration extends BaseNode {
  type: 'ExportDefaultDeclaration';
  declaration: Declaration | Expression | TSAsExpression;
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

export function isExportNamedDeclaration(
  value: unknown
): value is ExportNamedDeclaration {
  return isRecord(value) && value.type === 'ExportNamedDeclaration';
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

export function isTSAsExpression(value: unknown): value is TSAsExpression {
  return isRecord(value) && value.type === 'TSAsExpression';
}

export function isVariableDeclaration(
  value: unknown
): value is VariableDeclaration {
  return isRecord(value) && value.type === 'VariableDeclaration';
}
