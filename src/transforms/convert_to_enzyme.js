import { hasJSX } from './jestifications/has_jsx';
import importEnzymeMount from './jestifications/import_enzyme_mount';
import importReact from './jestifications/import_react';
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

function replacePsuedoSelectors(root, j) {
  const ENDS_IN_EQ_REGEX = /(.*):eq\(([0-9]+)\)[\s]*$/;
  root.find(
    j.CallExpression,
    {
      callee: {
        object: {
          name: 'component'
        },
        property: {
          name: 'find'
        }
      },
      arguments: [
        {
          type: 'Literal'
        }
      ]
    }
  ).filter((nodePath) => {
    const { node } = nodePath;

    const cssSelector = node.arguments[0].value;

    return ENDS_IN_EQ_REGEX.test(cssSelector);
  }).replaceWith((nodePath) => {
    const { node } = nodePath;
    const cssSelector = node.arguments[0].value;

    const match = cssSelector.match(ENDS_IN_EQ_REGEX);
    const prefix = match[1];
    const index = match[2];

    return j.callExpression(
      j.memberExpression(
        j.callExpression(
          node.callee,
          [
            j.literal(prefix)
          ]
        ),
        j.identifier('at')
      ),
      [
        j.literal(Number(index))
      ]
    );
  });
}

function makeEnzymeChanges(root, j) {
  if (!hasJSX(root, j)) {
    return;
  }

  const variables = {};

  importEnzymeMount(root, j);
  importReact(root, j);
  addGlobalComponentVariable(root, j);
  replaceRenderFunctions(root, j, variables);
  replaceUtilities(root, j, variables);
  replaceAssertions(root, j, variables);
  replacePsuedoSelectors(root, j);
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
