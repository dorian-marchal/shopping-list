import _ from 'lodash';
import serializeError from 'serialize-error';

const MAXIMUM_DEEPNESS = 10;

/**
 * Recursively serializes a given object so it can be readable in redux devtools.
 * @param {Any} value Object to serialize.
 * @returns {Any} Serialized object.
 */
const serializeForDevtools = (value, _deepness = 0) => {
  // Prevent stack overflow.
  if (_deepness > MAXIMUM_DEEPNESS) {
    return '[Maximum deepness reached]';
  }
  if (_.isError(value)) {
    return serializeError(value);
  }
  if (_.isArray(value)) {
    return _.map(value, (element) => serializeForDevtools(element, _deepness + 1));
  }
  // Dates are already serialized by redux-devtools.
  if (_.isDate(value)) {
    return value;
  }
  if (_.isRegExp(value)) {
    return `RegExp(${value})`;
  }
  if (_.isObjectLike(value)) {
    return _.mapValues(_.toPlainObject(value), (prop) => serializeForDevtools(prop, _deepness + 1));
  }
  return value;
};

export default serializeForDevtools;
export { MAXIMUM_DEEPNESS };
