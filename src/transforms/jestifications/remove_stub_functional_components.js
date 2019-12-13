import path from 'path';
import kebabCase from 'lodash/kebabCase';
import startCase from 'lodash/startCase';
import { appendAfterImportDeclarations } from '../../utils/append_after_imports';
import { relativePath } from './helpers';

const PATH_TO_COMPONENTS_DIR = 'frontend/app/';

function pascalCase(str) {
  return startCase(str).replace(/\s/g, '');
}

function removeStubFunctionalComponentCalls(root, j, filePath) {
  const stubFunctionalComponentCalls = root.find(
    j.CallExpression,
    {
      callee: {
        name: 'stubFunctionalComponent'
      }
    }
  );

  mockEachStubbedComponent(j, root, stubFunctionalComponentCalls, filePath);

  const removableCalls = stubFunctionalComponentCalls.filter((nodePath) => {
    const { parentPath } = nodePath;

    return parentPath.node.type === 'ExpressionStatement';
  });

  removableCalls.remove();

  const assignedCalls = stubFunctionalComponentCalls.filter((nodePath) => {
    const { parentPath } = nodePath;

    return parentPath.node.type === 'AssignmentExpression';
  });

  importEachStubbedComponent(j, root, assignedCalls, filePath);
  replaceAssignedVariableWithComponent(j, root, assignedCalls);
}

function importEachStubbedComponent(j, root, stubFunctionalComponentCalls, filePath) {
  let stubbedComponents = [];

  stubFunctionalComponentCalls.forEach((nodePath) => {
    const { node } = nodePath;

    const { relativePath, properName } = scrapeCall(node, filePath);

    stubbedComponents.push({
      relativePath,
      properName
    });
  });

  stubbedComponents.forEach(({ relativePath, properName }) => {
    addImportForComponent(j, root, { relativePath, properName });
  });
}

function scrapeCall(node, filePath) {
  const stubbedPath = node.arguments[0].value;
  const _relativePath = relativePath(filePath, PATH_TO_COMPONENTS_DIR + stubbedPath);
  return {
    relativePath: _relativePath,
    properName: pascalCase(path.parse(PATH_TO_COMPONENTS_DIR + stubbedPath).name)
  };
}

function replaceAssignedVariableWithComponent(j, root, calls) {
  calls.closest(
    j.AssignmentExpression
  ).forEach((nodePath, index) => {
    const { node } = nodePath;
    const variableToReplace = node.left.name;

    root.find(
      j.VariableDeclarator,
      {
        id: {
          name: variableToReplace
        }
      }
    ).remove();

    let componentName;

    calls.at(index).forEach((nodePath) => {
      const { node } = nodePath;
      componentName = scrapeCall(node, '').properName;
    });

    root.find(
      j.Identifier,
      {
        name: variableToReplace
      }
    ).replaceWith(() => j.identifier(componentName));
  }).remove();
}

function mockEachStubbedComponent(j, root, stubFunctionalComponentCalls, filePath) {
  let stubbedComponents = [];

  stubFunctionalComponentCalls.forEach((nodePath) => {
    const { node } = nodePath;

    const stubbedPath = node.arguments[0].value;
    const relativePath = path.relative(path.parse(filePath).dir, PATH_TO_COMPONENTS_DIR + stubbedPath);
    stubbedComponents.push({
      relativePath,
      className: kebabCase(path.parse(PATH_TO_COMPONENTS_DIR + stubbedPath).name)
    });
  });

  stubbedComponents.forEach(({ relativePath, className }) => {
    addJestMockForComponent(j, root, { relativePath, className });
  });
}

function addJestMockForComponent(j, root, { relativePath, className }) {
  if (alreadyMockedComponent(j, root, relativePath)) {
    return;
  }

  const jestMockStatement = j.expressionStatement(
    j.callExpression(
      j.memberExpression(
        j.identifier('jest'),
        j.identifier('mock')
      ),
      [
        j.literal(relativePath),
        j.arrowFunctionExpression(
          [],
          j.arrowFunctionExpression(
            [],
            j.jsxElement(
              j.jsxOpeningElement(
                j.jsxIdentifier('div'),
                [
                  j.jsxAttribute(
                    j.jsxIdentifier('className'),
                    j.literal(className)
                  )
                ],
                true
              )
            )
          )
        )
      ]
    )
  );

  appendAfterImportDeclarations(root, j, jestMockStatement);
}

function alreadyMockedComponent(j, root, relativePath) {
  return root.find(
    j.CallExpression,
    {
      callee: {
        object: {
          name: 'jest'
        },
        property: {
          name: 'mock'
        }
      },
      arguments: [
        relativePath
      ]
    }
  ).size() > 0;
}

function addImportForComponent(j, root, { relativePath, properName }) {
  if (alreadyImportingComponent(j, root, relativePath)) {
    return;
  }

  const componentImportDeclaration = j.importDeclaration(
    [
      j.importDefaultSpecifier(
        j.identifier(properName)
      )
    ],
    j.literal(relativePath)
  );

  appendAfterImportDeclarations(root, j, componentImportDeclaration);
}

function alreadyImportingComponent(j, root, relativePath) {
  return root.find(
    j.ImportDeclaration,
    {
      source: {
        value: relativePath
      }
    }
  ).size() > 0;
}

export default removeStubFunctionalComponentCalls;
