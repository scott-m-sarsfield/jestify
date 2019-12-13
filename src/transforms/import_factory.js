import sourceOptions from '../utils/source_options';
import { autoIncludeImport } from '../utils/auto_include_import';

export default function(fileInfo, api) {
  let source = fileInfo.source;
  const j = api.jscodeshift;

  let root = j(source);

  root = autoIncludeImport(root, j, {
    importName: 'Factory',
    importSource: 'rosie'
  });

  return root.toSource(sourceOptions);
}
