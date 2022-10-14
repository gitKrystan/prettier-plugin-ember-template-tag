import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import type { BaseNode } from 'estree';
import type { Parser } from 'prettier';

import { TEMPLATE_TAG_NAME, TEMPLATE_TAG_PLACEHOLDER } from './config';

export const preprocess: Required<Parser<BaseNode>>['preprocess'] = (
  text,
  options
) => {
  return preprocessEmbeddedTemplates(text, {
    // FIXME: Need to figure this out for ESLint but probably OK not to do it
    // for prettier support?
    getTemplateLocals(_template: string): string[] {
      return [];
    },

    templateTag: TEMPLATE_TAG_NAME,
    templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,

    includeSourceMaps: false,
    includeTemplateTokens: false,

    relativePath: options.filepath
  }).output;
};
