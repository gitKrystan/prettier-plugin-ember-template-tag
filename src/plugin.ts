import { doc, Parser } from 'prettier';
const { builders } = doc;

const languages = [
  {
    extensions: ['.gjs'],
    name: 'Ember Template Tag',
    parsers: ['gjs-parse']
  }
];

const parsers: Record<string, Parser<unknown>> = {
  'gjs-parse': {
    // call the preprocessor here? (or in preprocess below)
    // then use babel or estree to parse it
    // replace the glimmer nodes w/ custom nodes, then register parsers for the custom nodes (see the angular parser)
    parse: text => parser.parse(text),
    astFormat: 'estree'

    // parse: (text: string, parsers: { [parserName: string]: Parser }, options: ParserOptions<T>) => T;
    // astFormat: string;
    // hasPragma?: ((text: string) => boolean) | undefined;
    // locStart: (node: T) => number;
    // locEnd: (node: T) => number;
    // preprocess?: ((text: string, options: ParserOptions<T>) => string) | undefined;
    // https://github.com/prettier/prettier/blob/main/src/language-js/loc.js
  }
};

function printToml(path, options, print) {
  const node = path.getValue();

  if (Array.isArray(node)) {
    return concat(path.map(print));
  }

  switch (node.type) {
    default:
      return '';
  }
}

const printers = {
  'toml-ast': {
    print: printToml
  }
};

module.exports = {
  languages,
  parsers,
  printers
};
