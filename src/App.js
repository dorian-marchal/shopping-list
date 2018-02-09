import './App.css';

import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import { connect } from 'react-redux';

import actions from './action';

class App extends Component {
  componentDidMount() {
    const { fetchItems } = this.props;
    fetchItems();
  }

  componentDidUpdate(prevProps) {
    // Prevent losing focus when submitting an item.
    if (prevProps.addItemInProgress && !this.props.addItemInProgress) {
      this.input.focus();
    }
  }

  render() {
    const {
      items,
      itemInput,
      addItemInProgress,
      removeItem,
      onSubmitItem,
      onInputChange,
    } = this.props;
    return (
      <div className="App">
        {items.length === 0 ? "There's no item in the list, please add one. :)" : ''}
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name}
              <button disabled={item.removingInProgress} onClick={() => removeItem(item.id)}>
                X
              </button>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitItem();
          }}
        >
          <input
            ref={(input) => {
              this.input = input;
            }}
            disabled={addItemInProgress}
            value={itemInput}
            type="text"
            onChange={(e) => onInputChange(e.target.value)}
          />
          <input disabled={addItemInProgress} type="submit" value="Add" />
        </form>
        <ToastContainer type="error" hideProgressBar={true} />
      </div>
    );
  }
}

export default connect((state) => state, {
  onInputChange: actions.updateItemInput,
  onSubmitItem: actions.submitItem,
  removeItem: actions.removeItem,
  fetchItems: actions.fetchItems,
})(App);
