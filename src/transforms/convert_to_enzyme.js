import convertToEnzymeTests from './jestifications/make_enzyme_changes';

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  source = convertToEnzymeTests(source, j);

  return source;
};
