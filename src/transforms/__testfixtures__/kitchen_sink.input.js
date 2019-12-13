describe('kitchen sink', () => {
  beforeEach(() => {
    jest.spyOn(Actions, 'fetchWhatever').mockImplementation(() => {});
  });

  it('asserts some dispatch', () => {
    expect('illuminati').toHaveBeenDispatched();
    expect('illuminati').not.toHaveBeenDispatched();
    expect('illuminati').toHaveBeenDispatchedWith({
      data: 'an order'
    });
    expect('illuminati').not.toHaveBeenDispatchedWith({
      data: 'an order'
    });
  });
});
