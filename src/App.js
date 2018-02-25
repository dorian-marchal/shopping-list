import './App.css';

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import actions from './action';
import { connect } from 'react-redux';

class App extends Component {
  static propTypes = {
    fetchAvailableProducts: PropTypes.func.isRequired,
    fetchShoppingList: PropTypes.func.isRequired,
    addAvailableProductInProgress: PropTypes.bool.isRequired,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        checked: PropTypes.bool.isRequired,
        waiting: PropTypes.bool.isRequired,
      }),
    ).isRequired,
    itemInput: PropTypes.string.isRequired,
    addToShoppingList: PropTypes.func.isRequired,
    removeFromShoppingList: PropTypes.func.isRequired,
    addAvailableProduct: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { fetchAvailableProducts, fetchShoppingList } = this.props;
    fetchAvailableProducts();
    fetchShoppingList();
  }

  componentDidUpdate(prevProps) {
    // Prevent losing focus when submitting an item.
    if (prevProps.addAvailableProductInProgress && !this.props.addAvailableProductInProgress) {
      this.input.focus();
    }
  }

  render() {
    const {
      products,
      itemInput,
      addAvailableProductInProgress,
      addToShoppingList,
      removeFromShoppingList,
      addAvailableProduct,
      onInputChange,
    } = this.props;
    return (
      <div className="App">
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (addAvailableProductInProgress || itemInput === '') {
              return;
            }
            addAvailableProduct(itemInput);
          }}
        >
          <input
            ref={(input) => {
              this.input = input;
            }}
            disabled={addAvailableProductInProgress}
            value={itemInput}
            type="text"
            onChange={(e) => onInputChange(e.target.value)}
          />
          <input disabled={addAvailableProductInProgress} type="submit" value="Add" />
        </form>
        {products.length === 0 ? "There's no item in the list, please add one. :)" : ''}
        <ul>
          {products.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                if (item.checked) {
                  removeFromShoppingList(item.id);
                } else {
                  addToShoppingList(item.id);
                }
              }}
            >
              {item.name}
              <input type="checkbox" checked={item.checked} disabled={item.waiting} />
            </li>
          ))}
        </ul>
        <ToastContainer type="error" hideProgressBar={true} />
      </div>
    );
  }
}

export default connect(
  (state) => ({
    addAvailableProductInProgress: state.addAvailableProductInProgress,
    availableProducts: state.availableProducts,
    products: state.availableProducts.map((product) => ({
      id: product.id,
      name: product.name,
      checked: state.shoppingList.includes(product.id),
      waiting: product.waiting,
    })),
    itemInput: state.itemInput,
  }),
  {
    onInputChange: actions.updateItemInput,
    addAvailableProduct: actions.addAvailableProduct,
    addToShoppingList: actions.addToShoppingList,
    removeFromShoppingList: actions.removeFromShoppingList,
    fetchAvailableProducts: actions.fetchAvailableProducts,
    fetchShoppingList: actions.fetchShoppingList,
  },
)(App);

export { App as _App };
