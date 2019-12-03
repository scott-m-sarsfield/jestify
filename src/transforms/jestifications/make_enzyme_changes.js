
import importEnzymeMount from './import_enzyme_mount';
import { hasJSX } from './has_jsx';

function addGlobalComponentVariable(source, j) {
  if (doesComponentVariableExist(source, j)) {
    return source;
  }
  return j(source).find(
    j.ImportDeclaration
  ).at(-1).insertAfter(() => {
    return j.variableDeclaration(
      'let',
      [
        j.variableDeclarator(
          j.identifier('component'),
          null
        )
      ]
    );
  }).toSource();
}

function doesComponentVariableExist(source, j) {
  return j(source).find(
    j.VariableDeclarator,
    {
      id: {
        name: 'component'
      }
    }
  ).size() > 0;
}

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

function replacePropsAccessor(source, j, methodName = 'propsOnLastRender') {
  return j(source).find(
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

function replaceJQueryClick(source, j) {
  return j(source).find(
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

function replaceAssertions(initSource, j) {
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

function replaceRenderFunctions(initSource, j) {
  let source = initSource;

  source = replaceReactDOMRender(source, j);

  return source;
}

function replaceUtilities(initSource, j) {
  let source = initSource;

  source = replacePropsAccessor(source, j, 'propsOnLastRender');
  source = replacePropsAccessor(source, j, 'propsPassedOnLastRender');
  source = replaceJQueryClick(source, j);

  return source;
}

function makeEnzymeChanges(initSource, j) {
  let source = initSource;

  if (!hasJSX(source, j)) {
    return source;
  }

  source = importEnzymeMount(source, j);
  source = addGlobalComponentVariable(source, j);
  source = replaceRenderFunctions(source, j);
  source = replaceAssertions(source, j);
  source = replaceUtilities(source, j);

  return source;
}

export default makeEnzymeChanges;
