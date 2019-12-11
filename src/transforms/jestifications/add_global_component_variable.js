export function addGlobalComponentVariable(source, j) {
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
