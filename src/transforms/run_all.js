import importFactory from './import_factory';
import importArrayToModelStore from './import_array_to_model_store';
import convertAsyncTests from './convert_async_tests';
import jestify from './jestify';
import jasmineToJest from 'jest-codemods/dist/transformers/jasmine-globals';

module.exports = function(file, api, options) {
  const fixes = [
    jasmineToJest,
    importFactory,
    importArrayToModelStore,
    convertAsyncTests,
    jestify
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
