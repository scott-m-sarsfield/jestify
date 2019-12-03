import removeSpyOnRenderCalls from './jestifications/remove_spy_on_render';
import removeStubFunctionalComponentCalls from './jestifications/remove_stub_functional_components';
import { replaceJasmineCreateSpy, replaceSpyOn } from './jestifications/replace_jasmine_spies';
import replaceSpyOnAsync from './jestifications/replace_spy_on_async';
import convertToEnzymeTests from './jestifications/make_enzyme_changes';
import { relativePath } from './jestifications/helpers';
import find from 'lodash/find';
import path from 'path';
import camelCase from 'lodash/camelCase';

function replaceSpyReturnValue(source, j) {
  return j(source).find(
    j.MemberExpression,
    {
      object: {
        property: {
          name: 'and'
        }
      },
      property: {
        name: 'returnValue'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const spy = node.object.object;
    return j.memberExpression(
      spy,
      j.identifier('mockReturnValue')
    );
  }).toSource();
}
function replaceSpyCallFake(source, j) {
  return j(source).find(
    j.MemberExpression,
    {
      object: {
        property: {
          name: 'and'
        }
      },
      property: {
        name: 'callFake'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const spy = node.object.object;
    return j.memberExpression(
      spy,
      j.identifier('mockImplementation')
    );
  }).toSource();
}

function replaceCallsReset(source, j) {
  return j(source).find(
    j.MemberExpression,
    {
      object: {
        property: {
          name: 'calls'
        }
      },
      property: {
        name: 'reset'
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const spy = node.object.object;
    return j.memberExpression(
      spy,
      j.identifier('mockReset')
    );
  }).toSource();
}

function convertToJestSpies(initSource, j) {
  let source = initSource;

  source = replaceJasmineCreateSpy(source, j);
  source = replaceSpyOn(source, j);
  source = replaceSpyReturnValue(source, j);
  source = replaceSpyCallFake(source, j);
  source = replaceCallsReset(source, j);
  return source;
}

function importPriorGlobals(initialSource, j, filePath) {
  let source = initialSource;

  source = importArrayToModelStore(source, j, filePath);

  return source;
}

function importArrayToModelStore(source, j, filePath) {
  if (!arrayToModelStoreIsUsed(source, j) || arrayToModelStoreAlreadyImported(source, j)) {
    return source;
  }

  return j(source).find(
    j.ImportDeclaration
  ).at(-1).insertAfter(() => {
    return j.importDeclaration(
      [
        j.importSpecifier(
          j.identifier('arrayToModelStore'),
          j.identifier('arrayToModelStore')
        )
      ],
      j.literal(relativePath(filePath, 'app/helpers/data_helper'))
    );
  }).toSource();
}

function arrayToModelStoreIsUsed(source, j) {
  return j(source).find(
    j.Identifier,
    {
      name: 'arrayToModelStore'
    }
  ).size() > 0;
}

function arrayToModelStoreAlreadyImported(source, j) {
  return j(source).find(
    j.ImportSpecifier,
    {
      local: {
        name: 'arrayToModelStore'
      }
    }
  ).size() > 0;
}

function removeOrReplaceComponentStubs(initialSource, j, fileInfo) {
  let source = initialSource;
  source = removeSpyOnRenderCalls(source, j);
  source = removeStubFunctionalComponentCalls(source, j, fileInfo.path);

  return source;
}

function replaceDeferredPromiseResolve(source, j) {
  return j(source).find(
    j.CallExpression,
    {
      callee: {
        object: {
          property: {
            name: 'promise'
          }
        },
        property: {
          name: 'resolve'
        }
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const object = node.callee.object.object;

    node.callee.object = object;
    node.callee.property = j.identifier('mockResolvedValue');

    return node;
  }).toSource();
}

function removeMockPromises(source, j) {
  return j(source).find(
    j.Identifier,
    {
      name: 'MockPromises'
    }
  ).closest(
    j.ExpressionStatement
  ).remove().toSource();
}

function convertAsyncTests(initialSource, j) {
  let source = initialSource;
  source = replaceSpyOnAsync(source, j);
  source = replaceDeferredPromiseResolve(source, j);
  source = removeMockPromises(source, j);
  return source;
}

function isDispatcherFile(filePath) {
  return path.parse(filePath).name.match(/dispatcher/);
}

function sourceFile(filePath) {
  return `../${path.parse(filePath).name.match(/(.*).test(.js)?/)[1]}`;
}

function dispatcherVariableName(filePath) {
  return camelCase(path.parse(filePath).name.match(/(.*).test(.js)?/)[1]);
}

function importDispatcherUnderTest(root, j, filePath) {
  let dispatcherVarName = dispatcherVariableName(filePath);

  const existingImport = root.find(
    j.ImportDeclaration,
    {
      source: {
        value: sourceFile(filePath)
      }
    }
  ).at(0);

  existingImport.forEach((nodePath) => {
    const { node } = nodePath;

    dispatcherVarName = node.specifiers[0].local.name;
  });

  if (existingImport.size() === 0) {
    root.find(
      j.ImportDeclaration
    ).at(-1).insertAfter(() => {
      return j.importDeclaration(
        [
          j.importDefaultSpecifier(
            j.identifier(
              dispatcherVariableName(filePath)
            )
          )
        ],
        j.literal(sourceFile(filePath))
      );
    });
  }

  return dispatcherVarName;
}

function convertDispatcherTests(source, j, filePath) {
  let root = j(source);

  if (!isDispatcherFile(filePath)) {
    return source;
  }

  let dispatcherVariable, importedDispatcherVariable;

  importedDispatcherVariable = importDispatcherUnderTest(root, j, filePath);

  root.find(
    j.AssignmentExpression,
    {
      right: {
        name: 'Dispatcher'
      },
      left: {
        type: 'Identifier'
      }
    }
  ).forEach((nodePath) => {
    const { node } = nodePath;

    dispatcherVariable = node.left.name;
  }).replaceWith(() => {
    return j.assignmentExpression(
      '=',
      j.identifier('subject'),
      j.identifier(importedDispatcherVariable)
    );
  }).closest(j.ExpressionStatement).insertAfter(() => {
    return j.expressionStatement(
      j.assignmentExpression(
        '=',
        j.memberExpression(
          j.identifier('subject'),
          j.identifier('dispatch')
        ),
        j.callExpression(
          j.memberExpression(
            j.identifier('jest'),
            j.identifier('fn')
          ),
          []
        )
      )
    );
  });

  if (!dispatcherVariable) {
    return root.toSource();
  }

  root.find(
    j.CallExpression,
    {
      callee: {
        object: {
          name: dispatcherVariable
        },
        property: {
          name: 'dispatch'
        }
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    const actionProperties = node.arguments[0].properties;
    const type = find(actionProperties, ({ key: { name }}) => name === 'type').value.value;
    const data = find(actionProperties, ({ key: { name }}) => name === 'data');

    return j.callExpression(
      j.memberExpression(
        j.identifier('subject'),
        j.identifier(type)
      ),
      [
        j.objectExpression(
          [
            data
          ]
        )
      ]
    );
  });

  root.find(
    j.MemberExpression,
    {
      object: {
        name: dispatcherVariable
      },
      property: {
        name: 'dispatch'
      }
    }
  ).closest(j.ExpressionStatement).remove();

  root.find(
    j.Identifier,
    {
      name: dispatcherVariable
    }
  ).replaceWith(() => j.identifier('subject'));

  return root.toSource();
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  source = importPriorGlobals(source, j, fileInfo.path);
  source = convertToJestSpies(source, j);
  source = convertAsyncTests(source, j);
  source = convertDispatcherTests(source, j, fileInfo.path);
  source = removeOrReplaceComponentStubs(source, j, fileInfo);
  source = convertToEnzymeTests(source, j);

  return source;
};
