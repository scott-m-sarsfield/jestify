
function replaceSpyOnAsync(root, j) {
  root.find(
    j.ExpressionStatement,
    {
      expression: {
        callee: {
          name: 'spyOnAsync'
        },
        arguments: [
          {
            type: 'Identifier'
          },
          {
            type: 'Literal'
          }
        ]
      }
    }
  ).replaceWith((nodePath) => {
    const { arguments: args } = nodePath.value.expression;

    const identifier = args[0];
    const literalValue = args[1].value;

    return j.expressionStatement(
      j.assignmentExpression(
        '=',
        j.memberExpression(
          identifier,
          j.identifier(literalValue)
        ),
        j.callExpression(
          j.memberExpression(
            j.callExpression(
              j.memberExpression(
                j.identifier('jest'),
                j.identifier('fn')
              ),
              []
            ),
            j.identifier('mockResolvedValue')
          ),
          []
        )
      )
    );
  });

  return root;
}

export default replaceSpyOnAsync;
