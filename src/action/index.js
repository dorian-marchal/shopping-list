import { createActions } from 'redux-actions';
import { toast } from 'react-toastify';

import _ from 'lodash';
import getFetchActionsCreator from '../lib/getFetchActionsCreator';

const serverBaseUrl = 'http://localhost:3001';

const createFetchActions = getFetchActionsCreator(serverBaseUrl);

const showError = (message) => toast(message, { type: 'error' });

const actions = _.mapKeys(
  {
    ...createActions({
      UPDATE_ITEM_INPUT: (input) => ({ input }),
    }),
    SUBMIT_ITEM: () => (dispatch, getState) => {
      const { itemInput, addItemInProgress } = getState();
      if (addItemInProgress || itemInput === '') {
        return;
      }

      dispatch(actions.addItem(itemInput));
    },
    ...createFetchActions({
      type: 'FETCH_ITEMS',
      path: '/items',
      createSuccessPayload: (requestBody, responseBody) => ({ items: responseBody }),
      onError: () => showError('Impossible de récupérer les produits.'),
    }),
    ...createFetchActions({
      type: 'ADD_ITEM',
      method: 'POST',
      path: '/items/add',
      createBody: (item) => ({ item }),
      createSuccessPayload: (requestBody, responseBody) => ({ item: responseBody }),
      onError: (dispatch, getState, responseBody, { item }) =>
        showError(`Le produit "${item}" n'a pas été ajouté.`),
    }),
    ...createFetchActions({
      type: 'REMOVE_ITEM',
      method: 'POST',
      path: '/items/remove',
      createBody: (id) => ({ id }),
      createPendingPayload: (requestBody) => ({ id: requestBody.id }),
      createSuccessPayload: (requestBody) => ({ id: requestBody.id }),
      createErrorPayload: (_, requestBody) => ({ id: requestBody.id }),
      onError: (dispatch, getState, responseBody, { id }) => {
        const { items } = getState();
        const item = items.find((item) => item.id === id);
        showError(`Le produit "${item.name}" n'a pas été supprimé.`);
      },
    }),
  },
  (action, key) => _.camelCase(key),
);

export default actions;
export { createFetchActions };
