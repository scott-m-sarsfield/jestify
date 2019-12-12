import { hasJSX } from './jestifications/has_jsx';
import importEnzymeMount from './jestifications/import_enzyme_mount';
import { addGlobalComponentVariable } from './jestifications/add_global_component_variable';
import { replaceRenderFunctions } from './jestifications/replace_render_functions';
import { replaceAssertions } from './jestifications/replace_assertions';
import { replaceUtilities } from './jestifications/replace_utilities';
import sourceOptions from '../utils/source_options';

function cleanupReactTestRendererExpectCurry(root, j, { expectComponentToExistCurryVariable, expectComponentToExistVariable }) {
  root.find(
    j.ImportDefaultSpecifier,
    {
      local: {
        name: expectComponentToExistCurryVariable
      }
    }
  ).closest(j.ImportDeclaration).remove();

  const curryAssignments = root.find(
    j.AssignmentExpression,
    {
      right: {
        callee: {
          name: expectComponentToExistCurryVariable
        }
      }
    }
  );

  curryAssignments.closest(j.ExpressionStatement).remove();

  root.find(
    j.VariableDeclarator,
    {
      id: {
        name: expectComponentToExistVariable
      }
    }
  ).remove();
}

function cleanupUselessCode(root, j, variables) {
  cleanupReactTestRendererExpectCurry(root, j, variables);
}

function makeEnzymeChanges(root, j) {
  if (!hasJSX(root, j)) {
    return;
  }

  const variables = {};

  importEnzymeMount(root, j);
  addGlobalComponentVariable(root, j);
  replaceRenderFunctions(root, j, variables);
  replaceAssertions(root, j, variables);
  replaceUtilities(root, j, variables);
  cleanupUselessCode(root, j, variables);
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  const root = j(source);

  makeEnzymeChanges(root, j);

  return root.toSource(sourceOptions);
};
export default makeEnzymeChanges;
