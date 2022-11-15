// @ts-expect-error FIXME: TS7016 Get ETI to export these + types
import * as util from 'ember-template-imports/src/util';

export const PARSER_NAME = 'ember-template-tag';
export const PRINTER_NAME = 'ember-template-tag-estree';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const TEMPLATE_TAG_NAME = util.TEMPLATE_TAG_NAME as string;
export const TEMPLATE_TAG_PLACEHOLDER = util.TEMPLATE_TAG_PLACEHOLDER as string;
/* eslint-enable @typescript-eslint/no-unsafe-member-access */

export const TEMPLATE_TAG_OPEN = `<${TEMPLATE_TAG_NAME}>`;
export const TEMPLATE_TAG_CLOSE = `</${TEMPLATE_TAG_NAME}>`;
