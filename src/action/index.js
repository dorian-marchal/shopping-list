import _ from 'lodash';
import { createActions } from 'redux-actions';
import getFetchActionsCreator from '../lib/getFetchActionsCreator';
import { toast } from 'react-toastify';

const serverBaseUrl = 'http://localhost:3001';

const createFetchActions = getFetchActionsCreator(serverBaseUrl);

const showError = (message) => toast(message, { type: 'error' });

const actions = _.mapKeys(
  {
    ...createActions({
      UPDATE_ITEM_INPUT: (input) => ({ input }),
    }),
    ...createFetchActions({
      type: 'FETCH_AVAILABLE_PRODUCTS',
      path: '/availableProducts',
      createSuccessPayload: (requestBody, responseBody) => ({ items: responseBody }),
      onError: () => showError('Impossible de récupérer les produits disponibles.'),
    }),
    ...createFetchActions({
      type: 'ADD_AVAILABLE_PRODUCT',
      method: 'POST',
      path: '/availableProducts/add',
      createBody: (productName) => ({ productName }),
      createSuccessPayload: (requestBody, responseBody) => ({ item: responseBody }),
      onError: (dispatch, getState, { productName }) =>
        showError(`Le produit "${productName}" n'a pas été ajouté.`),
    }),
    ...createFetchActions({
      type: 'FETCH_SHOPPING_LIST',
      path: '/shoppingList',
      createSuccessPayload: (requestBody, responseBody) => ({ items: responseBody }),
      onError: () => showError('Impossible de récupérer la liste de produits.'),
    }),
    ...createFetchActions({
      type: 'ADD_TO_SHOPPING_LIST',
      method: 'POST',
      path: '/shoppingList/add',
      createBody: (id) => ({ id }),
      createPendingPayload: (requestBody) => ({ id: requestBody.id }),
      createSuccessPayload: (requestBody, responseBody) => ({
        id: requestBody.id,
        shoppingList: responseBody,
      }),
      createErrorPayload: (requestBody) => ({ id: requestBody.id }),
      onError: () => showError("Le produit n'a pas été ajouté à la liste."),
    }),
    ...createFetchActions({
      type: 'REMOVE_FROM_SHOPPING_LIST',
      method: 'POST',
      path: '/shoppingList/remove',
      createBody: (id) => ({ id }),
      createPendingPayload: (requestBody) => ({ id: requestBody.id }),
      createSuccessPayload: (requestBody, responseBody) => ({
        id: requestBody.id,
        shoppingList: responseBody,
      }),
      createErrorPayload: (requestBody) => ({ id: requestBody.id }),
      onError: (dispatch, getState, { id }) => {
        const { availableProducts } = getState();
        const product = availableProducts.find((product) => product.id === id);
        showError(`Le produit "${product.name}" n'a pas été supprimé.`);
      },
    }),
  },
  (action, key) => _.camelCase(key),
);

export default actions;
export { createFetchActions };
