import React from 'react';
import noop from 'lodash/noop';
import LaraCroft from '../../../../../frontend/app/components/characters/lara_croft';
import { propsPassedOnLastRender, stubFunctionalComponent } from '../../support/react_helper';
import TombRaider from 'app/games/tomb_raider';

beforeEach(() => {
  spyOn(require('../../../../../frontend/app/games/tomb_raider'), 'tutorial');
});
