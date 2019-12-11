import { arrayToModelStore } from '../data_helper';
beforeEach(() => {
  store = {
    recruiters: arrayToModelStore({ id: 1 }, { id: 2 })
  };
});
