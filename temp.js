
> ember-template-tag-prettier@0.0.0 example /Users/krystanhuffmenne/Code/ember-template-tag-prettier
> vite build && ./node_modules/.bin/prettier --plugin . example.gjs

vite v3.1.6 building for production...
transforming...
✓ 464 modules transformed.
rendering chunks...
dist/ember-template-tag-prettier.cjs   1799.34 KiB / gzip: 390.21 KiB
preprocess 
import Component from '@glimmer/component';

  [__GLIMMER_TEMPLATE(`

  <h1>   Hello World 1 Hello World 1Hello World 1Hello World 1Hello World 1Hello World 1Hello World 1Hello World 1Hello World 1  </h1>




`, { strictMode: true })]

const multiline = [__GLIMMER_TEMPLATE(`

  <h1>   Hello World 2 Hello World 2Hello World 2Hello World 2Hello World 2Hello World 2Hello World 2Hello World 2  </h1>
`, { strictMode: true })]

const oneline = [__GLIMMER_TEMPLATE(`      Hello World 4 {{true}}`, { strictMode: true })]

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
export default class MyComponent
  extends Component {
  [__GLIMMER_TEMPLATE(`
    <h1>   Hello World 3 Hello World 3Hello World 3Hello World 3Hello World 3Hello World 3Hello World 3Hello World 3  </h1>
  `, { strictMode: true })]

  what = `template literal that is not a template`


        // just a lil comment
}

import Component from "@glimmer/component";

<template>
  <h1>
    Hello World 1 Hello World 1Hello World 1Hello World 1Hello World 1Hello
    World 1Hello World 1Hello World 1Hello World 1
  </h1>
</template>;
const multiline = <template>
  <h1>
    Hello World 2 Hello World 2Hello World 2Hello World 2Hello World 2Hello
    World 2Hello World 2Hello World 2
  </h1>
</template>;
const oneline = <template> Hello World 4 {{true}}</template>;
/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
export default class MyComponent extends Component {
  <template>
    <h1>
      Hello World 3 Hello World 3Hello World 3Hello World 3Hello World 3Hello
      World 3Hello World 3Hello World 3
    </h1>
  </template>
  what = `template literal that is not a template`;
}
