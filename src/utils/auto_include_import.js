import { appendAfterImportDeclarations } from './append_after_imports';

export function autoIncludeImport(root, j, {
  importName,
  importSource,
  importSpecifier = (j) => j.importSpecifier,
  ImportSpecifier = (j) => j.ImportSpecifier,
  last = false
}) {
  if (!isImportUsed(root, j, { importName }) || isImportImported(root, j, { importName, ImportSpecifier })) {
    return root;
  }

  const theImport = j.importDeclaration(
    [
      importSpecifier(j)(
        j.identifier(importName),
        j.identifier(importName)
      )
    ],
    j.literal(importSource)
  );

  if (last) {
    appendAfterImportDeclarations(root, j, theImport);
    return;
  }

  return root.find(
    j.Program
  ).replaceWith((pathNode) => {
    pathNode.node.body.splice(0, 0, theImport);
    return pathNode.node;
  });
}

function isImportUsed(root, j, { importName }) {
  return root.find(
    j.Identifier,
    {
      name: importName
    }
  ).size() > 0;
}

function isImportImported(root, j, { importName, ImportSpecifier }) {
  return root.find(
    ImportSpecifier(j),
    {
      local: {
        name: importName
      }
    }
  ).size() > 0;
}
