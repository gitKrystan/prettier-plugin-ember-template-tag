import type {
  Parser,
  ParserOptions,
  Plugin,
  Printer,
  SupportLanguage
} from 'prettier';
import { parseTemplates } from 'ember-template-imports';
import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import { parsers as babelParsers } from 'prettier/parser-babel';

// import * as ESTree from 'estree';

type TemplateMatches = ReturnType<typeof parseTemplates>;

type Unpacked<T> = T extends (infer U)[] ? U : T;

type TemplateMatch = Unpacked<TemplateMatches>;

const PARSE_GJS = 'gjs-parse';
const PRINT_GJS = 'gjs-ast';

function assert(message: string, condition?: unknown): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const languages: SupportLanguage[] = [
  {
    extensions: ['.gjs'],
    name: 'Ember Template Tag',
    parsers: [PARSE_GJS]
  }
];

// probably can't do this in preprocess step because we need to track the
// templates separate from the JS
// const preprocess: Parser<TemplateMatches>['preprocess'] = (
//   text,
//   options
// ): string => {
//   let preprocessed = preprocessEmbeddedTemplates(text, {
//     getTemplateLocals(_template: string): string[] {
//       return [];
//     },
//     // getTemplateLocalsRequirePath: 'ember-cli-htmlbars',
//     // getTemplateLocalsExportPath: '_GlimmerSyntax.getTemplateLocals',

//     templateTag: 'template',
//     templateTagReplacement: '__GLIMMER_TEMPLATE',

//     includeSourceMaps: false, // TypeError: path_1.default.parse is not a function
//     includeTemplateTokens: true,

//     relativePath: options.filepath
//   });

//   console.info('preprocess', preprocessed);

//   return preprocessed.output;
// };

const parseGJS: Parser<unknown>['parse'] = (
  text,
  parsers,
  options
): unknown => {
  let preprocessed = preprocessEmbeddedTemplates(text, {
    // FIXME: Need to figure this out for ESLint but probably OK not to do it
    // for prettier support?
    getTemplateLocals(_template: string): string[] {
      return [];
    },
    // getTemplateLocalsRequirePath: 'ember-cli-htmlbars',
    // getTemplateLocalsExportPath: '_GlimmerSyntax.getTemplateLocals',

    templateTag: 'template',
    templateTagReplacement: '__GLIMMER_TEMPLATE',

    includeSourceMaps: false, // TypeError: path_1.default.parse is not a function
    includeTemplateTokens: true,

    relativePath: options.filepath
  });

  console.info('preprocess', preprocessed);

  let js = preprocessed.output;

  let parsed = babelParsers.babel.parse(js, parsers, options);

  console.info('parsed', parsed);

  // let parsed = parseTemplates(text, options.filepath, {
  //   templateTag: 'template'
  // });
  // console.info('parse', parsed);

  return parsed;
};

export const parsers: Record<string, Parser<unknown>> = {
  [PARSE_GJS]: {
    ...babelParsers.babel,
    parse: parseGJS,
    astFormat: PRINT_GJS,

    // FIXME: HACK because estree printer isn't exported
    // see https://github.com/prettier/prettier/issues/10259 and
    // https://github.com/prettier/prettier/issues/4424
    // Need to find another solution if we want to be listed in community plugins
    preprocess(text: string, options: ParserOptions<unknown>): string {
      let isEstreePlugin = (
        plugin: string | Plugin<unknown>
      ): plugin is Plugin<unknown> & {
        printers: { estree: Printer<unknown> };
      } =>
        Boolean(
          typeof plugin !== 'string' &&
            plugin.printers &&
            plugin.printers.estree
        );
      const estreePlugin = options.plugins.find(isEstreePlugin);
      assert(
        'expected to find estree printer',
        estreePlugin && isEstreePlugin(estreePlugin)
      );
      const estreePrinter = estreePlugin.printers.estree;

      console.log({ estreePrinter });

      Object.assign(GJSPrinter, estreePrinter);

      console.log({ GJSPrinter });

      return babelParsers.babel.preprocess?.(text, options) ?? text;
    }
  }
};

// @ts-expect-error
const GJSPrinter: Printer<unknown> = {};

export const printers: Record<string, Printer<unknown>> = {
  [PRINT_GJS]: GJSPrinter
};
