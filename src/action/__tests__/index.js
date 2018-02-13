import actions from '..';

const { submitItem } = actions;

describe('actions', () => {
  describe('submitItem', () => {
    it('dispatches `addItem`', () => {
      const dispatch = jest.fn();
      const getState = () => ({ itemInput: 'New Item', addItemInProgress: false });
      const $addItemAction = Symbol();
      const deps = {
        actions: {
          addItem: jest.fn().mockReturnValueOnce($addItemAction),
        },
      };

      submitItem(deps)(dispatch, getState);

      expect(deps.actions.addItem).toBeCalledWith('New Item');
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith($addItemAction);
    });

    it('does nothing when input is empty', () => {
      const dispatch = jest.fn();
      const getState = () => ({ itemInput: '', addItemInProgress: false });

      submitItem()(dispatch, getState);

      expect(dispatch).not.toBeCalled();
    });

    it('does nothing when addItemInProgress is true', () => {
      const dispatch = jest.fn();
      const getState = () => ({ itemInput: 'New Item', addItemInProgress: true });

      submitItem()(dispatch, getState);

      expect(dispatch).not.toBeCalled();
    });
  });
});
