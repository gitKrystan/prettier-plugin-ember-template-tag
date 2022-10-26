// FIXME: Get ETI to export these + types
// @ts-expect-error
import * as util from 'ember-template-imports/src/util';

export const PARSER_NAME = 'ember-template-tag';
export const PRINTER_NAME = 'ember-template-tag-estree';

export const TEMPLATE_TAG_NAME: string = util.TEMPLATE_TAG_NAME;
export const TEMPLATE_TAG_PLACEHOLDER: string = util.TEMPLATE_TAG_PLACEHOLDER;

export const TEMPLATE_TAG_OPEN = `<${TEMPLATE_TAG_NAME}>`;
export const TEMPLATE_TAG_CLOSE = `</${TEMPLATE_TAG_NAME}>`;

export const GLIMMER_EXPRESSION_TYPE = 'GlimmerExpression';
