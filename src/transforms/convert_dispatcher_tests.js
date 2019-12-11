import find from 'lodash/find';
import path from 'path';
import camelCase from 'lodash/camelCase';
import sourceOptions from '../utils/source_options';
import { appendImportDeclaration } from '../utils/append_import';

function isDispatcherFile(filePath) {
  return path.parse(filePath).name.match(/dispatcher/);
}

function sourceFile(filePath) {
  return `../${path.parse(filePath).name.match(/(.*).test(.js)?/)[1]}`;
}

function dispatcherVariableName(filePath) {
  return camelCase(path.parse(filePath).name.match(/(.*).test(.js)?/)[1]);
}

function getOrCreateImportedDispatcherVariable(root, j, filePath) {
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
    createDispatcherImportDeclaration(root, j, filePath);
  }

  return dispatcherVarName;
}

function createDispatcherImportDeclaration(root, j, filePath) {
  const dispatcherImport = j.importDeclaration(
    [
      j.importDefaultSpecifier(
        j.identifier(
          dispatcherVariableName(filePath)
        )
      )
    ],
    j.literal(sourceFile(filePath))
  );

  appendImportDeclaration(root, j, dispatcherImport);
}

function convertDispatcherTests(root, j, filePath) {
  if (!isDispatcherFile(filePath)) {
    return;
  }

  let dispatcherVariable, importedDispatcherVariable;

  importedDispatcherVariable = getOrCreateImportedDispatcherVariable(root, j, filePath);

  const globalDispatcherAssignments = root.find(
    j.AssignmentExpression,
    {
      right: {
        name: 'Dispatcher'
      },
      left: {
        type: 'Identifier'
      }
    }
  );

  globalDispatcherAssignments.forEach((nodePath) => {
    const { node } = nodePath;

    dispatcherVariable = node.left.name; // presumably only one.
  });

  globalDispatcherAssignments.replaceWith(() => {
    return j.assignmentExpression(
      '=',
      j.identifier('subject'),
      j.identifier(importedDispatcherVariable)
    );
  });

  globalDispatcherAssignments.closest(j.ExpressionStatement).insertAfter(() => {
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
    return;
  }

  const dispatchCalls = root.find(
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
  );

  dispatchCalls.replaceWith((nodePath) => {
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

  const remainingDispatchStatements = root.find(
    j.MemberExpression,
    {
      object: {
        name: dispatcherVariable
      },
      property: {
        name: 'dispatch'
      }
    }
  ).closest(j.ExpressionStatement);

  remainingDispatchStatements.remove();

  root.find(
    j.Identifier,
    {
      name: dispatcherVariable
    }
  ).replaceWith(() => j.identifier('subject'));
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  const root = j(source);

  convertDispatcherTests(root, j, fileInfo.path);

  return root.toSource(sourceOptions);
};
