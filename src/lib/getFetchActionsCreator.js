import _ from 'lodash';
import appLogger from '../logger';
import { createAction } from 'redux-actions';

/**
 * Return a new `createFetchActions` function, based on the given server base URL.
 * See the documentation of returned function for more information.
 *
 * @param {String} serverBaseUrl Server base URL with protocol, without ending slash.
 */
const getFetchActionsCreator = (serverBaseUrl, logger = appLogger) =>
  /**
   * Returns a `${type}` function that return a thunk actions used to make an
   * HTTP request.
   * This thunk action can dispatch the three following actions:
   *
   * - `${type}_PENDING`: Dispatched just before the HTTP request is made.
   *   Its payload is created with `createPendingPayload`.
   *
   * - `${type}_SUCCESS`: Dispatched just after the HTTP response is received.
   *   This action is not dispatched if an error occur.
   *   Its payload is created with `createSuccessPayload`.
   *
   * - `${type}_ERROR`: Dispatched if an error occur.
   *   Its payload is created with `createErrorPayload`.
   *
   * The corresponding action creators are returned so they can be used in a
   * reducer (via their `toString` method) but these actions are not meant
   * to be dispatched manually.
   *
   * If needed, other actions can be dispatched. See `onPending`, `onSuccess`
   * and `onError` parameters.
   *
   * @param {Object} options
   * @param {String} options.type Action type.
   * @param {String} options.method HTTP method (default: 'GET').
   * @param {String} options.path API endpoint path, with leading slash.
   * @param {Function} options.createBody
   *                   Function that create the request body from fetch
   *                   action params. (default: _.noop).
   * @param {Function} options.createPendingPayload
   *                   Payload creator of the pending action.
   *                   Called with `requestBody`. (default: _.noop).
   * @param {Function} options.createSuccessPayload
   *                   Payload creator of the success action.
   *                   Called with `responseBody` and `requestBody`.
   *                   (default: _.noop).
   * @param {Function} options.createErrorPayload
   *                   Payload creator of the error action.
   *                   Called with `requestBody`.
   *                   (default: _.noop).
   * @param {Function} options.onPending
   *                   Can be used to dispatch additional actions on pending state.
   *                   Called with `dispatch`, `getState` and `requestBody`.
   *                   (default: _.noop).
   * @param {Function} options.onSuccess
   *                   Can be used to dispatch additional actions on success state.
   *                   Called with `dispatch`, `getState`, `requestBody` and `responseBody.
   *                   (default: _.noop).
   * @param {Function} options.onError
   *                   Can be used to dispatch additional actions on error state.
   *                   Called with `dispatch`, `getState` and `requestBody`.
   *                   (default: _.noop).
   * @returns {Object} Fetch action creators:
   *                   `${type}`, `${type}_PENDING`, `${type}_SUCCESS` and `${type}_ERROR`.
   */
  function createFetchActions({
    type,
    method = 'GET',
    path,
    createBody = _.noop,
    createPendingPayload = _.noop,
    createSuccessPayload = _.noop,
    createErrorPayload = _.noop,
    onPending = _.noop,
    onSuccess = _.noop,
    onError = _.noop,
  }) {
    const lastArg = (...args) => _.last(args);
    const pending = createAction(`${type}_PENDING`, createPendingPayload, lastArg);
    const success = createAction(`${type}_SUCCESS`, createSuccessPayload, lastArg);
    const error = createAction(`${type}_ERROR`, createErrorPayload, lastArg);
    return {
      // Action creators are returned to be used in reducers via their `toString` method.
      [pending]: pending,
      [success]: success,
      [error]: error,
      [type]: (...args) =>
        async function(dispatch, getState) {
          const requestBody = createBody(...args);
          const requestUrl = `${serverBaseUrl}${path}`;
          const requestOptions = {
            method,
            body: requestBody ? JSON.stringify(requestBody) : undefined,
            headers: { 'Content-Type': 'application/json' },
          };
          const request = { url: requestUrl, ...requestOptions };

          dispatch(pending(requestBody, { request }));
          if (onPending) {
            onPending(dispatch, getState, requestBody);
          }

          let responseBody;
          let response;
          try {
            response = await fetch(requestUrl, requestOptions);

            // Only support JSON responses, for now.
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.match(/application\/json/)) {
              responseBody = await response.json();
            }

            if (response.status >= 300) {
              throw new Error(
                `Request error: "${response.statusText}", status code: ${response.status}`,
              );
            }
          } catch (err) {
            dispatch(error(requestBody, { request, response, err }));
            if (onError) {
              onError(dispatch, getState, requestBody);
            }
            logger.error({ err });
            return;
          }

          dispatch(success(requestBody, responseBody, { request, response }));
          if (onSuccess) {
            onSuccess(dispatch, getState, requestBody, responseBody);
          }
        },
    };
  };

export default getFetchActionsCreator;
