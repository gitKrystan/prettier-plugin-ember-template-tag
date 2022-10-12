
> ember-template-tag-prettier@0.0.0 example /Users/krystanhuffmenne/Code/ember-template-tag-prettier
> vite build && ./node_modules/.bin/prettier --plugin . example.gjs "--debug-print-comments"

vite v3.1.6 building for production...
transforming...
✓ 462 modules transformed.
rendering chunks...
dist/ember-template-tag-prettier.cjs   1799.55 KiB / gzip: 390.21 KiB
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

{
  templateNode: Pt {
    type: 'TemplateLiteral',
    start: 675,
    end: 804,
    loc: d {
      start: [p],
      end: [p],
      filename: undefined,
      identifierName: undefined
    },
    range: [ 675, 804 ],
    expressions: [],
    quasis: [ [Pt] ]
  }
}
[
  {
    "type": "CommentBlock",
    "value": "*\n * An example GJS file on which we can run the Prettier for GJS plugin.\n ",
    "start": 518,
    "end": 597,
    "loc": {
      "start": { "line": 19, "column": 0, "index": 518 },
      "end": { "line": 21, "column": 3, "index": 597 }
    },
    "placement": "remaining",
    "leading": false,
    "trailing": true,
    "nodeDescription": "VariableDeclaration"
  },
  {
    "type": "CommentLine",
    "value": " just a lil comment",
    "start": 891,
    "end": 912,
    "loc": {
      "start": { "line": 31, "column": 8, "index": 891 },
      "end": { "line": 31, "column": 29, "index": 912 }
    },
    "placement": "remaining",
    "leading": false,
    "trailing": true,
    "nodeDescription": "ClassProperty what"
  }
]
