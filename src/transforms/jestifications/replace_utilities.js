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

function replaceJQuerySelectors(root, j) {
  root.find(
    j.CallExpression,
    {
      callee: {
        name: '$'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    node.callee = j.memberExpression(
      j.identifier('component'),
      j.identifier('find')
    );
    return node;
  });
}

function replaceComponentFindArrayAccessor(root, j) {
  root.find(
    j.MemberExpression,
    {
      object: {
        callee: {
          object: {
            name: 'component'
          },
          property: {
            name: 'find'
          }
        }
      },
      computed: true
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    return j.callExpression(
      j.memberExpression(
        node.object,
        j.identifier('at')
      ),
      [
        node.property
      ]
    );
  });
}

function replaceInnerText(root, j) {
  root.find(
    j.MemberExpression,
    {
      property: {
        name: 'innerText'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    return j.callExpression(
      j.memberExpression(
        node.object,
        j.identifier('text')
      ),
      []
    );
  });
}

function replaceSpyComponent(root, j) {
  root.find(
    j.CallExpression,
    {
      callee: {
        name: 'createSpyComponent'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    if (node.arguments[0]) {
      return node.arguments[0];
    }
    return j.arrowFunctionExpression(
      [],
      j.literal(null)
    );
  });
}

function replacePropsOnRenderAt(root, j, helperName = 'propsOnRenderAt') {
  root.find(
    j.CallExpression,
    {
      callee: {
        name: helperName
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    return j.callExpression(
      j.memberExpression(
        j.callExpression(
          j.memberExpression(
            j.callExpression(
              j.memberExpression(
                j.identifier('component'),
                j.identifier('find')
              ),
              [
                node.arguments[0]
              ]
            ),
            j.identifier('at')
          ),
          [
            node.arguments[1]
          ]
        ),
        j.identifier('props')
      ),
      []
    );
  });
}

export function replaceUtilities(root, j, variables) {
  replacePropsAccessor(root, j, 'propsOnLastRender');
  replacePropsAccessor(root, j, 'propsPassedOnLastRender');
  replacePropsOnRenderAt(root, j);
  replacePropsOnRenderAt(root, j, 'propsPassedOnRenderAt');
  replaceJQueryClick(root, j);
  replaceReactTestRendererFindBy(root, j, variables);
  replaceJQuerySelectors(root, j);
  replaceComponentFindArrayAccessor(root, j);
  replaceInnerText(root, j);
  replaceSpyComponent(root, j);
}
