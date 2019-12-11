import { defineTest } from 'jscodeshift/src/testUtils';

defineTest(
  __dirname,
  'import_array_to_model_store',
  null,
  'import_array_to_model_store'
);

defineTest(
  __dirname,
  'import_array_to_model_store',
  null,
  'import_array_to_model_store_with_other_imports'
);

defineTest(
  __dirname,
  'import_array_to_model_store',
  null,
  'import_array_to_model_store_not_used'
);

defineTest(
  __dirname,
  'import_array_to_model_store',
  null,
  'import_array_to_model_store_already_imported'
);
