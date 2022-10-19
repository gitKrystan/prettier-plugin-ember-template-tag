# AST nodes corresponding to the various template invocation methods

```ts
type GlimmerCallExpression = {
  type: 'CallExpression';
  callee: {
    type: 'Identifier';
    name: '__GLIMMER_TEMPLATE';
  };
  arguments: [
    {
      type: 'TemplateLiteral';
      quasis: [
        {
          type: 'TemplateElement';
          value: {
            /** Raw template text */
            raw: string;
          };
        }
      ];
    },
    // We don't really care what happens here, but I've included it for completeness
    {
      type: 'ObjectExpression';
    }
  ];
};

type GlimmerArrayExpression = {
  type: 'ArrayExpression';
  elements: [GlimmerCallExpression];
};

type GlimmerTSAsExpression = {
    type: 'TSAsExpression';
    expression: GlimmerArrayExpression;
    typeAnnotation: {
      type: 'TSTypeReference';
      typeName: {
        type: 'Identifier';
        // e.g. TemplateOnlyComponent
        name: string;
      };
      typeParameters: {
        type: 'TSTypeParameterInstantiation';
        params: [
          {
            type: 'TSTypeReference';
            typeName: {
              type: 'Identifier';

              // e.g. Signature
              name: string;
            };
          }
        ];
      };
    };
  }{
    type: 'TSAsExpression';
    expression: GlimmerArrayExpression;
    typeAnnotation: {
      type: 'TSTypeReference';
      typeName: {
        type: 'Identifier';
        // e.g. TemplateOnlyComponent
        name: string;
      };
      typeParameters: {
        type: 'TSTypeParameterInstantiation';
        params: [
          {
            type: 'TSTypeReference';
            typeName: {
              type: 'Identifier';

              // e.g. Signature
              name: string;
            };
          }
        ];
      };
    };
  }

type GlimmerExpressionStatement = {
  type: 'ExpressionStatement';
  expression: GlimmerArrayExpression;
};

type GlimmerVariableDeclaration = {
  type: 'VariableDeclaration';
  declarations: Array<{
    type: 'VariableDeclarator';
    id: {
      type: 'Identifier';
      /** Variable name */
      name: string;
    };
    init: GlimmerArrayExpression;
  }>;
  kind: 'const' | 'let' | 'var';
};

type GlimmerClassProperty = {
  type: 'ClassProperty';
  key: GlimmerCallExpression;
  value: null;
};

type GlimmerExportDefaultDeclaration = {
  type: 'ExportDefaultDeclaration';
  declaration: GlimmerArrayExpression;
};

type GlimmerExportDefaultDeclarationWithTSAsExpression = {
  type: 'ExportDefaultDeclaration';
  declaration: GlimmerTSAsExpression;
};

type GlimmerExportNamedDeclarationTS = {
  type: 'ExportNamedDeclaration';
  declaration: {
    type: 'VariableDeclaration';
    declarations: [
      {
        type: 'VariableDeclarator';
        id: {
          type: 'Identifier';
          name: string;
        };
        init: GlimmerTSAsExpression;
      }
    ];
    kind: 'const';
  };
};
```
