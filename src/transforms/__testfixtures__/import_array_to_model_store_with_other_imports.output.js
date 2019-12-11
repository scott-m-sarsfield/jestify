import something from 'somewhere';

import { arrayToModelStore } from '../../../frontend/app/helpers/data_helper';

beforeEach(() => {
  store = {
    recruiters: arrayToModelStore({ id: 1 }, { id: 2 })
  };
});
