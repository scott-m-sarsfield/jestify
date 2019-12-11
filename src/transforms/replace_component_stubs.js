import removeStubFunctionalComponentCalls from './jestifications/remove_stub_functional_components';
import sourceOptions from '../utils/source_options';

function removeSpyOnRenderCalls(root, j) {
  root.find(
    j.CallExpression,
    {
      callee: {
        name: 'spyOnRender'
      }
    }
  ).remove();
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  const root = j(source);

  removeSpyOnRenderCalls(root, j);
  removeStubFunctionalComponentCalls(root, j, fileInfo.path);

  return root.toSource(sourceOptions);
};
