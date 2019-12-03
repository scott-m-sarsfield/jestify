import importFactory from './import_factory';
import jestify from './jestify';

module.exports = function(file, api, options) {
  const fixes = [
    importFactory,
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
