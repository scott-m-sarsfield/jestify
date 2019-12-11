import ThirdFunctional from '../../../app/components/shared/third_functional';

jest.mock(
  '../../../app/components/shared/third_functional',
  () => () => <div className='third-functional' />
);

jest.mock(
  '../../../app/components/shared/second_functional_component',
  () => () => <div className='second-functional-component' />
);

jest.mock(
  '../../../app/components/shared/example_functional_component',
  () => () => <div className='example-functional-component' />
);

describe('basic stubbed component test', () => {
  beforeEach(() => {
    stubFunctionalComponent('components/shared/second_functional_component').and.returnValue(<div className='check' />);
  });

  it('asserts something', () => {
    expect(ThirdFunctional).toHaveBeenCalled();
  })
});
