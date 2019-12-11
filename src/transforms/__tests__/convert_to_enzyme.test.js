import { defineTest } from 'jscodeshift/src/testUtils';

defineTest(__dirname, 'convert_to_enzyme', null, 'convert_to_enzyme_basic');

defineTest(__dirname, 'convert_to_enzyme', null, 'convert_to_enzyme_react_test_renderer');
