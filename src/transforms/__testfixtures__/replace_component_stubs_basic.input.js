describe('basic stubbed component test', () => {
  let stubbedComponent;
  beforeEach(() => {
    spyOnRender(SampleComponent);

    spyOnRender(AnotherComponent).and.callThrough();

    stubFunctionalComponent('components/shared/example_functional_component');

    stubFunctionalComponent('components/shared/second_functional_component').and.returnValue(<div className='check' />);

    stubbedComponent = stubFunctionalComponent('components/shared/third_functional');
  });

  it('asserts something', () => {
    expect(stubbedComponent).toHaveBeenCalled();
  })
});
