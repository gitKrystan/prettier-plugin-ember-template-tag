
> ember-template-tag-prettier@0.0.0 example /Users/krystanhuffmenne/Code/ember-template-tag-prettier
> vite build && ./node_modules/.bin/prettier --loglevel debug --plugin . example.gjs

vite v3.1.6 building for production...
transforming...
✓ 462 modules transformed.
rendering chunks...
dist/ember-template-tag-prettier.cjs   1799.65 KiB / gzip: 390.24 KiB
preprocess 
import Component from '@glimmer/component';

          // comment before file

  [__GLIMMER_TEMPLATE(`

  <h1>   Module top level template. Module top level template. Module top level template. Module top level template. Module top level template. Module top level template.   </h1>




`, { strictMode: true })]

//        comment between templates

const Multiline = [__GLIMMER_TEMPLATE(`

  <h1>   Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template.   </h1>
`, { strictMode: true })]

const Oneline = [__GLIMMER_TEMPLATE(`      Module variable template (one line). `, { strictMode: true })]

export const Exported = [__GLIMMER_TEMPLATE(`       Exported variable template. Exported variable template.  Exported variable template.  Exported variable template.  Exported variable template. Exported variable template. Exported variable template. `, { strictMode: true })]

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
class MyComponent
  extends Component {
  [__GLIMMER_TEMPLATE(`
    <h1>   Class top level template. Class top level template. Class top level template. Class top level template. Class top level template. </h1>
  `, { strictMode: true })]

  what = `template literal that is not a template`


        // comment in the class
}

export default [__GLIMMER_TEMPLATE(`     Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. `, { strictMode: true })]

import Component from "@glimmer/component";

// comment before file

<template>
  <h1>
    Module top level template. Module top level template. Module top level
    template. Module top level template. Module top level template. Module top
    level template.
  </h1>
</template>

//        comment between templates

const Multiline = [
  __GLIMMER_TEMPLATE(
    `

  <h1>   Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template. Module variable template.   </h1>
`,
    { strictMode: true }
  ),
];

const Oneline = [
  __GLIMMER_TEMPLATE(`      Module variable template (one line). `, {
    strictMode: true,
  }),
];

export const Exported = [
  __GLIMMER_TEMPLATE(
    `       Exported variable template. Exported variable template.  Exported variable template.  Exported variable template.  Exported variable template. Exported variable template. Exported variable template. `,
    { strictMode: true }
  ),
];

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
class MyComponent extends Component {
  <template>
    <h1>
      Class top level template. Class top level template. Class top level
      template. Class top level template. Class top level template.
    </h1>
  </template>

  what = `template literal that is not a template`;

  // comment in the class
}

export default [
  __GLIMMER_TEMPLATE(
    `     Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. Explicit default export module top level component. `,
    { strictMode: true }
  ),
];
