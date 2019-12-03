export function hasJSX(source, j) {
  return j(source).find(
    j.JSXElement
  ).size() > 0;
}
