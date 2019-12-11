export function appendImportDeclaration(root, j, declaration) {
  const imports = root.find(j.ImportDeclaration);

  if (imports.size() > 0) {
    imports.at(-1).insertAfter(() => {
      return declaration;
    });
    return;
  }

  root.find(j.Program).replaceWith((nodePath) => {
    const { node } = nodePath;
    node.body = [declaration].concat(node.body);
    return node;
  });
}
