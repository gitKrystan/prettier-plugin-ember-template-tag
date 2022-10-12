import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import type { BaseNode } from 'estree';
import type { Parser } from 'prettier';

import { TEMPLATE_TAG_NAME, TEMPLATE_TAG_PLACEHOLDER } from './config';

export const preprocess: Required<Parser<BaseNode>>['preprocess'] = (
  text,
  options
) => {
  const js = preprocessEmbeddedTemplates(text, {
    // FIXME: Need to figure this out for ESLint but probably OK not to do it
    // for prettier support?
    getTemplateLocals(_template: string): string[] {
      return [];
    },
    // getTemplateLocalsRequirePath: 'ember-cli-htmlbars',
    // getTemplateLocalsExportPath: '_GlimmerSyntax.getTemplateLocals',

    templateTag: TEMPLATE_TAG_NAME,
    templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,

    includeSourceMaps: false, // TypeError: path_1.default.parse is not a function
    includeTemplateTokens: true,

    relativePath: options.filepath
  }).output;

  console.info('preprocess', `\n${js}`);

  return js;
};
