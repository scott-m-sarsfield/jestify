import React from 'react';
import { mount } from 'enzyme';
let component;
describe('basic', () => {
  beforeEach(() => {
    const SomeComponent = () => null;
    const SomeOtherComponent = () => <div />;
    component = mount(<MyComponent {...{ first: 'eslint', second: 'jest'}} />);
  });

  it('converts global render', () => {
    component = mount(<OtherComponent />);
  });

  it('replaces toHaveBeenRendered', () => {
    expect(component.find(ClassBased)).toExist();
    expect(component.find(OtherClassBased)).not.toExist();
  });

  it('replaces toHaveBeenRenderedWithProps', () => {
    expect(component.find(ClassBased)).toHaveProp(
      {
        some: 'prop'
      }
    );
  });

  it('replaces toHaveBeenPassedProps', () => {
    expect(component.find(Functional)).toHaveProp({other: 'prop'});
  });

  it('replaces jquery text tests', () => {
    expect(component.find('.some-class')).toHaveText('banana');
    expect(component.find('.some-other-class').at(0)).toHaveText('bread');
  });

  it('replaces root', () => {
    expect(component).toHaveText('tired');
  });

  it('replaces simple matchers', () => {
    expect(component).toIncludeText('something silly');
    expect(component).toHaveClassName('.silly');
  });

  it('replaces literal (class?) assertions', () => {
    expect(component.find('.banana-class')).toExist();
    expect(component.find('.banana-class')).not.toExist();
    expect(component.find('.some-class')).toHaveText('some text');
    expect(component.find('.some-class')).not.toHaveText('some text');
    expect(component.find('.some-class')).toIncludeText('some text');
    expect(component.find('.some-class')).not.toIncludeText('some text');
    expect(component.find('.some-class')).toHaveLength(3);
    expect(component.find('.some-class')).toBeChecked();
    expect(component.find('.some-class')).toBeDisabled();
    expect(component.find('.some-class')).toHaveProp('disabled');
    expect(component.find('.some-class')).toHaveProp('src', 'http://youtube.com');
  });

  it('replaces propsOnLastRender', () => {
    expect(component.find(Banana).props().beef).toBe('good');
  });

  it('replaces propsPassedOnLastRender', () => {
    expect(component.find(Bronco).props().buck).toBe('redundant');
  });

  it('replaces propsOnRenderAt', () => {
    component.find(Bumblebee).at(2).props().onSubmit();
    component.find(Wasp).at(1).props().onClick();
  });

  it('replaces jquery clicks', () => {
    component.find('.big-o-button').simulate('click');
  });

  it('replaces jquery selectors', () => {
    const elm = component.find('.check');
  });

  it('replaces array selector', () => {
    component.find('.question').at(0).text();
  });

  it('replaces :eq psuedoselectors', () => {
    expect(component.find('.some-class').at(0)).toHaveClassName('selected');
    component.find('.da-button').at(3).simulate('click');
  });

  it('replaces unmount', () => {
    component.unmount();
  });
});
