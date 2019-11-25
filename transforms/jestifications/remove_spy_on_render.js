function removeSpyOnRenderCalls(source, j) {
  return j(source).find(
    j.CallExpression,
    {
      callee: {
        name: 'spyOnRender'
      }
    }
  ).remove().toSource();
}

export default removeSpyOnRenderCalls;
