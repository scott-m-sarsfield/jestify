import { hasJSX } from './has_jsx';

function importReact(root, j) {
  if (!hasJSX(root, j) || isReactAlreadyImported(root, j)) {
    return;
  }

  root.find(
    j.Program
  ).replaceWith((pathNode) => {
    const factoryImport = j.importDeclaration(
      [
        j.importDefaultSpecifier(
          j.identifier('React')
        )
      ],
      j.literal('react')
    );

    pathNode.node.body.splice(0, 0, factoryImport);

    return pathNode.node;
  });
}

function isReactAlreadyImported(root, j) {
  return root.find(
    j.ImportDeclaration,
    {
      source: {
        value: 'react'
      }
    }
  ).size() > 0;
}

export default importReact;
