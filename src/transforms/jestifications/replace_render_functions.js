function replaceReactDOMRender(root, j) {
  root.find(
    j.ExpressionStatement,
    {
      expression: {
        callee: {
          object: {
            name: 'ReactDOM'
          },
          property: {
            name: 'render'
          }
        }
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const jsx = node.expression.arguments[0];

    return j.expressionStatement(
      j.assignmentExpression(
        '=',
        j.identifier('component'),
        j.callExpression(
          j.identifier('mount'),
          [jsx]
        )
      )
    );
  });
}

export function replaceRenderFunctions(root, j) {
  replaceReactDOMRender(root, j);
}
