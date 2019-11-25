
function autoIncludeFactory(source, j) {
  if (!isFactoryUsed(source, j) || isFactoryImported(source, j)) {
    return source;
  }

  return j(source).find(
    j.Program
  ).replaceWith((pathNode) => {
    const factoryImport = j.importDeclaration(
      [
        j.importSpecifier(
          j.identifier('Factory'),
          j.identifier('Factory')
        )
      ],
      j.literal('rosie')
    );

    pathNode.node.body.splice(0, 0, factoryImport);

    return pathNode.node;
  }).toSource();
}

function isFactoryUsed(source, j) {
  return j(source).find(
    j.Identifier,
    {
      name: 'Factory'
    }
  ).size() > 0;
}

function isFactoryImported(source, j) {
  return j(source).find(
    j.ImportSpecifier,
    {
      local: {
        name: 'Factory'
      }
    }
  ).size() > 0;
}

export default autoIncludeFactory;
