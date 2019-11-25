export function replaceJasmineCreateSpy(source, j) {
  return j(source).find(
    j.CallExpression,
    {
      callee: {
        property: {
          name: 'createSpy'
        }
      }
    }
  ).replaceWith(() => {
    return j.callExpression(
      j.memberExpression(
        j.identifier('jest'),
        j.identifier('fn')
      ),
      []
    );
  }).toSource();
}

export function replaceSpyOn(source, j) {
  const root = j(source);

  const spyOnCalls = root.find(
    j.CallExpression,
    {
      callee: {
        name: 'spyOn'
      }
    }
  );

  const inlineReplacementCalls = spyOnCalls.filter((nodePath) => {
    const { parentPath } = nodePath;

    return parentPath.node.type === 'ExpressionStatement';
  });

  inlineReplacementCalls.closest(
    j.ExpressionStatement
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const object = node.expression.arguments[0];
    const fn = node.expression.arguments[1].value;

    return j.expressionStatement(
      jestSpy(j, object, fn)
    );
  });

  const aboveReplacementCalls = spyOnCalls.filter((nodePath) => {
    const { parentPath } = nodePath;

    return parentPath.node.type !== 'ExpressionStatement';
  });

  const aboveReplacementExpressions = {};

  aboveReplacementCalls.replaceWith((nodePath, index) => {
    const { node } = nodePath;
    const object = node.arguments[0];
    const fn = node.arguments[1].value;

    aboveReplacementExpressions[index] = {
      object,
      fn
    };

    return j.memberExpression(
      object,
      j.identifier(fn)
    );
  });

  aboveReplacementCalls.closest(
    j.ExpressionStatement
  ).insertBefore((_, index) => {
    const { object, fn } = aboveReplacementExpressions[index];
    return j.expressionStatement(
      jestSpy(j, object, fn)
    );
  });

  return root.toSource();
}

function jestSpy(j, object, fn) {
  const actualSpy = j.callExpression(
    j.memberExpression(
      j.identifier('jest'),
      j.identifier('fn')
    ),
    []
  );

  return j.assignmentExpression(
    '=',
    j.memberExpression(
      object,
      j.identifier(fn)
    ),
    actualSpy
  );
}
