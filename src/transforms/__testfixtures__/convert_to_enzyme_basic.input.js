describe('basic', () => {
  beforeEach(() => {
    ReactDOM.render(
      <MyComponent {...{ first: 'eslint', second: 'jest'}} />,
      root
    );
  });

  it('replaces toHaveBeenRenderedWithProps', () => {
    expect(ClassBased).toHaveBeenRenderedWithProps(
      jasmine.objectContaining({
        some: 'prop'
      })
    );
  });

  it('replaces toHaveBeenPassedProps', () => {
    expect(Functional).toHaveBeenPassedProps({other: 'prop'});
  });

  it('replaces jquery text tests', () => {
    expect($('.some-class').text()).toEqual('banana');
  });

  it('replaces root', () => {
    expect(root).toHaveText('tired');
  });

  it('replaces toContainText', () => {
    expect(root).toContainText('something silly');
  });

  it('replaces literal (class?) assertions', () => {
    expect('.banana-class').toExist();
  });

  it('replaces propsOnLastRender', () => {
    expect(propsOnLastRender(Banana).beef).toBe('good');
  });

  it('replaces propsPassedOnLastRender', () => {
    expect(propsPassedOnLastRender(Bronco).buck).toBe('redundant');
  });

  it('replaces jquery clicks', () => {
    $('.big-o-button').click();
  });

  it('replaces jquery selectors', () => {
    const elm = $('.check');
  });

  it('replaces array selector', () => {
    $('.question')[0].innerText = 'answer';
  });
});
