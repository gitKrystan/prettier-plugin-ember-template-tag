import type {
  ArrayExpression,
  BaseNode,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ExpressionStatement,
  Identifier,
  SimpleCallExpression,
  TemplateLiteral,
  VariableDeclaration,
  VariableDeclarator
} from 'estree';
import type { AstPath } from 'prettier';

import { TEMPLATE_TAG_PLACEHOLDER } from '../config';
import { isRecord } from '../utils';
import {
  ClassProperty,
  isArrayExpression,
  isClassProperty,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isExpressionStatement,
  isIdentifier,
  isSimpleCallExpression,
  isTemplateLiteral,
  isVariableDeclaration
} from './estree';

export interface GlimmerClassProperty extends ClassProperty {
  key: GlimmerCallExpression;
  value: null;
}

export function isGlimmerClassPropertyPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerClassProperty> {
  return path.match((node: BaseNode | null) => {
    return isClassProperty(node) && isGlimmerCallExpression(node.key);
  });
}

export interface GlimmerExportDefaultDeclaration
  extends ExportDefaultDeclaration {
  declaration: GlimmerArrayExpression;
}

export function isGlimmerExportDefaultDeclarationPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExportDefaultDeclaration> {
  return path.match((node: BaseNode | null) => {
    return (
      isExportDefaultDeclaration(node) &&
      isGlimmerArrayExpression(node.declaration)
    );
  });
}

export interface GlimmerExpressionStatement extends ExpressionStatement {
  expression: GlimmerArrayExpression;
}

export function isGlimmerExpressionStatementPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExpressionStatement> {
  return path.match((node: BaseNode | null) => {
    return (
      isExpressionStatement(node) && isGlimmerArrayExpression(node.expression)
    );
  });
}

export interface GlimmerVariableDeclaration extends VariableDeclaration {
  declarations: Array<GlimmerVariableDeclarator | VariableDeclarator>;
}

export function isGlimmerVariableDeclarationPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerVariableDeclaration> {
  return path.match((node: BaseNode | null) => {
    return isGlimmerVariableDeclaration(node);
  });
}

function isGlimmerVariableDeclaration(
  value: unknown
): value is GlimmerVariableDeclaration {
  return (
    isVariableDeclaration(value) &&
    value.declarations.some(isGlimmerVariableDeclarator)
  );
}

export interface GlimmerExportNamedDeclaration extends ExportNamedDeclaration {
  declaration: GlimmerVariableDeclaration;
}

export function isGlimmerExportNamedDeclaration(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExportNamedDeclaration> {
  return path.match((node: BaseNode | null) => {
    return (
      isExportNamedDeclaration(node) &&
      isGlimmerVariableDeclaration(node.declaration)
    );
  });
}

export interface GlimmerArrayExpression extends ArrayExpression {
  elements: [GlimmerCallExpression];
  hasPrettierIgnore?: true;
}

export function isGlimmerArrayExpressionPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerArrayExpression> {
  return path.match((node: BaseNode | null) => {
    return isGlimmerArrayExpression(node);
  });
}

function isGlimmerArrayExpression(
  value: unknown
): value is GlimmerArrayExpression {
  return isArrayExpression(value) && isGlimmerCallExpression(value.elements[0]);
}

export interface GlimmerVariableDeclarator extends VariableDeclarator {
  init: GlimmerArrayExpression;
}

export function isGlimmerVariableDeclarator(
  value: unknown
): value is GlimmerVariableDeclarator {
  return (
    isRecord(value) &&
    value.type === 'VariableDeclarator' &&
    isGlimmerArrayExpression(value.init)
  );
}

export interface GlimmerCallExpression extends SimpleCallExpression {
  callee: GlimmerIdentifier;
  arguments: [TemplateLiteral];
}

function isGlimmerCallExpression(
  value: unknown
): value is GlimmerCallExpression {
  return (
    isSimpleCallExpression(value) &&
    isIdentifier(value.callee) &&
    value.callee.name === TEMPLATE_TAG_PLACEHOLDER &&
    Array.isArray(value.arguments) &&
    isTemplateLiteral(value.arguments[0])
  );
}

export interface GlimmerIdentifier extends Identifier {
  name: typeof TEMPLATE_TAG_PLACEHOLDER; // This is just `string` so not SUPER useful lolol
}
