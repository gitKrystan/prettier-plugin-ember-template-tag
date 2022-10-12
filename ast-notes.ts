type GlimmerExpressionStatement = {
  type: 'ExpressionStatement';
  expression: {
    type: 'ArrayExpression';
    elements: [
      {
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
          }
        ];
      }
    ];
  };
};

type ModuleVariable = {
  type: 'VariableDeclaration';
  declarations: [
    {
      type: 'VariableDeclarator';
      id: {
        type: 'Identifier';
        /** Variable name */
        name: string;
      };
      init: {
        type: 'ArrayExpression';
        elements: [
          {
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
          }
        ];
      };
    }
  ];
  kind: 'const' | 'let' | 'var';
};

type GlimmerClassProperty = {
  type: 'ClassProperty';
  key: {
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
  value: null;
};
