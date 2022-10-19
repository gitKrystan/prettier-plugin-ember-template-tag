import type { AstPath } from 'prettier';

import { TEMPLATE_TAG_PLACEHOLDER } from '../config';
import { isRecord } from '../utils';
import type {
  ArrayExpression,
  BaseNode,
  ClassProperty,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ExpressionStatement,
  Identifier,
  SimpleCallExpression,
  TemplateLiteral,
  TSAsExpression,
  VariableDeclaration,
  VariableDeclarator
} from './estree';
import {
  isArrayExpression,
  isClassProperty,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isExpressionStatement,
  isIdentifier,
  isSimpleCallExpression,
  isTemplateLiteral,
  isTSAsExpression,
  isVariableDeclaration,
  isVariableDeclarator
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

export interface GlimmerExportDefaultDeclarationTS
  extends ExportDefaultDeclaration {
  declaration: GlimmerTSAsExpression;
}

export function isGlimmerExportDefaultDeclarationTSPath(
  path: AstPath<BaseNode>
): path is AstPath<GlimmerExportDefaultDeclarationTS> {
  return path.match((node: BaseNode | null) => {
    return (
      isExportDefaultDeclaration(node) &&
      isGlimmerTSAsExpression(node.declaration)
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

export type GlimmerVariableDeclaration = Omit<
  VariableDeclaration,
  'declarations'
> & {
  declarations: Array<
    GlimmerVariableDeclarator | GlimmerVariableDeclaratorTS | VariableDeclarator
  >;
};

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
    (value.declarations.some(isGlimmerVariableDeclarator) ||
      value.declarations.some(isGlimmerVariableDeclaratorTS))
  );
}

export type GlimmerExportNamedDeclaration = Omit<
  ExportNamedDeclaration,
  'declaration'
> & {
  declaration: GlimmerVariableDeclaration;
};

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
  type: 'ArrayExpression';
  elements: [GlimmerCallExpression];
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

export function tagGlimmerArrayExpression(
  value: GlimmerArrayExpression,
  hasPrettierIgnore: boolean
): void {
  let tagged = value as unknown as TaggedGlimmerArrayExpression;
  tagged.type = 'GlimmerArrayExpression';
  tagged.hasPrettierIgnore = hasPrettierIgnore;
}

export type TaggedGlimmerArrayExpression = Omit<
  GlimmerArrayExpression,
  'type'
> & {
  // HACK: We need to change the type to avoid Prettier mistakenly adding a
  // semi-colon to prevent ASI issues.
  type: 'GlimmerArrayExpression';
  hasPrettierIgnore: boolean;
};

export function isTaggedGlimmerArrayExpressionPath(
  path: AstPath<BaseNode>
): path is AstPath<TaggedGlimmerArrayExpression> {
  return path.match((node: BaseNode | null) => {
    return isTaggedGlimmerArrayExpression(node);
  });
}

function isTaggedGlimmerArrayExpression(
  value: unknown
): value is TaggedGlimmerArrayExpression {
  return isRecord(value) && value.type === 'GlimmerArrayExpression';
}

export interface GlimmerVariableDeclarator extends VariableDeclarator {
  init: GlimmerArrayExpression;
}

export function isGlimmerVariableDeclarator(
  value: unknown
): value is GlimmerVariableDeclarator {
  return isVariableDeclarator(value) && isGlimmerArrayExpression(value.init);
}

export type GlimmerVariableDeclaratorTS = Omit<VariableDeclarator, 'init'> & {
  init: GlimmerTSAsExpression;
};

export function isGlimmerVariableDeclaratorTS(
  value: unknown
): value is GlimmerVariableDeclaratorTS {
  return isVariableDeclarator(value) && isGlimmerTSAsExpression(value.init);
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

export interface GlimmerTSAsExpression extends TSAsExpression {
  expression: GlimmerArrayExpression;
}

function isGlimmerTSAsExpression(
  value: unknown
): value is GlimmerTSAsExpression {
  return isTSAsExpression(value) && isGlimmerArrayExpression(value.expression);
}
