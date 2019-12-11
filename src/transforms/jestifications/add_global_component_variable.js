export function addGlobalComponentVariable(root, j) {
  if (doesComponentVariableExist(root, j)) {
    return;
  }
  root.find(
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
  });
}

function doesComponentVariableExist(root, j) {
  return root.find(
    j.VariableDeclarator,
    {
      id: {
        name: 'component'
      }
    }
  ).size() > 0;
}
