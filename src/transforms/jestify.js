import removeSpyOnRenderCalls from './jestifications/remove_spy_on_render';
import removeStubFunctionalComponentCalls from './jestifications/remove_stub_functional_components';
import convertToEnzymeTests from './jestifications/make_enzyme_changes';

function removeOrReplaceComponentStubs(initialSource, j, fileInfo) {
  let source = initialSource;
  source = removeSpyOnRenderCalls(source, j);
  source = removeStubFunctionalComponentCalls(source, j, fileInfo.path);

  return source;
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  source = removeOrReplaceComponentStubs(source, j, fileInfo);
  source = convertToEnzymeTests(source, j);

  return source;
};
