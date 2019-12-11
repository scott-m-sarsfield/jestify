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

function replaceReactTestRendererCreate(root, j) {
  let rendererVariable, instanceVariable;

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

    rendererVariable = node.expression.left.name;

    return generateComponentEqualMount(j, jsx);
  });

  const instanceAssignments = root.find(
    j.Identifier,
    { name: rendererVariable }
  ).closest(j.AssignmentExpression);

  instanceAssignments.forEach((nodePath) => {
    const { node } = nodePath;
    instanceVariable = node.left.name;
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
        name: rendererVariable
      }
    }
  ).remove();

  root.find(
    j.VariableDeclarator,
    {
      id: {
        name: instanceVariable
      }
    }
  ).remove();
}

export function replaceRenderFunctions(root, j) {
  replaceReactDOMRender(root, j);
  replaceReactTestRendererCreate(root, j);
}
