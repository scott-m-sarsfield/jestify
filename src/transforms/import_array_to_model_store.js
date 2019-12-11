import { relativePath } from './jestifications/helpers';
import sourceOptions from '../utils/source_options';
import { appendImportDeclaration } from '../utils/append_import';

function importArrayToModelStore(root, j, filePath) {
  if (!arrayToModelStoreIsUsed(root, j) || arrayToModelStoreAlreadyImported(root, j)) {
    return root;
  }

  const arrayToModelStoreImport = j.importDeclaration(
    [
      j.importSpecifier(
        j.identifier('arrayToModelStore'),
        j.identifier('arrayToModelStore')
      )
    ],
    j.literal(relativePath(filePath, 'frontend/app/helpers/data_helper'))
  );

  appendImportDeclaration(root, j, arrayToModelStoreImport);
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

  importArrayToModelStore(root, j, fileInfo.path);

  return root.toSource(sourceOptions);
}
