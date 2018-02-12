import serializeForDevtools, { MAXIMUM_DEEPNESS } from '../serializeForDevtools';

describe('serializeForDevtools', () => {
  it('serializes various types', () => {
    const o = {
      type: 'FOO_BAR',
      regex: /foo/,
      err: new Error('wow'),
      array: [12, null, undefined],
      function: (key, value) => value,
      date: new Date('2018-02-11T16:24:03.666Z'),
      symbol: Symbol('bar'),
      payload: { deep: {} },
    };
    o.payload.deep.circular = o;

    expect(serializeForDevtools(o, MAXIMUM_DEEPNESS - 2)).toMatchObject({
      type: 'FOO_BAR',
      regex: 'RegExp(/foo/)',
      err: { message: 'wow', name: 'Error' },
      array: [12, null, undefined],
      payload: {
        deep: {
          circular: '[Maximum deepness reached]',
        },
      },
      function: o.function,
      date: o.date,
      symbol: o.symbol,
    });
  });
});
