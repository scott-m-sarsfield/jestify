import convertDispatcher from '../convert_dispatcher';
describe('something', () => {
  let subject;
  beforeEach(() => {
    subject = convertDispatcher;

    subject.dispatch = jest.fn();
  });

  it('does something', () => {
    subject.something({
      data: 'whatever'
    });
  });
});
