describe('something', () => {
  let dispatcher;
  beforeEach(() => {
    dispatcher = Dispatcher;

    dispatcher.dispatch.and.callThrough();
  });

  it('does something', () => {
    dispatcher.dispatch({ type: 'something', data: 'whatever' });
  });
});
