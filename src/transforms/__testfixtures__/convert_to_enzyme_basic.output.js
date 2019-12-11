import { mount } from 'enzyme';
let component;
describe('basic', () => {
  beforeEach(() => {
    component = mount(<MyComponent {...{ first: 'eslint', second: 'jest'}} />);
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
  });

  it('replaces root', () => {
    expect(component).toHaveText('tired');
  });

  it('replaces toContainText', () => {
    expect(component).toIncludeText('something silly');
  });

  it('replaces literal (class?) assertions', () => {
    expect(component.find('.banana-class')).toExist();
  });

  it('replaces propsOnLastRender', () => {
    expect(component.find(Banana).props().beef).toBe('good');
  });

  it('replaces propsPassedOnLastRender', () => {
    expect(component.find(Bronco).props().buck).toBe('redundant');
  });

  it('replaces jquery clicks', () => {
    component.find('.big-o-button').simulate('click');
  });
});
