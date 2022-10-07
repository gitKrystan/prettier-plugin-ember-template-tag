
> ember-template-tag-prettier@0.0.0 example /Users/krystanhuffmenne/Code/ember-template-tag-prettier
> vite build && ./node_modules/.bin/prettier --plugin . example.gjs

vite v3.1.6 building for production...
transforming...
✓ 452 modules transformed.
rendering chunks...
dist/ember-template-tag-prettier.cjs   1172.74 KiB / gzip: 243.50 KiB
{
  estreePrinter: {
    preprocess: [Function: preprocess],
    print: [Function: genericPrint],
    embed: [Function: embed],
    insertPragma: [Function: insertPragma],
    massageAstNode: [Function: clean] { ignoredProperties: [Set] },
    hasPrettierIgnore: [Function: hasPrettierIgnore],
    willPrintOwnComments: [Function: willPrintOwnComments],
    canAttachComment: [Function: canAttachComment],
    printComment: [Function: printComment],
    isBlockComment: [Function: isBlockComment],
    handleComments: {
      avoidAstMutation: true,
      ownLine: [Function: handleOwnLineComment],
      endOfLine: [Function: handleEndOfLineComment],
      remaining: [Function: handleRemainingComment]
    },
    getCommentChildNodes: [Function: getCommentChildNodes]
  }
}
{
  GJSPrinter: {
    preprocess: [Function: preprocess],
    print: [Function: genericPrint],
    embed: [Function: embed],
    insertPragma: [Function: insertPragma],
    massageAstNode: [Function: clean] { ignoredProperties: [Set] },
    hasPrettierIgnore: [Function: hasPrettierIgnore],
    willPrintOwnComments: [Function: willPrintOwnComments],
    canAttachComment: [Function: canAttachComment],
    printComment: [Function: printComment],
    isBlockComment: [Function: isBlockComment],
    handleComments: {
      avoidAstMutation: true,
      ownLine: [Function: handleOwnLineComment],
      endOfLine: [Function: handleEndOfLineComment],
      remaining: [Function: handleRemainingComment]
    },
    getCommentChildNodes: [Function: getCommentChildNodes]
  }
}
preprocess {
  output: "import Component from '@glimmer/component';\n" +
    '\n' +
    '  [__GLIMMER_TEMPLATE(`\n' +
    '  <h1>   Hello World   </h1>\n' +
    '`, { strictMode: true })]\n' +
    '\n' +
    'const temp = [__GLIMMER_TEMPLATE(`\n' +
    '\n' +
    '  <h1>   Hello World   </h1>\n' +
    '`, { strictMode: true })]\n' +
    '\n' +
    '/**\n' +
    ' * An example GJS file on which we can run the Prettier for GJS plugin.\n' +
    ' */\n' +
    'export default class MyComponent\n' +
    '  extends Component {\n' +
    '  [__GLIMMER_TEMPLATE(`\n' +
    '    <h1>   Hello World   </h1>\n' +
    '  `, { strictMode: true })]\n' +
    '\n' +
    '\n' +
    '        // comment\n' +
    '}\n',
  replacements: [
    {
      type: 'start',
      index: 47,
      oldLength: 10,
      newLength: 21,
      originalCol: 3,
      originalLine: 3
    },
    {
      type: 'end',
      index: 87,
      oldLength: 11,
      newLength: 25,
      originalCol: 1,
      originalLine: 5
    },
    {
      type: 'start',
      index: 113,
      oldLength: 10,
      newLength: 21,
      originalCol: 14,
      originalLine: 7
    },
    {
      type: 'end',
      index: 154,
      oldLength: 11,
      newLength: 25,
      originalCol: 1,
      originalLine: 10
    },
    {
      type: 'start',
      index: 304,
      oldLength: 10,
      newLength: 21,
      originalCol: 3,
      originalLine: 17
    },
    {
      type: 'end',
      index: 348,
      oldLength: 11,
      newLength: 25,
      originalCol: 3,
      originalLine: 19
    }
  ]
}
parsed Pt {
  type: 'File',
  start: 0,
  end: 458,
  loc: d {
    start: p { line: 1, column: 0, index: 0 },
    end: p { line: 24, column: 0, index: 458 },
    filename: undefined,
    identifierName: undefined
  },
  range: [ 0, 458 ],
  errors: [],
  program: Pt {
    type: 'Program',
    start: 0,
    end: 458,
    loc: d {
      start: [p],
      end: [p],
      filename: undefined,
      identifierName: undefined
    },
    range: [ 0, 458 ],
    sourceType: 'module',
    interpreter: null,
    body: [ [Pt], [Pt], [Pt], [Pt] ],
    directives: []
  },
  comments: [
    {
      type: 'CommentBlock',
      value: '*\n' +
        ' * An example GJS file on which we can run the Prettier for GJS plugin.\n' +
        ' ',
      start: 217,
      end: 296,
      loc: [d]
    },
    {
      type: 'CommentLine',
      value: ' comment',
      start: 445,
      end: 455,
      loc: [d]
    }
  ],
  tokens: [
    Ee { type: [or], value: 'import', start: 0, end: 6, loc: [d] },
    Ee { type: [or], value: 'Component', start: 7, end: 16, loc: [d] },
    Ee { type: [or], value: 'from', start: 17, end: 21, loc: [d] },
    Ee {
      type: [or],
      value: '@glimmer/component',
      start: 22,
      end: 42,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 42, end: 43, loc: [d] },
    Ee { type: [or], value: undefined, start: 47, end: 48, loc: [d] },
    Ee {
      type: [or],
      value: '__GLIMMER_TEMPLATE',
      start: 48,
      end: 66,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 66, end: 67, loc: [d] },
    Ee { type: [or], value: '`', start: 67, end: 68, loc: [d] },
    Ee {
      type: [or],
      value: '\n  <h1>   Hello World   </h1>\n',
      start: 68,
      end: 98,
      loc: [d]
    },
    Ee { type: [or], value: '`', start: 98, end: 99, loc: [d] },
    Ee { type: [or], value: undefined, start: 99, end: 100, loc: [d] },
    Ee { type: [or], value: undefined, start: 101, end: 102, loc: [d] },
    Ee {
      type: [or],
      value: 'strictMode',
      start: 103,
      end: 113,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 113, end: 114, loc: [d] },
    Ee { type: [or], value: 'true', start: 115, end: 119, loc: [d] },
    Ee { type: [or], value: undefined, start: 120, end: 121, loc: [d] },
    Ee { type: [or], value: undefined, start: 121, end: 122, loc: [d] },
    Ee { type: [or], value: undefined, start: 122, end: 123, loc: [d] },
    Ee { type: [or], value: 'const', start: 125, end: 130, loc: [d] },
    Ee { type: [or], value: 'temp', start: 131, end: 135, loc: [d] },
    Ee { type: [or], value: '=', start: 136, end: 137, loc: [d] },
    Ee { type: [or], value: undefined, start: 138, end: 139, loc: [d] },
    Ee {
      type: [or],
      value: '__GLIMMER_TEMPLATE',
      start: 139,
      end: 157,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 157, end: 158, loc: [d] },
    Ee { type: [or], value: '`', start: 158, end: 159, loc: [d] },
    Ee {
      type: [or],
      value: '\n\n  <h1>   Hello World   </h1>\n',
      start: 159,
      end: 190,
      loc: [d]
    },
    Ee { type: [or], value: '`', start: 190, end: 191, loc: [d] },
    Ee { type: [or], value: undefined, start: 191, end: 192, loc: [d] },
    Ee { type: [or], value: undefined, start: 193, end: 194, loc: [d] },
    Ee {
      type: [or],
      value: 'strictMode',
      start: 195,
      end: 205,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 205, end: 206, loc: [d] },
    Ee { type: [or], value: 'true', start: 207, end: 211, loc: [d] },
    Ee { type: [or], value: undefined, start: 212, end: 213, loc: [d] },
    Ee { type: [or], value: undefined, start: 213, end: 214, loc: [d] },
    Ee { type: [or], value: undefined, start: 214, end: 215, loc: [d] },
    {
      type: 'CommentBlock',
      value: '*\n' +
        ' * An example GJS file on which we can run the Prettier for GJS plugin.\n' +
        ' ',
      start: 217,
      end: 296,
      loc: [d]
    },
    Ee { type: [or], value: 'export', start: 297, end: 303, loc: [d] },
    Ee { type: [or], value: 'default', start: 304, end: 311, loc: [d] },
    Ee { type: [or], value: 'class', start: 312, end: 317, loc: [d] },
    Ee {
      type: [or],
      value: 'MyComponent',
      start: 318,
      end: 329,
      loc: [d]
    },
    Ee { type: [or], value: 'extends', start: 332, end: 339, loc: [d] },
    Ee {
      type: [or],
      value: 'Component',
      start: 340,
      end: 349,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 350, end: 351, loc: [d] },
    Ee { type: [or], value: undefined, start: 354, end: 355, loc: [d] },
    Ee {
      type: [or],
      value: '__GLIMMER_TEMPLATE',
      start: 355,
      end: 373,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 373, end: 374, loc: [d] },
    Ee { type: [or], value: '`', start: 374, end: 375, loc: [d] },
    Ee {
      type: [or],
      value: '\n    <h1>   Hello World   </h1>\n  ',
      start: 375,
      end: 409,
      loc: [d]
    },
    Ee { type: [or], value: '`', start: 409, end: 410, loc: [d] },
    Ee { type: [or], value: undefined, start: 410, end: 411, loc: [d] },
    Ee { type: [or], value: undefined, start: 412, end: 413, loc: [d] },
    Ee {
      type: [or],
      value: 'strictMode',
      start: 414,
      end: 424,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 424, end: 425, loc: [d] },
    Ee { type: [or], value: 'true', start: 426, end: 430, loc: [d] },
    Ee { type: [or], value: undefined, start: 431, end: 432, loc: [d] },
    Ee { type: [or], value: undefined, start: 432, end: 433, loc: [d] },
    Ee { type: [or], value: undefined, start: 433, end: 434, loc: [d] },
    {
      type: 'CommentLine',
      value: ' comment',
      start: 445,
      end: 455,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 456, end: 457, loc: [d] },
    Ee { type: [or], value: undefined, start: 458, end: 458, loc: [d] }
  ]
}
import Component from "@glimmer/component";

[
  __GLIMMER_TEMPLATE(
    `
  <h1>   Hello World   </h1>
`,
    { strictMode: true }
  ),
];

const temp = [
  __GLIMMER_TEMPLATE(
    `

  <h1>   Hello World   </h1>
`,
    { strictMode: true }
  ),
];
/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
export default class MyComponent extends Component {
  [__GLIMMER_TEMPLATE(
    `
    <h1>   Hello World   </h1>
  `,
    { strictMode: true }
  )];
}
