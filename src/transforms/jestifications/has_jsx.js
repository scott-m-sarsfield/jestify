export function hasJSX(root, j) {
  return root.find(
    j.JSXElement
  ).size() > 0;
}
