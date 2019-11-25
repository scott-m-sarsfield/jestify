#!/usr/bin/env node
/**
 * Copyright 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// react-codemod optional-name-of-transform optional/path/to/src [...options]

const globby = require('globby');
const inquirer = require('inquirer');
const meow = require('meow');
const path = require('path');
const execa = require('execa');

const transformerDirectory = path.join(__dirname, 'transforms');
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');

function runTransform({ files, flags, transformer }) {
  const transformerPath = path.join(transformerDirectory, `${transformer}.js`);

  let args = [];

  args.push('--ignore-pattern=**/node_modules/**');

  args = args.concat(['--transform', transformerPath]);

  args = args.concat(files);

  console.log(`Executing command: jscodeshift ${args.join(' ')}`);

  const result = execa.sync(jscodeshiftExecutable, args, {
    stdio: 'inherit',
    stripEof: false
  });

  if (result.error) {
    throw result.error;
  }
}

function expandFilePathsIfNeeded(filesBeforeExpansion) {
  const shouldExpandFiles = filesBeforeExpansion.some(file =>
    file.includes('*')
  );
  return shouldExpandFiles
    ? globby.sync(filesBeforeExpansion)
    : filesBeforeExpansion;
}

function run() {
  const cli = meow(
    {
      description: 'Codemods for jestifying legacy jasmine specs',
      help: `
    Usage
      $ npx @scott-m-sarsfield/jestify <path>
        path         Files or directory to transform. Can be a glob like src/**.test.js
    `
    },
    {
      boolean: ['help'],
      string: ['_'],
      alias: {
        h: 'help'
      }
    }
  );

  inquirer
  .prompt([
    {
      type: 'input',
      name: 'files',
      message: 'On which files or directory should the codemods be applied?',
      when: !cli.input[0],
      default: '.',
      // validate: () =>
      filter: files => files.trim()
    }
  ])
  .then(answers => {
    const { files } = answers;
    const selectedTransformer = 'jestify';

    const filesBeforeExpansion = cli.input[0] || files;
    const filesExpanded = expandFilePathsIfNeeded([filesBeforeExpansion]);

    if (!filesExpanded.length) {
      console.log(
        `No files found matching ${filesBeforeExpansion.join(' ')}`
      );
      return null;
    }

    return runTransform({
      files: filesExpanded,
      flags: cli.flags,
      transformer: selectedTransformer
    });
  });
}


run();
