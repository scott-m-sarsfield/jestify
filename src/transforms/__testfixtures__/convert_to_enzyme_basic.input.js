describe('basic', () => {
  beforeEach(() => {
    const SomeComponent = createSpyComponent();
    const SomeOtherComponent = createSpyComponent(() => <div />);
    ReactDOM.render(
      <MyComponent {...{ first: 'eslint', second: 'jest'}} />,
      root
    );
  });

  it('converts global render', () => {
    render(<OtherComponent />);
  });

  it('replaces toHaveBeenRendered', () => {
    expect(ClassBased).toHaveBeenRendered();
    expect(OtherClassBased).not.toHaveBeenRendered();
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
    expect($('.some-other-class')[0].innerText).toEqual('bread');
  });

  it('replaces root', () => {
    expect(root).toHaveText('tired');
  });

  it('replaces simple matchers', () => {
    expect(root).toContainText('something silly');
    expect(root).toHaveClass('.silly');
  });

  it('replaces literal (class?) assertions', () => {
    expect('.banana-class').toExist();
    expect('.banana-class').not.toExist();
    expect('.some-class').toHaveText('some text');
    expect('.some-class').not.toHaveText('some text');
    expect('.some-class').toContainText('some text');
    expect('.some-class').not.toContainText('some text');
    expect('.some-class').toHaveLength(3);
    expect('.some-class').toBeChecked();
    expect('.some-class').toBeDisabled();
    expect('.some-class').toHaveAttr('disabled');
    expect('.some-class').toHaveAttr('src', 'http://youtube.com');
    expect('input.whatever').toHaveValue('5');
  });

  it('replaces propsOnLastRender', () => {
    expect(propsOnLastRender(Banana).beef).toBe('good');
  });

  it('replaces propsPassedOnLastRender', () => {
    expect(propsPassedOnLastRender(Bronco).buck).toBe('redundant');
  });

  it('replaces propsOnRenderAt', () => {
    propsOnRenderAt(Bumblebee, 2).onSubmit();
    propsPassedOnRenderAt(Wasp, 1).onClick();
  });

  it('replaces jquery clicks', () => {
    $('.big-o-button').click();
  });

  it('replaces jquery selectors', () => {
    const elm = $('.check');
  });

  it('replaces array selector', () => {
    $('.question')[0].innerText;
  });

  it('replaces :eq psuedoselectors', () => {
    expect('.some-class:eq(0)').toHaveClass('selected');
    $('.da-button:eq(3)').simulate('click');
  });

  it('replaces unmount', () => {
    ReactDOM.unmountComponentAtNode(root);
  });
});
