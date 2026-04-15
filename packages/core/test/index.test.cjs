const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildUrl,
  parseUrl,
  getQueryParamFromUrl,
  getAllQueryParamsFromUrl,
  onEvent,
  offEvent,
  onceEvent,
  emitEvent,
  formatMoney,
  isIdCard,
} = require('../dist/index.cjs.js');

test('parseUrl supports absolute and relative URLs', () => {
  assert.deepEqual(parseUrl('/demo?name=test&age=18'), {
    protocol: 'http:',
    host: 'localhost',
    port: '',
    pathname: '/demo',
    search: '?name=test&age=18',
    hash: '',
    query: {
      name: 'test',
      age: '18',
    },
  });

  const absolute = parseUrl('https://example.com/path?foo=bar#hash');
  assert.equal(absolute.protocol, 'https:');
  assert.equal(absolute.host, 'example.com');
  assert.equal(absolute.pathname, '/path');
  assert.equal(absolute.hash, '#hash');
  assert.deepEqual(absolute.query, { foo: 'bar' });
});

test('buildUrl and query extractors keep URL helpers platform-neutral', () => {
  assert.equal(buildUrl('https://example.com/api', { page: 1, ok: true }), 'https://example.com/api?page=1&ok=true');
  assert.equal(getQueryParamFromUrl('https://example.com?a=1&b=2', 'b'), '2');
  assert.deepEqual(getAllQueryParamsFromUrl('https://example.com?a=1&b=2'), {
    a: '1',
    b: '2',
  });
});

test('custom event bus supports emit, off and once semantics', async () => {
  const eventName = `unit:test:${Date.now()}`;
  const payloads = [];
  const handler = (payload) => {
    payloads.push(payload);
  };

  onEvent(eventName, handler);
  emitEvent(eventName, { step: 1 });
  offEvent(eventName, handler);
  emitEvent(eventName, { step: 2 });

  let onceCount = 0;
  onceEvent(eventName, () => {
    onceCount += 1;
  });
  emitEvent(eventName, { step: 3 });
  emitEvent(eventName, { step: 4 });

  await Promise.resolve();

  assert.deepEqual(payloads, [{ step: 1 }]);
  assert.equal(onceCount, 1);
});

test('existing pure helpers still behave as expected', () => {
  assert.equal(formatMoney(1234.5), '1,234.50');
  assert.equal(isIdCard('110101199001011234'), false);
  assert.equal(isIdCard('11010519491231002X'), true);
});
