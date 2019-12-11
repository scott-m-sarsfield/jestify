function replaceJQueryTextTests(source, j) {
  return j(source).find(
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
  }).toSource();
}

function replaceSpyComponentPropAssertions(source, j, matcher = 'toHaveBeenRenderedWithProps') {
  return j(source).find(
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
  }).toSource();
}

function removeRedundantHavePropObjectContaining(source, j) {
  return j(source).find(
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
  }).toSource();
}

function replaceRootExpectations(source, j) {
  return j(source).find(
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
  }).toSource();
}

function replaceToContainText(source, j) {
  return j(source).find(
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
  }).toSource();
}

function replaceLiteralToExist(source, j) {
  return j(source).find(
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
  }).toSource();
}

export function replaceAssertions(initSource, j) {
  let source = initSource;

  source = replaceSpyComponentPropAssertions(source, j, 'toHaveBeenRenderedWithProps');
  source = replaceSpyComponentPropAssertions(source, j, 'toHaveBeenPassedProps');
  source = removeRedundantHavePropObjectContaining(source, j);
  source = replaceJQueryTextTests(source, j);
  source = replaceRootExpectations(source, j);
  source = replaceToContainText(source, j);
  source = replaceLiteralToExist(source, j);

  return source;
}
