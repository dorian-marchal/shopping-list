import _ from 'lodash';
import fetchMock from 'fetch-mock';
import getFetchActionsCreator from '../getFetchActionsCreator';
import match from '../fetchMockMatcher';

describe('getFetchActionsCreator', () => {
  const createFetchActions = getFetchActionsCreator('http://example.com', { error: _.noop });

  const createBody = jest.fn(() => ({ dummy: 'body' }));
  const createPendingPayload = jest.fn();
  const createSuccessPayload = jest.fn();
  const createErrorPayload = jest.fn();
  const onPending = jest.fn();
  const onSuccess = jest.fn();
  const onError = jest.fn();

  afterEach(() => {
    createBody.mockClear();
    createPendingPayload.mockClear();
    createSuccessPayload.mockClear();
    createErrorPayload.mockClear();
    onPending.mockClear();
    onSuccess.mockClear();
    onError.mockClear();
  });

  it('returns `createFetchActions` function', () => {
    expect(_.isFunction(createFetchActions)).toBe(true);
  });

  describe('createFetchActions', () => {
    const actionCreators = createFetchActions({
      createBody,
      type: 'FOO',
      path: '/foo/bar',
      createPendingPayload,
      createSuccessPayload,
      createErrorPayload,
      onPending,
      onSuccess,
      onError,
    });

    describe('FSA creators', () => {
      createSuccessPayload.mockImplementationOnce(() => 'FOO_SUCCESS_PAYLOAD');
      createErrorPayload.mockImplementationOnce(() => 'FOO_ERROR_PAYLOAD');
      createPendingPayload.mockImplementationOnce(() => 'FOO_PENDING_PAYLOAD');

      const expectedActionTypes = ['FOO_PENDING', 'FOO_SUCCESS', 'FOO_ERROR'];
      expectedActionTypes.forEach((actionType) => {
        describe(actionType, () => {
          it('creates expected action', () => {
            const createAction = actionCreators[actionType];
            expect(createAction.toString()).toBe(actionType);
            expect(_.isFunction(createAction)).toBe(true);
            expect(createAction()).toEqual({ type: actionType, payload: `${actionType}_PAYLOAD` });
          });
        });
      });
    });

    describe('Fetch thunk creator', () => {
      const { FOO } = actionCreators;
      it('is a function', () => expect(_.isFunction(FOO)).toBe(true));

      describe('Fetch thunk', () => {
        const actionParams = ['baz', 'quux'];
        const fetchThunk = FOO(...actionParams);

        describe('GET request', () => {
          beforeEach(() => {
            fetchMock.once(
              match('GET', 'http://example.com/foo/bar', {
                body: { dummy: 'body' },
                headers: { 'Content-Type': 'application/json' },
              }),
              { dummy: 'response' },
            );
          });
          afterEach(fetchMock.restore);

          it('fetches with GET method', async () => {
            await fetchThunk(_.noop, _.noop);

            expect(fetchMock.done()).toBe(true);
          });
        });

        describe('POST request', () => {
          beforeEach(() => {
            fetchMock.once(
              match('POST', 'http://example.com/foo/bar/update'),
              {
                body: { dummy: 'body' },
                headers: { 'Content-Type': 'application/json' },
              },
              {
                dummy: 'response',
              },
            );
          });
          afterEach(fetchMock.restore);

          it('fetches with POST method', async () => {
            const createdActions = createFetchActions({
              type: 'FOO',
              method: 'POST',
              path: '/foo/bar/update',
            });
            await createdActions.FOO()(_.noop, _.noop);

            expect(fetchMock.done()).toBe(true);
          });
        });

        describe('Request success', () => {
          beforeEach(() => {
            fetchMock.once(match('GET', 'http://example.com/foo/bar'), { dummy: 'response' });
          });
          afterEach(fetchMock.restore);

          it('dispatches pending and success actions', async () => {
            const dispatch = jest.fn();
            const getState = jest.fn();
            createPendingPayload.mockImplementationOnce((...args) => _.initial(args));
            createSuccessPayload.mockImplementationOnce((...args) => _.initial(args));

            await fetchThunk(dispatch, getState);

            // createBody.
            expect(createBody).toHaveBeenCalledTimes(1);
            expect(createBody.mock.calls[0]).toEqual(actionParams);

            // Dispatches.
            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(dispatch.mock.calls[0][0]).toMatchObject({
              type: 'FOO_PENDING',
              payload: [{ dummy: 'body' }],
            });
            expect(dispatch.mock.calls[1][0]).toMatchObject({
              type: 'FOO_SUCCESS',
              payload: [{ dummy: 'body' }, { dummy: 'response' }],
            });

            // Hooks.
            expect(onPending).toHaveBeenCalledTimes(1);
            expect(onPending.mock.calls[0]).toEqual([dispatch, getState, { dummy: 'body' }]);

            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onSuccess.mock.calls[0]).toEqual([
              dispatch,
              getState,
              { dummy: 'body' },
              { dummy: 'response' },
            ]);

            expect(onError).not.toHaveBeenCalled();
          });
        });

        describe('Request error', () => {
          beforeEach(() => {
            fetchMock.once(match('GET', 'http://example.com/foo/bar'), 404);
          });
          afterEach(fetchMock.restore);

          it('dispatches pending and error actions', async () => {
            const dispatch = jest.fn();
            const getState = jest.fn();
            createPendingPayload.mockImplementationOnce((...args) => _.initial(args));
            createErrorPayload.mockImplementationOnce((...args) => _.initial(args));

            await fetchThunk(dispatch, getState);

            // createBody.
            expect(createBody).toHaveBeenCalledTimes(1);
            expect(createBody.mock.calls[0]).toEqual(actionParams);

            // Dispatches.
            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(dispatch.mock.calls[0][0]).toMatchObject({
              type: 'FOO_PENDING',
              payload: [{ dummy: 'body' }],
            });
            expect(dispatch.mock.calls[1][0]).toMatchObject({
              type: 'FOO_ERROR',
              payload: [{ dummy: 'body' }],
              meta: { err: new Error('Request error: "Not Found", status code: 404') },
            });

            // Hooks.
            expect(onPending).toHaveBeenCalledTimes(1);
            expect(onPending.mock.calls[0]).toEqual([dispatch, getState, { dummy: 'body' }]);

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError.mock.calls[0]).toEqual([dispatch, getState, { dummy: 'body' }]);

            expect(onSuccess).not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
