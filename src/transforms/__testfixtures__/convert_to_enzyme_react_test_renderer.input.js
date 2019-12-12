import TestRenderer from 'react-test-renderer';
import ComponentUnderTest from 'app/components/component_under_test';
import expectComponentWithPropsToExistCurry from '../../../../support/expect_component_with_props_to_exist_curry';
import ChildComponent from 'app/components/child_component';
import SecondChildComponent from 'app/components/second_child_component';

describe('ComponentUnderTest', () => {
  let renderer, instance, props;
  let expectComponentWithPropsToExist;
  beforeEach(() => {
    props = {
      some: 'props'
    };
    renderer = TestRenderer.create(
      <CountriesSiderFields {...props} />
  );
    instance = renderer.root;
    expectComponentWithPropsToExist = expectComponentWithPropsToExistCurry(instance);
  });

  describe('when it renders', () => {
    it('renders a ChildComponent', () => {
      expectComponentWithPropsToExist(ChildComponent, jasmine.objectContaining({}));
    });

    it('renders a SecondChildComponent', () => {
      expectComponentWithPropsToExist(
        SecondChildComponent,
        jasmine.objectContaining({
         child: 'props'
        })
      );
    });
  });
});
