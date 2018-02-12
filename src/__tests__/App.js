import { _App as App } from '../App';
import React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';

describe('App', () => {
  it('renders without crashing', () => {
    const props = {
      fetchItems: _.noop,
      addItemInProgress: false,
      items: [
        {
          id: 1,
          name: 'Poire',
          removingInProgress: false,
        },
        {
          id: 2,
          name: 'Pomme',
          removingInProgress: false,
        },
      ],
      itemInput: '',
      removeItem: _.noop,
      onSubmitItem: _.noop,
      onInputChange: _.noop,
    };
    mount(<App {...props} />);
  });
});
