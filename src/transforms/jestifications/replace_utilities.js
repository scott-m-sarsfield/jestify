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

export function replaceUtilities(initSource, j) {
  let source = initSource;

  source = replacePropsAccessor(source, j, 'propsOnLastRender');
  source = replacePropsAccessor(source, j, 'propsPassedOnLastRender');
  source = replaceJQueryClick(source, j);

  return source;
}
