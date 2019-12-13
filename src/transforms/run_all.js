import importFactory from './import_factory';
import importArrayToModelStore from './import_array_to_model_store';
import convertAsyncTests from './convert_async_tests';
import convertToEnzyme from './convert_to_enzyme';
import replaceComponentStubs from './replace_component_stubs';
import jasmineToJest from 'jest-codemods/dist/transformers/jasmine-globals';
import convertDispatcherTests from './convert_dispatcher_tests';
import kitchenSink from './kitchen_sink';

module.exports = function(file, api, options) {
  const fixes = [
    jasmineToJest,
    importFactory,
    importArrayToModelStore,
    convertAsyncTests,
    convertDispatcherTests,
    replaceComponentStubs,
    convertToEnzyme,
    kitchenSink
  ];
  let src = file.source;
  fixes.forEach((fix) => {
    if (typeof src === 'undefined') {
      return;
    }
    const nextSrc = fix({ ...file, source: src }, api, options);

    if (nextSrc) {
      src = nextSrc;
    }
  });
  return src;
};
