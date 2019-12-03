import { arrayToModelStore } from '../../../app/helpers/data_helper';
beforeEach(() => {
  store = {
    recruiters: arrayToModelStore({ id: 1 }, { id: 2 })
  };
});
