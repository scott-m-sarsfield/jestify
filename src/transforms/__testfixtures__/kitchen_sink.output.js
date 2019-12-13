describe('kitchen sink', () => {
  beforeEach(() => {
    Actions.fetchWhatever = jest.fn();
    Actions.fetchWhatever.mockImplementation(() => {});
  });
});
