import forEach from 'lodash/forEach';

function replacePropsAccessor(root, j, methodName = 'propsOnLastRender') {
  root.find(
    j.CallExpression,
    {
      callee: {
        name: methodName
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    const component = node.arguments[0];

    return j.callExpression(
      j.memberExpression(
        j.callExpression(
          j.memberExpression(
            j.identifier('component'),
            j.identifier('find')
          ),
          [component]
        ),
        j.identifier('props')
      ),
      []
    );
  });
}

function replaceJQueryClick(root, j) {
  root.find(
    j.CallExpression,
    {
      callee: {
        object: {
          callee: {
            name: '$'
          }
        },
        property: {
          name: 'click'
        }
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    const selector = node.callee.object.arguments[0];

    return j.callExpression(
      j.memberExpression(
        j.callExpression(
          j.memberExpression(
            j.identifier('component'),
            j.identifier('find')
          ),
          [selector]
        ),
        j.identifier('simulate')
      ),
      [
        j.literal('click')
      ]
    );
  });
}

function replaceReactTestRendererFindBy(root, j, variables) {
  const { instanceVariables } = variables;

  forEach(instanceVariables, (instanceVariable) => {
    root.find(
      j.MemberExpression,
      {
        object: {
          name: instanceVariable
        },
        property: {
          name: 'findByType'
        }
      }
    ).replaceWith(() => {
      return j.memberExpression(
        j.identifier('component'),
        j.identifier('find')
      );
    });

    root.find(
      j.MemberExpression,
      {
        object: {
          name: instanceVariable
        },
        property: {
          name: 'findByProps'
        }
      }
    ).replaceWith(() => {
      return j.memberExpression(
        j.identifier('component'),
        j.identifier('find')
      );
    });
  });
}

export function replaceUtilities(root, j, variables) {
  replacePropsAccessor(root, j, 'propsOnLastRender');
  replacePropsAccessor(root, j, 'propsPassedOnLastRender');
  replaceJQueryClick(root, j);
  replaceReactTestRendererFindBy(root, j, variables);
}
