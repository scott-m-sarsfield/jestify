import { hasJSX } from './jestifications/has_jsx';
import importEnzymeMount from './jestifications/import_enzyme_mount';
import { addGlobalComponentVariable } from './jestifications/add_global_component_variable';
import { replaceRenderFunctions } from './jestifications/replace_render_functions';
import { replaceAssertions } from './jestifications/replace_assertions';
import { replaceUtilities } from './jestifications/replace_utilities';
import sourceOptions from '../utils/source_options';

function cleanupReactTestRendererExpectCurry(root, j) {
  let curriedVariable;

  root.find(
    j.ImportDefaultSpecifier,
    {
      local: {
        name: 'expectComponentToExistWithPropsCurry'
      }
    }
  ).closest(j.ImportDeclaration).remove();

  const curryAssignments = root.find(
    j.AssignmentExpression,
    {
      right: {
        callee: {
          name: 'expectComponentToExistWithPropsCurry'
        }
      }
    }
  );

  curryAssignments.forEach((nodePath) => {
    const { node } = nodePath;
    curriedVariable = node.left.name;
  });

  curryAssignments.closest(j.ExpressionStatement).remove();

  root.find(
    j.VariableDeclarator,
    {
      id: {
        name: curriedVariable
      }
    }
  ).remove();
}

function cleanupUselessCode(root, j) {
  cleanupReactTestRendererExpectCurry(root, j);
}

function makeEnzymeChanges(root, j) {
  if (!hasJSX(root, j)) {
    return;
  }

  importEnzymeMount(root, j);
  addGlobalComponentVariable(root, j);
  replaceRenderFunctions(root, j);
  replaceAssertions(root, j);
  replaceUtilities(root, j);
  cleanupUselessCode(root, j);
}

module.exports = function(fileInfo, api /*, options */) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  const root = j(source);

  makeEnzymeChanges(root, j);

  return root.toSource(sourceOptions);
};
export default makeEnzymeChanges;
