import sourceOptions from '../utils/source_options';
import path from 'path';

function getAdjustedImportPath(oldPath, { from, to }) {
  const absoluteAssetPath = path.resolve(path.dirname(from), oldPath);
  const relativeAssetPathToNewPath = path.relative(path.dirname(to), absoluteAssetPath);
  return relativeAssetPathToNewPath;
}

function replaceImportPaths(root, j, { from, to }) {
  root.find(
    j.ImportDeclaration
  ).filter((nodePath) => {
    const { node } = nodePath;
    if (node.source.value.match(/^\./)) {
      return true;
    }
    return false;
  }).replaceWith((nodePath) => {
    const { node } = nodePath;
    node.source = j.literal(getAdjustedImportPath(node.source.value, { from, to }));

    return node;
  });
}

function replaceRequirePaths(root, j, { from, to }) {
  root.find(
    j.CallExpression,
    {
      callee: {
        name: 'require'
      }
    }
  ).filter((nodePath) => {
    const { node } = nodePath;
    if (node.arguments[0].value.match(/^\./)) {
      return true;
    }
    return false;
  }).replaceWith((nodePath) => {
    const { node } = nodePath;
    node.arguments = [j.literal(getAdjustedImportPath(node.arguments[0].value, { from, to }))];

    return node;
  });
}

module.exports = function(fileInfo, api, options) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  const { from, to } = options;

  const root = j(source);

  replaceImportPaths(root, j, { from, to });
  replaceRequirePaths(root, j, { from, to });

  return root.toSource(sourceOptions);
};
