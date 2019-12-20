function replaceTextTests(root, j) {
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
    const enzymeWrapper = node.object.arguments[0].callee.object;

    return j.memberExpression(
      j.callExpression(
        j.identifier('expect'),
        [
          enzymeWrapper
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

function replaceMatcher(root, j, { oldMatcherName, matcherName }) {
  return root.find(
    j.MemberExpression,
    {
      property: {
        name: oldMatcherName
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    node.property = j.identifier(matcherName);
    return node;
  });
}

function replaceClassMatcher(root, j, { matcherName }) {
  root.find(
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
        name: matcherName
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

  root.find(
    j.MemberExpression,
    {
      object: {
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
          name: 'not'
        }
      },
      property: {
        name: matcherName
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const literal = node.object.object.arguments[0];
    node.object.object.arguments = [
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

function replaceReactTestRendererExpectComponentWithPropsToExist(root, j, variables) {
  root.find(
    j.ImportDeclaration
  ).filter((nodePath) => {
    const { node } = nodePath;
    return !!node.source.value.match(/expect_component_with_props_to_exist_curry/);
  }).forEach((nodePath) => {
    const { node } = nodePath;

    variables.expectComponentToExistCurryVariable = node.specifiers[0].local.name;
  });

  root.find(
    j.CallExpression,
    {
      callee: {
        name: variables.expectComponentToExistCurryVariable
      }
    }
  ).closest(j.AssignmentExpression).forEach((nodePath) => {
    const { node } = nodePath;
    variables.expectComponentToExistVariable = node.left.name;
  });

  root.find(
    j.ExpressionStatement,
    {
      expression: {
        callee: {
          name: variables.expectComponentToExistVariable
        }
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    const component = node.expression.arguments[0];
    const props = node.expression.arguments[1];

    return j.expressionStatement(
      j.callExpression(
        j.memberExpression(
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
        ),
        [props]
      )
    );
  });
}

function replaceSpyComponentRendered(root, j) {
  return root.find(
    j.MemberExpression,
    {
      object: {
        callee: {
          name: 'expect'
        }
      },
      property: {
        name: 'toHaveBeenRendered'
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
      j.identifier('toExist')
    );
  });
}

function replaceSpyComponentNotRendered(root, j) {
  return root.find(
    j.MemberExpression,
    {
      object: {
        object: {
          callee: {
            name: 'expect'
          }
        },
        property: {
          name: 'not'
        }
      },
      property: {
        name: 'toHaveBeenRendered'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    const component = node.object.object.arguments[0];

    return j.memberExpression(
      j.memberExpression(
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
        j.identifier('not')
      ),
      j.identifier('toExist')
    );
  });
}

export function replaceAssertions(root, j, variables) {
  replaceSpyComponentRendered(root, j);
  replaceSpyComponentNotRendered(root, j);
  replaceSpyComponentPropAssertions(root, j, 'toHaveBeenRenderedWithProps');
  replaceSpyComponentPropAssertions(root, j, 'toHaveBeenPassedProps');
  replaceReactTestRendererExpectComponentWithPropsToExist(root, j, variables);
  removeRedundantHavePropObjectContaining(root, j);
  replaceTextTests(root, j);
  replaceRootExpectations(root, j);
  replaceMatcher(root, j, { oldMatcherName: 'toContainText', matcherName: 'toIncludeText' });
  replaceMatcher(root, j, { oldMatcherName: 'toHaveClass', matcherName: 'toHaveClassName' });
  replaceMatcher(root, j, { oldMatcherName: 'toHaveAttr', matcherName: 'toHaveProp' });
  replaceClassMatcher(root, j, { matcherName: 'toExist' });
  replaceClassMatcher(root, j, { matcherName: 'toHaveText' });
  replaceClassMatcher(root, j, { matcherName: 'toIncludeText' });
  replaceClassMatcher(root, j, { matcherName: 'toHaveLength' });
  replaceClassMatcher(root, j, { matcherName: 'toBeChecked' });
  replaceClassMatcher(root, j, { matcherName: 'toBeDisabled' });
  replaceClassMatcher(root, j, { matcherName: 'toHaveValue' });
  replaceClassMatcher(root, j, { matcherName: 'toHaveProp' });
  replaceClassMatcher(root, j, { matcherName: 'toHaveClassName' });
}
