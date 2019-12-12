function generateComponentEqualMount(j, jsx) {
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
}

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

    return generateComponentEqualMount(j, jsx);
  });
}

function replaceReactTestRendererCreate(root, j, variables) {
  root.find(
    j.ExpressionStatement,
    {
      expression: {
        right: {
          callee: {
            object: {
              name: 'TestRenderer'
            },
            property: {
              name: 'create'
            }
          }
        }
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const jsx = node.expression.right.arguments[0];

    variables.rendererVariable = node.expression.left.name;

    return generateComponentEqualMount(j, jsx);
  });

  const instanceAssignments = root.find(
    j.Identifier,
    { name: variables.rendererVariable }
  ).closest(j.AssignmentExpression);

  instanceAssignments.forEach((nodePath) => {
    const { node } = nodePath;
    variables.instanceVariable = node.left.name;
  });

  instanceAssignments.closest(j.ExpressionStatement).remove();

  root.find(
    j.ImportDefaultSpecifier,
    { local: { name: 'TestRenderer' }}
  ).closest(j.ImportDeclaration).remove();

  root.find(
    j.VariableDeclarator,
    {
      id: {
        name: variables.rendererVariable
      }
    }
  ).remove();

  root.find(
    j.VariableDeclarator,
    {
      id: {
        name: variables.instanceVariable
      }
    }
  ).remove();
}

export function replaceRenderFunctions(root, j, variables) {
  replaceReactDOMRender(root, j);
  replaceReactTestRendererCreate(root, j, variables);
}
