import forEach from 'lodash/forEach';

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

    variables.rendererVariables = [node.expression.left.name].concat(variables.rendererVariables);

    return generateComponentEqualMount(j, jsx);
  });

  root.find(
    j.VariableDeclaration,
    {
      declarations: [{
        init: {
          callee: {
            object: {
              name: 'TestRenderer'
            },
            property: {
              name: 'create'
            }
          }
        }
      }]
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const jsx = node.declarations[0].init.arguments[0];

    variables.rendererVariables = [node.declarations[0].id.name].concat(variables.rendererVariables);

    return generateComponentEqualMount(j, jsx);
  });

  root.find(
    j.ImportDefaultSpecifier,
    { local: { name: 'TestRenderer' }}
  ).closest(j.ImportDeclaration).remove();

  forEach(variables.rendererVariables, (rendererVariable) => {
    const instanceAssignments = root.find(
      j.Identifier,
      { name: rendererVariable }
    ).closest(j.AssignmentExpression);

    instanceAssignments.forEach((nodePath) => {
      const { node } = nodePath;
      variables.instanceVariable = node.left.name;
    });

    instanceAssignments.closest(j.ExpressionStatement).remove();

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
          name: variables.instanceVariable
        }
      }
    ).remove();
  });
}

export function replaceRenderFunctions(root, j, variables) {
  replaceReactDOMRender(root, j);
  replaceReactTestRendererCreate(root, j, variables);
}
