import { getTemplateLocals } from '@glimmer/syntax';
import { Preprocessor } from 'content-tag';
import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates.js';
// FIXME: Do we need this?
// import {
//   TEMPLATE_TAG_NAME,
//   TEMPLATE_TAG_PLACEHOLDER,
// } from 'ember-template-imports/lib/util.js';
import { describe, expect, test } from 'vitest';

import { AMBIGUOUS_PLACEHOLDER } from '../helpers/ambiguous.js';
import type { TestCase } from '../helpers/cases.js';
import { getAllCases } from '../helpers/cases.js';
import { format } from '../helpers/format.js';
import type { Config } from '../helpers/make-suite.js';
import { makeSuite } from '../helpers/make-suite.js';

// FIXME: Are these still accurate?
export const TEMPLATE_TAG_NAME = 'template';
export const TEMPLATE_TAG_PLACEHOLDER = '__GLIMMER_TEMPLATE';

const p = new Preprocessor();

describe('format', () => {
  makeSuite(getAllCases, preprocessedTest)({ name: 'with preprocessed code' });

  /*
   FIXME: We might not be able to maintain compatibility with
   ember-template-imports preprocessed code, which would mean we'd have to
   drop support for it altogether (and remove the set of tests below).

   This would cause compat issues with eslint-plugin-ember until they are using
   content-tag. Additionally, if they start using content-tag, running prettier
   via eslint-plugin-ember won't be possible until _this_ library supports
   content-tag.
  */
  makeSuite(
    getAllCases,
    preprocessedTestLegacy,
  )({ name: 'with legacy ember-template-imports preprocessed code' });
});

function preprocessedTest(config: Config, testCase: TestCase): void {
  test(`it formats ${testCase.name}`, async () => {
    const code = testCase.code.replaceAll(AMBIGUOUS_PLACEHOLDER, '');
    const preprocessed = p.process(code);
    const result = await format(preprocessed, config.options);
    expect(result).toMatchSnapshot();
  });
}

function preprocessedTestLegacy(config: Config, testCase: TestCase): void {
  test(`it formats ${testCase.name}`, async () => {
    const code = testCase.code.replaceAll(AMBIGUOUS_PLACEHOLDER, '');
    const preprocessed = preprocessEmbeddedTemplates(code, {
      getTemplateLocals,

      templateTag: TEMPLATE_TAG_NAME,
      templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,

      includeSourceMaps: false,
      includeTemplateTokens: false,

      relativePath: testCase.path,
    }).output;
    const result = await format(preprocessed, config.options);
    expect(result).toMatchSnapshot();
  });
}
