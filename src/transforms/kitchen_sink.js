import sourceOptions from '../utils/source_options';

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

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  const root = j(source);

  fixActionSpies(root, j);

  return root.toSource(sourceOptions);
};
