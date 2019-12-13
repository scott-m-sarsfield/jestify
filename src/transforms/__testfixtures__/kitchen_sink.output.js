import { Actions } from 'p-flux';
describe('kitchen sink', () => {
  beforeEach(() => {
    Actions.illuminati = jest.fn();
    Actions.fetchWhatever = jest.fn();
    Actions.fetchWhatever.mockImplementation(() => {});
  });

  it('asserts some dispatch', () => {
    expect(Actions.illuminati).toHaveBeenCalled();
    expect(Actions.illuminati).not.toHaveBeenCalled();
    expect(Actions.illuminati).toHaveBeenCalledWith('an order');
    expect(Actions.illuminati).not.toHaveBeenCalledWith('an order');
  });
});
