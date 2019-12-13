import sourceOptions from '../utils/source_options';
import uniq from 'lodash/uniq';
import difference from 'lodash/difference';
import path from 'path';
import { autoIncludeImport } from '../utils/auto_include_import';

function isDispatcherFile(filePath) {
  return path.parse(filePath).name.match(/dispatcher/);
}

function fixActionSpies(root, j) {
  const spiesOnActions = root.find(
    j.CallExpression,
    {
      callee: {
        object: {
          name: 'jest'
        },
        property: {
          name: 'spyOn'
        }
      },
      arguments: [
        {
          name: 'Actions'
        }
      ]
    }
  );

  let actionsToMock = [];

  spiesOnActions.forEach((nodePath) => {
    const { node } = nodePath;

    actionsToMock.push(node.arguments[1].value);
  });

  spiesOnActions.closest(j.ExpressionStatement).insertBefore((_, index) => {
    return j.expressionStatement(
      j.assignmentExpression(
        '=',
        j.memberExpression(
          j.identifier('Actions'),
          j.identifier(actionsToMock[index])
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

  spiesOnActions.replaceWith((_, index) => {
    return j.memberExpression(
      j.identifier('Actions'),
      j.identifier(actionsToMock[index])
    );
  });
}

function fixActionDispatchAssertions(root, j, path) {
  if (isDispatcherFile(path)) {
    return;
  }

  const dispatchedCalls = root.find(
    j.CallExpression,
    {
      callee: {
        property: {
          name: 'toHaveBeenDispatched'
        }
      }
    }
  );

  dispatchedCalls.replaceWith((nodePath) => {
    const { node } = nodePath;

    node.callee.property = j.identifier('toHaveBeenCalled');
    return node;
  });
  dispatchedCalls.find(
    j.CallExpression,
    {
      callee: {
        name: 'expect'
      },
      arguments: [
        {
          type: 'Literal'
        }
      ]
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    node.arguments = [
      j.memberExpression(
        j.identifier('Actions'),
        j.identifier(node.arguments[0].value)
      )
    ];

    return node;
  });

  const dispatchedWithCalls = root.find(
    j.CallExpression,
    {
      callee: {
        property: {
          name: 'toHaveBeenDispatchedWith'
        }
      }
    }
  );

  dispatchedWithCalls.replaceWith((nodePath) => {
    const { node } = nodePath;

    const dataProperty = node.arguments[0].properties.find((property) => property.key.name === 'data');

    if (dataProperty) {
      node.callee.property = j.identifier('toHaveBeenCalledWith');
      node.arguments = [dataProperty.value];
    } else {
      node.callee.property = j.identifier('toHaveBeenCalled');
    }
    return node;
  });
  dispatchedWithCalls.find(
    j.CallExpression,
    {
      callee: {
        name: 'expect'
      },
      arguments: [
        {
          type: 'Literal'
        }
      ]
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;

    node.arguments = [
      j.memberExpression(
        j.identifier('Actions'),
        j.identifier(node.arguments[0].value)
      )
    ];

    return node;
  });
}

function autoStubActions(root, j) {
  let knownActions = [];
  root.find(
    j.MemberExpression,
    {
      object: {
        name: 'Actions'
      }
    }
  ).forEach((nodePath) => {
    const { node } = nodePath;

    knownActions.push(node.property.name);
  });

  knownActions = uniq(knownActions);

  let stubbedActions = [];
  root.find(
    j.AssignmentExpression,
    {
      left: {
        object: {
          name: 'Actions'
        }
      }
    }
  ).forEach((nodePath) => {
    const { node } = nodePath;
    stubbedActions.push(node.left.property.name);
  });

  knownActions = difference(knownActions, stubbedActions);

  root.find(
    j.CallExpression,
    {
      callee: {
        name: 'beforeEach'
      }
    }
  ).at(0).find(
    j.BlockStatement
  ).at(0).replaceWith((nodePath) => {
    const { node } = nodePath;

    const actionStubs = knownActions.map((knownAction) => j.expressionStatement(
      j.assignmentExpression(
        '=',
        j.memberExpression(
          j.identifier('Actions'),
          j.identifier(knownAction)
        ),
        j.callExpression(
          j.memberExpression(
            j.identifier('jest'),
            j.identifier('fn')
          ),
          []
        )
      )
    ));

    node.body = actionStubs.concat(node.body);

    return node;
  });
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  const root = j(source);

  fixActionSpies(root, j);
  fixActionDispatchAssertions(root, j, fileInfo.path);
  autoIncludeImport(root, j, {
    importName: 'Actions',
    importSource: 'p-flux',
    last: true
  });
  autoStubActions(root, j);

  return root.toSource(sourceOptions);
};
