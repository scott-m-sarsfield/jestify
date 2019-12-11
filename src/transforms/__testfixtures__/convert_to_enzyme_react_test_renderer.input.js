import TestRenderer from 'react-test-renderer';
import ComponentUnderTest from 'app/components/component_under_test';
import expectComponentToExistWithPropsCurry from '../../../../support/expect_component_with_props_to_exist_curry';
import ChildComponent from 'app/components/child_component';
import SecondChildComponent from 'app/components/second_child_component';

describe('ComponentUnderTest', () => {
  let renderer, instance, props;
  let expectComponentToExistWithProps;
  beforeEach(() => {
    props = {
      some: 'props'
    };
    renderer = TestRenderer.create(
      <CountriesSiderFields {...props} />
  );
    instance = renderer.root;
    expectComponentToExistWithProps = expectComponentToExistWithPropsCurry(instance);
  });

  describe('when it renders', () => {
    it('renders a ChildComponent', () => {
      expectComponentToExistWithProps(ChildComponent, jasmine.objectContaining({}));
    });

    it('renders a SecondChildComponent', () => {
      expectComponentToExistWithProps(
        SecondChildComponent,
        jasmine.objectContaining({
         child: 'props'
        })
      );
    });
  });
});
