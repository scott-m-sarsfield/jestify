import { hasJSX } from './has_jsx';

function importEnzymeMount(root, j) {
  if (!hasJSX(root, j) || isEnzymeAlreadyImported(root, j)) {
    return;
  }

  root.find(
    j.Program
  ).replaceWith((pathNode) => {
    const factoryImport = j.importDeclaration(
      [
        j.importSpecifier(
          j.identifier('mount'),
          j.identifier('mount')
        )
      ],
      j.literal('enzyme')
    );

    pathNode.node.body.splice(0, 0, factoryImport);

    return pathNode.node;
  });
}

function isEnzymeAlreadyImported(root, j) {
  return root.find(
    j.ImportDeclaration,
    {
      source: {
        value: 'enzyme'
      }
    }
  ).size() > 0;
}

export default importEnzymeMount;
