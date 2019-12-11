import { relativePath } from './jestifications/helpers';
import sourceOptions from '../utils/source_options';

function importArrayToModelStore(root, j, filePath) {
  if (!arrayToModelStoreIsUsed(root, j) || arrayToModelStoreAlreadyImported(root, j)) {
    return root;
  }

  const hasImports = root.find(j.ImportDeclaration).size() > 0;

  const arrayToModelStoreImport = j.importDeclaration(
    [
      j.importSpecifier(
        j.identifier('arrayToModelStore'),
        j.identifier('arrayToModelStore')
      )
    ],
    j.literal(relativePath(filePath, 'frontend/app/helpers/data_helper'))
  );

  if (hasImports) {
    return root.find(
      j.ImportDeclaration
    ).at(-1).insertAfter(() => {
      return arrayToModelStoreImport;
    });
  }

  return root.find(j.Program).replaceWith((nodePath) => {
    const { node } = nodePath;
    node.body = [arrayToModelStoreImport].concat(node.body);
    return node;
  });
}

function arrayToModelStoreIsUsed(root, j) {
  return root.find(
    j.Identifier,
    {
      name: 'arrayToModelStore'
    }
  ).size() > 0;
}

function arrayToModelStoreAlreadyImported(root, j) {
  return root.find(
    j.ImportSpecifier,
    {
      local: {
        name: 'arrayToModelStore'
      }
    }
  ).size() > 0;
}

export default function(fileInfo, api) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  let root = j(source);

  root = importArrayToModelStore(root, j, fileInfo.path);

  return root.toSource(sourceOptions);
}
