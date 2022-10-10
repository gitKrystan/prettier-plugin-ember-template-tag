import { preprocessEmbeddedTemplates } from 'ember-template-imports/lib/preprocess-embedded-templates';
import type {
  ArrayExpression,
  BaseNode,
  CallExpression,
  Expression,
  Identifier,
  Pattern,
  PrivateIdentifier,
  TemplateLiteral
} from 'estree';
import type {
  AstPath,
  Parser,
  ParserOptions,
  Plugin,
  Printer,
  SupportLanguage
} from 'prettier';
import { doc } from 'prettier';
import { parsers as babelParsers } from 'prettier/parser-babel';

const {
  builders: { group, indent, softline, hardline },
  utils: { stripTrailingHardline, getDocParts }
} = doc;

// FIXME: Move to utils
/**
 * Checks if the given value is a `Record<string, unknown>`.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

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

const parseGJS: Parser<BaseNode>['parse'] = (
  text,
  parsers,
  options
): BaseNode => {
  let preprocessed = preprocessEmbeddedTemplates(text, {
    // FIXME: Need to figure this out for ESLint but probably OK not to do it
    // for prettier support?
    getTemplateLocals(_template: string): string[] {
      return [];
    },
    // getTemplateLocalsRequirePath: 'ember-cli-htmlbars',
    // getTemplateLocalsExportPath: '_GlimmerSyntax.getTemplateLocals',

    templateTag: 'template',
    // FIXME: Use utils from eti
    templateTagReplacement: '__GLIMMER_TEMPLATE',

    includeSourceMaps: false, // TypeError: path_1.default.parse is not a function
    includeTemplateTokens: true,

    relativePath: options.filepath
  });

  console.info('preprocess', preprocessed.output);

  let js = preprocessed.output;

  let parsed = babelParsers.babel.parse(js, parsers, options);

  console.info('parsed', parsed);

  // let parsed = parseTemplates(text, options.filepath, {
  //   templateTag: 'template'
  // });
  // console.info('parse', parsed);

  return parsed as BaseNode;
};

export const parsers: Record<string, Parser<BaseNode>> = {
  [PARSE_GJS]: {
    ...babelParsers.babel,
    parse: parseGJS,
    astFormat: PRINT_GJS,

    // FIXME: HACK because estree printer isn't exported
    // see https://github.com/prettier/prettier/issues/10259 and
    // https://github.com/prettier/prettier/issues/4424
    // Need to find another solution if we want to be listed in community plugins
    preprocess(text: string, options: ParserOptions<BaseNode>): string {
      let isEstreePlugin = (
        plugin: string | Plugin<BaseNode>
      ): plugin is Plugin<BaseNode> & {
        printers: { estree: Printer<BaseNode> };
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

      for (let [key, value] of Object.entries(estreePrinter)) {
        estreePrinter[key as keyof typeof estreePrinter] = value;
        if (!(key in GJSPrinter)) {
          GJSPrinter[key as keyof typeof GJSPrinter] = value;
        }
      }

      console.log({ GJSPrinter });

      return babelParsers.babel.preprocess?.(text, options) ?? text;
    }
  }
};

// @ts-expect-error
const estreePrinter: Printer<BaseNode> = {};

const printTemplateTag: Printer<TemplateInvocationExpression>['embed'] = (
  path,
  _print, // By not calling print we are replacing this node and all of its children
  textToDoc,
  options
) => {
  const invocationNode = path.getValue();
  const templateNode = invocationNode.elements[0].arguments[0];
  assert('expected TemplateLiteral node', isTemplateLiteral(templateNode));
  const text = templateNode.quasis.map(quasi => quasi.value.raw).join('');
  console.info('formatHbs', text);
  const isMultiLine =
    text.startsWith('\n') ||
    (templateNode.loc && templateNode.loc.end.column >= options.printWidth);
  let doc = stripTrailingHardline(
    textToDoc(text, {
      parser: 'glimmer',
      // @ts-expect-error FIXME
      singleQuote: options.hbsSingleQuote
    })
  );
  if (!isMultiLine) {
    return group(['<template>', doc, '<template>']);
  }
  if (isDocGroup(doc) && startsWithHardline(doc)) {
    return group(['<template>', indent(group(doc)), softline, '</template>']);
  }
  return group([
    '<template>',
    indent([hardline, group(doc)]),
    softline,
    '</template>'
  ]);
};

const printTemplateTagForProperty: Printer<TemplateInvocationProperty>['embed'] =
  (
    path,
    _print, // By not calling print we are replacing this node and all of its children
    textToDoc,
    options
  ) => {
    const invocationNode = path.getValue();
    const templateNode = invocationNode.key.arguments[0];
    assert('expected TemplateLiteral node', isTemplateLiteral(templateNode));
    const text = templateNode.quasis.map(quasi => quasi.value.raw).join('');
    console.info('formatHbs', text);
    const isMultiLine =
      text.startsWith('\n') ||
      (templateNode.loc && templateNode.loc.end.column >= options.printWidth);
    let doc = stripTrailingHardline(
      textToDoc(text, {
        parser: 'glimmer',
        // @ts-expect-error FIXME
        singleQuote: options.hbsSingleQuote
      })
    );
    if (!isMultiLine) {
      return group(['<template>', doc, '<template>']);
    }
    if (isDocGroup(doc) && startsWithHardline(doc)) {
      return group(['<template>', indent(group(doc)), softline, '</template>']);
    }
    return group([
      '<template>',
      indent([hardline, group(doc)]),
      softline,
      '</template>'
    ]);
  };

function startsWithHardline(doc: doc.builders.Group) {
  console.info('startsWithHardline', doc);
  // @ts-expect-error FIXME
  const [first, second] = getDocParts(doc.contents);
  return (
    first &&
    first.type === 'line' &&
    first.hard &&
    second &&
    second.type === 'break-parent'
  );
}

function isDocGroup(doc: unknown): doc is doc.builders.Group {
  return isRecord(doc) && doc.type === 'group';
}

function isArrayExpression(value: unknown): value is ArrayExpression {
  return isRecord(value) && value.type === 'ArrayExpression';
}

function isCallExpression(value: unknown): value is CallExpression {
  return isRecord(value) && value.type === 'CallExpression';
}

function isClassProperty(value: unknown): value is ClassProperty {
  return isRecord(value) && value.type === 'ClassProperty';
}

function isIdentifier(value: unknown): value is Identifier {
  return isRecord(value) && value.type === 'Identifier';
}

function isTemplateLiteral(value: unknown): value is TemplateLiteral {
  return isRecord(value) && value.type === 'TemplateLiteral';
}

function isGlimmerCallExpression(
  value: unknown
): value is GlimmerCallExpression {
  return (
    isRecord(value) &&
    isIdentifier(value.callee) &&
    value.callee.name === '__GLIMMER_TEMPLATE'
  );
}

type GlimmerIdentifier = Identifier & {
  name: '__GLIMMER_TEMPLATE';
};

type GlimmerCallExpression = CallExpression & {
  callee: GlimmerIdentifier;
};

// FIXME: Type might not be accurate...derive from Prettier estree types?
type ClassProperty = BaseNode & {
  type: 'ClassProperty';
  start?: number;
  end?: number;
  key: Expression | PrivateIdentifier;
  value: Expression | Pattern | null;
  static: boolean;
  variance: unknown;
  computed: boolean;
};

type TemplateInvocationExpression = ArrayExpression & {
  elements: [GlimmerCallExpression];
};

type TemplateInvocationProperty = ClassProperty & {
  key: GlimmerCallExpression;
  value: null;
};

type TemplateInvocation =
  | TemplateInvocationProperty
  | TemplateInvocationExpression;

function isTemplateInvocationPropertyPath(
  path: AstPath<BaseNode>
): path is AstPath<TemplateInvocationProperty> {
  return path.match((node: BaseNode | null) => {
    if (isClassProperty(node)) {
      if (isCallExpression(node.key)) {
        return isGlimmerCallExpression(node.key);
      } else {
        return false;
      }
    } else {
      return false;
    }
  });
}

function isTemplateInvocationExpressionPath(
  path: AstPath<BaseNode>
): path is AstPath<TemplateInvocationExpression> {
  return path.match((node: BaseNode | null) => {
    if (isArrayExpression(node)) {
      let firstElement = node.elements[0];
      if (isCallExpression(firstElement)) {
        return isGlimmerCallExpression(firstElement);
      } else {
        return false;
      }
    } else {
      return false;
    }
  });
}

// @ts-expect-error
const GJSPrinter: Printer<BaseNode> = {
  embed(path, print, textToDoc, options) {
    if (isTemplateInvocationExpressionPath(path)) {
      return printTemplateTag(path, print, textToDoc, options);
    } else if (isTemplateInvocationPropertyPath(path)) {
      return printTemplateTagForProperty(path, print, textToDoc, options);
    } else {
      return estreePrinter.embed?.(path, print, textToDoc, options) ?? null;
    }
  }
};

export const printers: Record<string, Printer<BaseNode>> = {
  [PRINT_GJS]: GJSPrinter
};
