import importEnzymeMount from './import_enzyme_mount';
import { hasJSX } from './has_jsx';
import { addGlobalComponentVariable } from './add_global_component_variable';
import { replaceRenderFunctions } from './replace_render_functions';
import { replaceAssertions } from './replace_assertions';
import { replaceUtilities } from './replace_utilities';

function makeEnzymeChanges(initSource, j) {
  let source = initSource;

  if (!hasJSX(source, j)) {
    return source;
  }

  source = importEnzymeMount(source, j);
  source = addGlobalComponentVariable(source, j);
  source = replaceRenderFunctions(source, j);
  source = replaceAssertions(source, j);
  source = replaceUtilities(source, j);

  return source;
}

export default makeEnzymeChanges;
