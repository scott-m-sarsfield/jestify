describe('kitchen sink', () => {
  beforeEach(() => {
    jest.spyOn(Actions, 'fetchWhatever').mockImplementation(() => {});
  });
});
