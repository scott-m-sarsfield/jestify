import replaceSpyOnAsync from './jestifications/replace_spy_on_async';
import sourceOptions from '../utils/source_options';

function replaceDeferredPromiseResolve(root, j) {
  root.find(
    j.CallExpression,
    {
      callee: {
        object: {
          property: {
            name: 'promise'
          }
        },
        property: {
          name: 'resolve'
        }
      }
    }
  ).replaceWith((nodePath) => {
    const { node } = nodePath;
    const object = node.callee.object.object;

    node.callee.object = object;
    node.callee.property = j.identifier('mockResolvedValue');

    return node;
  });

  return root;
}

function removeMockPromises(root, j) {
  root.find(
    j.Identifier,
    {
      name: 'MockPromises'
    }
  ).closest(
    j.ExpressionStatement
  ).remove();

  return root;
}

function convertAsyncTests(root, j) {
  root = replaceSpyOnAsync(root, j);
  root = replaceDeferredPromiseResolve(root, j);
  root = removeMockPromises(root, j);
  return root;
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  let root = j(source);

  root = convertAsyncTests(root, j);

  return root.toSource(sourceOptions);
};
