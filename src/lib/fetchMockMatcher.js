import _ from 'lodash';

/**
 * Custom matcher for `fetchMock` that only matches request with corresponding options.
 * Default `fetchMock` matcher only checks the request URL
 * @see issue https://github.com/wheresrhys/fetch-mock/issues/262
 *
 * @param {String} expectedMethod HTTP method.
 * @param {String} expectedUrl Url.
 * @param {Object} expectingOptions Optionnal additional options to check (body, headers, etc.).
 */
const fetchMockMatcher = (
  expectedMethod,
  expectedUrl,
  { body: expectedBody, ...expectedOptions } = {},
) => (url, options) => {
  const methodIsMatching = expectedMethod === options.method;
  const urlIsMatching = expectedUrl === url;
  const bodyIsMatching = _.isNil(expectedBody)
    ? true
    : _.isObject(expectedBody)
      ? _.isEqual(JSON.parse(options.body), expectedBody)
      : expectedBody === options.body;
  const optionsAreMatching = _.isNil(expectedOptions) || _.isMatch(options, expectedOptions);
  return methodIsMatching && urlIsMatching && bodyIsMatching && optionsAreMatching;
};

export default fetchMockMatcher;
