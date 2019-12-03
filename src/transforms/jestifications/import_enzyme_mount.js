import { hasJSX } from './has_jsx';

function importEnzymeMount(source, j) {
  if (!hasJSX(source, j) || isEnzymeAlreadyImported(source, j)) {
    return source;
  }

  return j(source).find(
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
  }).toSource();
}

function isEnzymeAlreadyImported(source, j) {
  return j(source).find(
    j.ImportDeclaration,
    {
      source: {
        value: 'enzyme'
      }
    }
  ).size() > 0;
}

export default importEnzymeMount;
