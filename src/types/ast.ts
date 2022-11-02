import type { Comment, Node, SourceLocation } from '@babel/types';

import type { GLIMMER_EXPRESSION_TYPE } from '../config';

export interface BaseNode {
  type: Node['type'] | typeof GLIMMER_EXPRESSION_TYPE;
  leadingComments?: Comment[] | null;
  innerComments?: Comment[] | null;
  trailingComments?: Comment[] | null;
  start?: number | null;
  end?: number | null;
  loc?: SourceLocation | null;
  range?: [number, number];
  extra?: Record<string, unknown>;
}
