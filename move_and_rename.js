const path = require('path');
const execa = require('execa');
const fs = require('fs');

const transformerDistDirectory = path.join(__dirname, 'dist', 'transforms');
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');

function generateNewPath(oldPath) {
  return path.join(
    path.dirname(oldPath.replace('spec/', '')),
    '__tests__',
    path.basename(oldPath).replace('_spec.js', '.test.js')
  );
}

function moveFile(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.stat(newPath, (err) => {
      if (err) { // file doesn't exist -- we're not going to overwrite something.
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
        return;
      }
      reject(new Error('Cannot migrate file -- file already exists.'));
    });
  });
}

function runTransform({ files }) {
  return Promise.all(
    files.map(async (file) => {
      const absolutePath = path.resolve(file);
      const newPath = generateNewPath(absolutePath);
      await moveFile(absolutePath, newPath);
      const relativeNewPath = path.relative(process.cwd(), newPath);

      const transformerPath = path.join(transformerDistDirectory, 'move_to__tests__.js');

      let args = [];

      args.push('--ignore-pattern=**/node_modules/**');

      args = args.concat(['--transform', transformerPath]);

      args.push('--no-babel');

      args.push('--from=' + absolutePath);
      args.push('--to=' + newPath);

      args = args.concat([relativeNewPath]);

      console.log(`Executing command: jscodeshift ${args.join(' ')}`);

      const result = execa.sync(jscodeshiftExecutable, args, {
        stdio: 'inherit',
        stripEof: false
      });

      if (result.error) {
        throw result.error;
      }

      return relativeNewPath;
    })
  );
}

module.exports = runTransform;
