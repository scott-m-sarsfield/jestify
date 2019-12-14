import React from 'react';
import noop from 'lodash/noop';
import LaraCroft from '../lara_croft';
import { propsPassedOnLastRender, stubFunctionalComponent } from '../../../../spec/app/support/react_helper';
import TombRaider from 'app/games/tomb_raider';

beforeEach(() => {
  spyOn(require('../../../games/tomb_raider'), 'tutorial');
});
