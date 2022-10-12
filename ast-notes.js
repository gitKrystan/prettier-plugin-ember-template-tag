// module top-level
let first = {
  type: 'ExpressionStatement',
  expression: {
    type: 'ArrayExpression',
    elements: [
      {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: '__GLIMMER_TEMPLATE'
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: 'raw template text' } }
            ]
          }
        ]
      }
    ]
  }
};

// module variable
let second = {
  type: 'VariableDeclaration',
  declarations: [
    {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: 'multiline'
      },
      init: {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: '__GLIMMER_TEMPLATE'
            },
            arguments: [
              {
                type: 'TemplateLiteral',
                quasis: [
                  {
                    type: 'TemplateElement',
                    value: { raw: 'raw template text' }
                  }
                ]
              },
              {
                type: 'ObjectExpression'
              }
            ]
          }
        ]
      }
    }
  ],
  kind: 'const'
};
