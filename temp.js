
> ember-template-tag-prettier@0.0.0 example /Users/krystanhuffmenne/Code/ember-template-tag-prettier
> vite build && ./node_modules/.bin/prettier --plugin . example.gjs

vite v3.1.6 building for production...
transforming...
✓ 454 modules transformed.
rendering chunks...
dist/ember-template-tag-prettier.cjs   1799.64 KiB / gzip: 390.04 KiB
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
    embed: [Function: embed],
    preprocess: [Function: preprocess],
    print: [Function: genericPrint],
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
preprocess import Component from '@glimmer/component';

  [__GLIMMER_TEMPLATE(`
  <h1>   Hello World 1   </h1>
`, { strictMode: true })]

const temp = [__GLIMMER_TEMPLATE(`

  <h1>   Hello World 2   </h1>
`, { strictMode: true })]

/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
export default class MyComponent
  extends Component {
  [__GLIMMER_TEMPLATE(`
    <h1>   Hello World 3   </h1>
  `, { strictMode: true })]

  what = `template literal that is not a template`


        // comment
}

parsed Pt {
  type: 'File',
  start: 0,
  end: 516,
  loc: d {
    start: p { line: 1, column: 0, index: 0 },
    end: p { line: 26, column: 0, index: 516 },
    filename: undefined,
    identifierName: undefined
  },
  range: [ 0, 516 ],
  errors: [],
  program: Pt {
    type: 'Program',
    start: 0,
    end: 516,
    loc: d {
      start: [p],
      end: [p],
      filename: undefined,
      identifierName: undefined
    },
    range: [ 0, 516 ],
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
      start: 221,
      end: 300,
      loc: [d]
    },
    {
      type: 'CommentLine',
      value: ' comment',
      start: 503,
      end: 513,
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
      value: '\n  <h1>   Hello World 1   </h1>\n',
      start: 68,
      end: 100,
      loc: [d]
    },
    Ee { type: [or], value: '`', start: 100, end: 101, loc: [d] },
    Ee { type: [or], value: undefined, start: 101, end: 102, loc: [d] },
    Ee { type: [or], value: undefined, start: 103, end: 104, loc: [d] },
    Ee {
      type: [or],
      value: 'strictMode',
      start: 105,
      end: 115,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 115, end: 116, loc: [d] },
    Ee { type: [or], value: 'true', start: 117, end: 121, loc: [d] },
    Ee { type: [or], value: undefined, start: 122, end: 123, loc: [d] },
    Ee { type: [or], value: undefined, start: 123, end: 124, loc: [d] },
    Ee { type: [or], value: undefined, start: 124, end: 125, loc: [d] },
    Ee { type: [or], value: 'const', start: 127, end: 132, loc: [d] },
    Ee { type: [or], value: 'temp', start: 133, end: 137, loc: [d] },
    Ee { type: [or], value: '=', start: 138, end: 139, loc: [d] },
    Ee { type: [or], value: undefined, start: 140, end: 141, loc: [d] },
    Ee {
      type: [or],
      value: '__GLIMMER_TEMPLATE',
      start: 141,
      end: 159,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 159, end: 160, loc: [d] },
    Ee { type: [or], value: '`', start: 160, end: 161, loc: [d] },
    Ee {
      type: [or],
      value: '\n\n  <h1>   Hello World 2   </h1>\n',
      start: 161,
      end: 194,
      loc: [d]
    },
    Ee { type: [or], value: '`', start: 194, end: 195, loc: [d] },
    Ee { type: [or], value: undefined, start: 195, end: 196, loc: [d] },
    Ee { type: [or], value: undefined, start: 197, end: 198, loc: [d] },
    Ee {
      type: [or],
      value: 'strictMode',
      start: 199,
      end: 209,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 209, end: 210, loc: [d] },
    Ee { type: [or], value: 'true', start: 211, end: 215, loc: [d] },
    Ee { type: [or], value: undefined, start: 216, end: 217, loc: [d] },
    Ee { type: [or], value: undefined, start: 217, end: 218, loc: [d] },
    Ee { type: [or], value: undefined, start: 218, end: 219, loc: [d] },
    {
      type: 'CommentBlock',
      value: '*\n' +
        ' * An example GJS file on which we can run the Prettier for GJS plugin.\n' +
        ' ',
      start: 221,
      end: 300,
      loc: [d]
    },
    Ee { type: [or], value: 'export', start: 301, end: 307, loc: [d] },
    Ee { type: [or], value: 'default', start: 308, end: 315, loc: [d] },
    Ee { type: [or], value: 'class', start: 316, end: 321, loc: [d] },
    Ee {
      type: [or],
      value: 'MyComponent',
      start: 322,
      end: 333,
      loc: [d]
    },
    Ee { type: [or], value: 'extends', start: 336, end: 343, loc: [d] },
    Ee {
      type: [or],
      value: 'Component',
      start: 344,
      end: 353,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 354, end: 355, loc: [d] },
    Ee { type: [or], value: undefined, start: 358, end: 359, loc: [d] },
    Ee {
      type: [or],
      value: '__GLIMMER_TEMPLATE',
      start: 359,
      end: 377,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 377, end: 378, loc: [d] },
    Ee { type: [or], value: '`', start: 378, end: 379, loc: [d] },
    Ee {
      type: [or],
      value: '\n    <h1>   Hello World 3   </h1>\n  ',
      start: 379,
      end: 415,
      loc: [d]
    },
    Ee { type: [or], value: '`', start: 415, end: 416, loc: [d] },
    Ee { type: [or], value: undefined, start: 416, end: 417, loc: [d] },
    Ee { type: [or], value: undefined, start: 418, end: 419, loc: [d] },
    Ee {
      type: [or],
      value: 'strictMode',
      start: 420,
      end: 430,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 430, end: 431, loc: [d] },
    Ee { type: [or], value: 'true', start: 432, end: 436, loc: [d] },
    Ee { type: [or], value: undefined, start: 437, end: 438, loc: [d] },
    Ee { type: [or], value: undefined, start: 438, end: 439, loc: [d] },
    Ee { type: [or], value: undefined, start: 439, end: 440, loc: [d] },
    Ee { type: [or], value: 'what', start: 444, end: 448, loc: [d] },
    Ee { type: [or], value: '=', start: 449, end: 450, loc: [d] },
    Ee { type: [or], value: '`', start: 451, end: 452, loc: [d] },
    Ee {
      type: [or],
      value: 'template literal that is not a template',
      start: 452,
      end: 491,
      loc: [d]
    },
    Ee { type: [or], value: '`', start: 491, end: 492, loc: [d] },
    {
      type: 'CommentLine',
      value: ' comment',
      start: 503,
      end: 513,
      loc: [d]
    },
    Ee { type: [or], value: undefined, start: 514, end: 515, loc: [d] },
    Ee { type: [or], value: undefined, start: 516, end: 516, loc: [d] }
  ]
}
formatHbs 
  <h1>   Hello World 1   </h1>

startsWithHardline {
  type: 'group',
  id: undefined,
  contents: [
    {
      type: 'group',
      id: undefined,
      contents: [Array],
      break: false,
      expandedStates: undefined
    },
    { type: 'indent', contents: [Object] },
    { type: 'indent', contents: '</h1>' }
  ],
  break: false,
  expandedStates: undefined
}
formatHbs 

  <h1>   Hello World 2   </h1>

startsWithHardline {
  type: 'group',
  id: undefined,
  contents: [
    {
      type: 'group',
      id: undefined,
      contents: [Array],
      break: false,
      expandedStates: undefined
    },
    { type: 'indent', contents: [Object] },
    { type: 'indent', contents: '</h1>' }
  ],
  break: false,
  expandedStates: undefined
}
formatHbs 
    <h1>   Hello World 3   </h1>
  
startsWithHardline {
  type: 'group',
  id: undefined,
  contents: [
    {
      type: 'group',
      id: undefined,
      contents: [Array],
      break: false,
      expandedStates: undefined
    },
    { type: 'indent', contents: [Object] },
    { type: 'indent', contents: '</h1>' }
  ],
  break: false,
  expandedStates: undefined
}
import Component from "@glimmer/component";

<template>
  <h1> Hello World 1 </h1>
</template>;

const temp = <template>
  <h1> Hello World 2 </h1>
</template>;
/**
 * An example GJS file on which we can run the Prettier for GJS plugin.
 */
export default class MyComponent extends Component {
  <template>
    <h1> Hello World 3 </h1>
  </template>
  what = `template literal that is not a template`;
}
