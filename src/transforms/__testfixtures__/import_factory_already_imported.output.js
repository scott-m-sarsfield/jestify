import { Factory } from '../../jest_import_helper';
beforeEach(() => {
  store = {
    currentUser: Factory.build('recruiter')
  };
});
