#!/usr/bin/env node
const globby = require('globby');
const inquirer = require('inquirer');
const meow = require('meow');
const path = require('path');
const execa = require('execa');

const transformerDistDirectory = path.join(__dirname, 'dist', 'transforms');
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');

function runTransform({ files }) {
  const transformerPath = path.join(transformerDistDirectory, 'run_all.js');

  let args = [];

  args.push('--ignore-pattern=**/node_modules/**');

  args = args.concat(['--transform', transformerPath]);

  args.push('--no-babel');

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
  const shouldExpandFiles = filesBeforeExpansion.some((file) => file.includes('*')
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
        filter: (files) => files.trim()
      }
    ])
    .then((answers) => {
      const { files } = answers;

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
        flags: cli.flags
      });
    });
}

run();
