import React from 'react';
import { mount } from 'enzyme';
import ComponentUnderTest from 'app/components/component_under_test';
import ChildComponent from 'app/components/child_component';
import SecondChildComponent from 'app/components/second_child_component';

let component;

describe('ComponentUnderTest', () => {
  let props;
  beforeEach(() => {
    props = {
      some: 'props'
    };
    component = mount(<CountriesSiderFields {...props} />);
  });

  describe('when it renders', () => {
    it('renders a ChildComponent', () => {
      expect(component.find(ChildComponent)).toHaveProp({});
    });

    it('renders a SecondChildComponent', () => {
      expect(component.find(SecondChildComponent)).toHaveProp({
       child: 'props'
      });
    });
  });

  describe('other', () => {
    beforeEach(() => {
      component = mount(<CountriesSiderFields {...props} />);
    });

    it('asserts something', () => {
      component.find(ChildComponent).props.onClick();
      expect(component.find({children: 'banana'})).toExist();
    });
  });
});
