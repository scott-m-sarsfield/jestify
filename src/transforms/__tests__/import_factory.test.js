import { defineTest } from 'jscodeshift/src/testUtils';

defineTest(__dirname, 'import_factory', null, 'import_factory');

defineTest(__dirname, 'import_factory', null, 'import_factory_not_used');

defineTest(__dirname, 'import_factory', null, 'import_factory_already_imported');
