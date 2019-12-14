import { defineTest } from 'jscodeshift/src/testUtils';

defineTest(__dirname, 'move_to__tests__', {
  from: '/Users/gz727cg/myproj/frontend/spec/app/components/characters/lara_croft_spec.js',
  to: '/Users/gz727cg/myproj/frontend/app/components/characters/__tests__/lara_croft.test.js'
}, 'move_to__tests__');
