function replaceJQueryTextTests(root, j) {
  return root.find(
    j.MemberExpression,
    {
      object: {
        callee: {
          name: 'expect'
        },
        arguments: [
          {
            callee: {
              object: {
                callee: {
                  name: '$'
                }
              },
              property: {
                name: 'text'
              }
            }
          }
        ]
      },
      property: {
        name: 'toEqual'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const jquerySelector = node.object.arguments[0].callee.object.arguments[0];

    return j.memberExpression(
      j.callExpression(
        j.identifier('expect'),
        [
          j.callExpression(
            j.memberExpression(
              j.identifier('component'),
              j.identifier('find')
            ),
            [jquerySelector]
          )
        ]
      ),
      j.identifier('toHaveText')
    );
  });
}

function replaceSpyComponentPropAssertions(root, j, matcher = 'toHaveBeenRenderedWithProps') {
  return root.find(
    j.MemberExpression,
    {
      object: {
        callee: {
          name: 'expect'
        }
      },
      property: {
        name: matcher
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    const component = node.object.arguments[0];

    return j.memberExpression(
      j.callExpression(
        j.identifier('expect'),
        [
          j.callExpression(
            j.memberExpression(
              j.identifier('component'),
              j.identifier('find')
            ),
            [component]
          )
        ]
      ),
      j.identifier('toHaveProp')
    );
  });
}

function removeRedundantHavePropObjectContaining(root, j) {
  return root.find(
    j.CallExpression,
    {
      callee: {
        object: {
          callee: {
            name: 'expect'
          }
        },
        property: {
          name: 'toHaveProp'
        }
      },
      arguments: [
        {
          callee: {
            property: {
              name: 'objectContaining'
            }
          }
        }
      ]
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const propsToMatch = node.arguments[0].arguments;
    node.arguments = propsToMatch;
    return node;
  });
}

function replaceRootExpectations(root, j) {
  return root.find(
    j.CallExpression,
    {
      callee: {
        name: 'expect'
      },
      arguments: [
        {
          name: 'root'
        }
      ]
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    node.arguments = [
      j.identifier('component')
    ];

    return node;
  });
}

function replaceToContainText(root, j) {
  return root.find(
    j.MemberExpression,
    {
      property: {
        name: 'toContainText'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    node.property = j.identifier('toIncludeText');
    return node;
  });
}

function replaceLiteralToExist(root, j) {
  return root.find(
    j.MemberExpression,
    {
      object: {
        callee: {
          name: 'expect'
        },
        arguments: [
          {
            type: 'Literal'
          }
        ]
      },
      property: {
        name: 'toExist'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const literal = node.object.arguments[0];
    node.object.arguments = [
      j.callExpression(
        j.memberExpression(
          j.identifier('component'),
          j.identifier('find')
        ),
        [
          literal
        ]
      )
    ];
    return node;
  });
}

export function replaceAssertions(root, j) {
  replaceSpyComponentPropAssertions(root, j, 'toHaveBeenRenderedWithProps');
  replaceSpyComponentPropAssertions(root, j, 'toHaveBeenPassedProps');
  removeRedundantHavePropObjectContaining(root, j);
  replaceJQueryTextTests(root, j);
  replaceRootExpectations(root, j);
  replaceToContainText(root, j);
  replaceLiteralToExist(root, j);
}
