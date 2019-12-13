import { relativePath } from './jestifications/helpers';
import sourceOptions from '../utils/source_options';
import { autoIncludeImport } from '../utils/auto_include_import';

export default function(fileInfo, api) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  let root = j(source);

  autoIncludeImport(root, j, {
    importName: 'arrayToModelStore',
    importSource: relativePath(fileInfo.path, 'frontend/app/helpers/data_helper'),
    last: true
  });

  return root.toSource(sourceOptions);
}
