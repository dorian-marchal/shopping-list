import { _App as App } from '../App';
import React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';

describe('App', () => {
  it('renders without crashing', () => {
    const props = {
      fetchAvailableProducts: _.noop,
      fetchShoppingList: _.noop,
      addAvailableProductInProgress: false,
      products: [
        {
          id: 1,
          name: 'Poire',
          checked: false,
          waiting: false,
        },
        {
          id: 2,
          name: 'Pomme',
          checked: false,
          waiting: false,
        },
      ],
      itemInput: '',
      addToShoppingList: _.noop,
      removeFromShoppingList: _.noop,
      addAvailableProduct: _.noop,
      onInputChange: _.noop,
    };
    mount(<App {...props} />);
  });
});
