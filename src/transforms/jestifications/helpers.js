import path from 'path';

export function relativePath(fromFile, toFile) {
  return path.relative(path.parse(fromFile).dir, toFile);
}
