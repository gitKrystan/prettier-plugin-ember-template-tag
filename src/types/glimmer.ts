import { type Comment } from '@babel/types';

export interface GlimmerTemplate {
  type: 'FunctionDeclaration';
  leadingComments: Comment[];
  range: [start: number, end: number];
  start: number;
  end: number;
  extra: {
    isAlreadyExportDefault: boolean;
    isAssignment: boolean;
    isDefaultTemplate: boolean;
    isGlimmerTemplate: boolean;
    template: string;
  };
}
