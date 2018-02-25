import _ from 'lodash';
import actions from '../action';
import { handleActions } from 'redux-actions';

const defaultState = {
  availableProducts: [],
  itemInput: '',
  fetchShoppingListInProgress: false,
  fetchAvailableProductsInProgress: false,
  addAvailableProductInProgress: false,
  shoppingList: [],
};

const reducer = handleActions(
  {
    [actions.fetchAvailableProductsPending]: (state) => ({
      ...state,
      fetchAvailableProductsInProgress: true,
    }),
    [actions.fetchAvailableProductsSuccess]: (state, { payload }) => ({
      ...state,
      fetchAvailableProductsInProgress: false,
      availableProducts: payload.items,
    }),
    [actions.fetchAvailableProductsError]: (state) => ({
      ...state,
      fetchAvailableProductsInProgress: false,
    }),

    [actions.addAvailableProductPending]: (state) => ({
      ...state,
      addAvailableProductInProgress: true,
    }),
    [actions.addAvailableProductSuccess]: (state, { payload }) => ({
      ...state,
      itemInput: '',
      addAvailableProductInProgress: false,
      availableProducts: [...state.availableProducts, payload.item],
    }),
    [actions.addAvailableProductError]: (state) => ({
      ...state,
      addAvailableProductInProgress: false,
    }),

    [actions.fetchShoppingListPending]: (state) => ({
      ...state,
      fetchShoppingListInProgress: true,
    }),
    [actions.fetchShoppingListSuccess]: (state, { payload }) => ({
      ...state,
      fetchShoppingListInProgress: false,
      shoppingList: payload.items,
    }),
    [actions.fetchShoppingListError]: (state) => ({
      ...state,
      fetchShoppingListInProgress: false,
    }),

    [actions.addToShoppingListPending]: (state, { payload }) => ({
      ...state,
      availableProducts: state.availableProducts.map(
        (item) => (item.id === payload.id ? { ...item, waiting: true } : item),
      ),
    }),
    [actions.addToShoppingListSuccess]: (state, { payload }) => ({
      ...state,
      shoppingList: payload.shoppingList,
      availableProducts: state.availableProducts.map(
        (item) => (item.id === payload.id ? { ...item, waiting: false } : item),
      ),
    }),
    [actions.addToShoppingListError]: (state, { payload }) => ({
      ...state,
      availableProducts: state.availableProducts.map(
        (item) => (item.id === payload.id ? { ...item, waiting: false } : item),
      ),
    }),

    [actions.removeFromShoppingListPending]: (state, { payload }) => ({
      ...state,
      availableProducts: state.availableProducts.map(
        (item) => (item.id === payload.id ? { ...item, waiting: true } : item),
      ),
    }),
    [actions.removeFromShoppingListSuccess]: (state, { payload }) => ({
      ...state,
      shoppingList: payload.shoppingList,
      availableProducts: state.availableProducts.map(
        (item) => (item.id === payload.id ? { ...item, waiting: false } : item),
      ),
    }),
    [actions.removeFromShoppingListError]: (state, { payload }) => ({
      ...state,
      availableProducts: state.availableProducts.map(
        (item) => (item.id === payload.id ? { ...item, waiting: false } : item),
      ),
    }),

    [actions.updateItemInput]: (state, { payload }) => ({
      ...state,
      itemInput: payload.input,
    }),
  },
  defaultState,
);

export default reducer;
