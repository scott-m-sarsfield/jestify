import { defineTest } from 'jscodeshift/src/testUtils';

defineTest(__dirname, 'convert_async_tests', null, 'convert_async_tests_spy_on_async');
defineTest(__dirname, 'convert_async_tests', null, 'convert_async_tests_replace_deferred_resolve');
defineTest(__dirname, 'convert_async_tests', null, 'convert_async_tests_remove_mock_promises');
