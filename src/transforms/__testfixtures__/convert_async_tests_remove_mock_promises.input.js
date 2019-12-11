describe('when the form is submitted', () => {
  it('shows success page', () => {
    Actions.readABook.mockResolvedValue();
    MockPromises.tick();
    MockPromises.tick(2);
    MockPromises.tickAllTheWay();
  })
});
