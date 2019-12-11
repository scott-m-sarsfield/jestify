import { hasJSX } from './jestifications/has_jsx';
import importEnzymeMount from './jestifications/import_enzyme_mount';
import { addGlobalComponentVariable } from './jestifications/add_global_component_variable';
import { replaceRenderFunctions } from './jestifications/replace_render_functions';
import { replaceAssertions } from './jestifications/replace_assertions';
import { replaceUtilities } from './jestifications/replace_utilities';
import sourceOptions from '../utils/source_options';

function makeEnzymeChanges(root, j) {
  if (!hasJSX(root, j)) {
    return;
  }

  importEnzymeMount(root, j);
  addGlobalComponentVariable(root, j);
  replaceRenderFunctions(root, j);
  replaceAssertions(root, j);
  replaceUtilities(root, j);
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  const root = j(source);

  makeEnzymeChanges(root, j);

  return root.toSource(sourceOptions);
};
export default makeEnzymeChanges;
