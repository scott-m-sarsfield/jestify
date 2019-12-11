function replaceReactDOMRender(source, j) {
  return j(source).find(
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
  }).toSource();
}

export function replaceRenderFunctions(initSource, j) {
  let source = initSource;

  source = replaceReactDOMRender(source, j);

  return source;
}
