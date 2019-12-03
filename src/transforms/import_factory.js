import sourceOptions from '../utils/source_options';

function autoIncludeFactory(root, j) {
  if (!isFactoryUsed(root, j) || isFactoryImported(root, j)) {
    return root;
  }

  return root.find(
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
  });
}

function isFactoryUsed(root, j) {
  return root.find(
    j.Identifier,
    {
      name: 'Factory'
    }
  ).size() > 0;
}

function isFactoryImported(root, j) {
  return root.find(
    j.ImportSpecifier,
    {
      local: {
        name: 'Factory'
      }
    }
  ).size() > 0;
}

export default function(fileInfo, api) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  let root = j(source);

  root = autoIncludeFactory(root, j);

  return root.toSource(sourceOptions);
}
