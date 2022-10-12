import type { BaseNode, SourceLocation } from 'estree';
import type { ParserOptions, Plugin, Printer } from 'prettier';

import {
  isTemplateInvocationExpressionPath,
  isTemplateInvocationPropertyPath
} from '../types';
import { assert } from '../utils';
import {
  printTemplateTagForExpression,
  printTemplateTagForProperty
} from './template';

// @ts-expect-error
export let printer: Printer<BaseNode> = {};

// FIXME: This should be in Prettier types instead of `any`
interface CommentContext<T> {
  ast: T;
  comment: {
    type: 'CommentLine'; // FIXME: This is probably not complete
    placement: 'remaining'; // FIXME: This is probably not complete
    value: string;
    loc: SourceLocation;
    start: number;
    end: number;
  };
  precedingNode: T;
  enclosingNode: T;
  followingNode: T;
  isLastComment: boolean;
  options: ParserOptions<T>;
  /**
   * This appears to be the full text of the file, not the text of the comment.
   */
  text: string;
}

// FIXME: HACK because estree printer isn't exported
// see https://github.com/prettier/prettier/issues/10259 and
// https://github.com/prettier/prettier/issues/4424
// Need to find another solution if we want to be listed in community plugins
export function definePrinter(options: ParserOptions<BaseNode>) {
  let isEstreePlugin = (
    plugin: string | Plugin<BaseNode>
  ): plugin is Plugin<BaseNode> & {
    printers: { estree: Printer<BaseNode> };
  } =>
    Boolean(
      typeof plugin !== 'string' && plugin.printers && plugin.printers.estree
    );
  const estreePlugin = options.plugins.find(isEstreePlugin);
  assert(
    'expected to find estree printer',
    estreePlugin && isEstreePlugin(estreePlugin)
  );
  const estreePrinter = estreePlugin.printers.estree;

  Reflect.setPrototypeOf(printer, Object.create(estreePrinter));

  printer.embed = (path, print, textToDoc, options) => {
    if (isTemplateInvocationExpressionPath(path)) {
      return printTemplateTagForExpression(path, print, textToDoc, options);
    } else if (isTemplateInvocationPropertyPath(path)) {
      return printTemplateTagForProperty(path, print, textToDoc, options);
    } else {
      return printer.embed?.(path, print, textToDoc, options) ?? null;
    }
  };

  printer.handleComments = {
    // @ts-expect-error Copying this from the estree printer
    avoidAstMutation: true,
    endOfLine: (
      commentNode: CommentContext<BaseNode>,
      text: string,
      options: ParserOptions<BaseNode>,
      ast: BaseNode,
      isLastComment: boolean
    ) => {
      debugger;
      return (
        estreePrinter.handleComments?.endOfLine?.(
          commentNode,
          text,
          options,
          ast,
          isLastComment
        ) ?? false
      );
    },
    remaining: (
      commentNode: CommentContext<BaseNode>,
      text: string,
      options: ParserOptions<BaseNode>,
      ast: BaseNode,
      isLastComment: boolean
    ) => {
      debugger;
      return (
        estreePrinter.handleComments?.remaining?.(
          commentNode,
          text,
          options,
          ast,
          isLastComment
        ) ?? false
      );
    },
    ownLine: (
      commentNode: CommentContext<BaseNode>,
      text: string,
      options: ParserOptions<BaseNode>,
      ast: BaseNode,
      isLastComment: boolean
    ) => {
      debugger;
      return (
        estreePrinter.handleComments?.ownLine?.(
          commentNode,
          text,
          options,
          ast,
          isLastComment
        ) ?? false
      );
    }
  };

  // printer.canAttachComment = node => {
  //   return Boolean(
  //     node.type &&
  //       !printer.isBlockComment(node) &&
  //       !isLineComment(node) &&
  //       node.type !== 'EmptyStatement' &&
  //       node.type !== 'TemplateElement' &&
  //       node.type !== 'Import' &&
  //       // `babel-ts` don't have similar node for `class Foo { bar() /* bat */; }`
  //       node.type !== 'TSEmptyBodyFunctionExpression'
  //   );
  // };

  // // @ts-expect-error
  // NOTE: This is already true for the estree printer
  // printer.handleComments.avoidAstMutation = true;

  // printer.isBlockComment = comment => {
  //   return (
  //     comment.type === 'Block' ||
  //     comment.type === 'CommentBlock' ||
  //     // `meriyah`
  //     comment.type === 'MultiLine'
  //   );
  // };

  // function isLineComment(comment: BaseNode) {
  //   return (
  //     comment.type === 'Line' ||
  //     comment.type === 'CommentLine' ||
  //     // `meriyah` has `SingleLine`, `HashbangComment`, `HTMLOpen`, and `HTMLClose`
  //     comment.type === 'SingleLine' ||
  //     comment.type === 'HashbangComment' ||
  //     comment.type === 'HTMLOpen' ||
  //     comment.type === 'HTMLClose'
  //   );
  // }
}
