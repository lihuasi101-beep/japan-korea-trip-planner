const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const scripts = ['trip-data.js', 'trip-content.js', 'trip-store.js'];

function boot(seed = {}) {
  const values = new Map(Object.entries(seed));
  const context = {
    console,
    Date,
    Math,
    JSON,
    localStorage: {
      getItem: key => values.has(key) ? values.get(key) : null,
      setItem: (key, value) => values.set(key, value)
    }
  };
  context.window = context;
  vm.createContext(context);
  scripts.forEach(file => vm.runInContext(
    fs.readFileSync(path.join(root, 'assets', 'js', file), 'utf8'),
    context,
    { filename: file }
  ));
  return { context, values };
}

const fresh = boot();
const freshState = fresh.context.TripStore.load();
assert.strictEqual(freshState.itinerary.length, 23);
assert.ok(freshState.itinerary.every(item => item.id));
assert.strictEqual(fresh.context.TripContent.timeline.length, 11);
assert.strictEqual(fresh.context.TripContent.regions.length, 4);

const legacyItem = {
  date: '9/25', weekday: '\u5468\u4e94', city: '\u91dc\u5c71',
  title: '\u6211\u7684\u65e7\u884c\u7a0b', slot: '\u4e0a\u5348', note: '\u4fdd\u7559'
};
const migrated = boot({
  'jk-trip-plan-v5': JSON.stringify([legacyItem]),
  'jk-custom-terms-v1': JSON.stringify(['legacy-term'])
});
const migratedState = migrated.context.TripStore.load();
assert.strictEqual(migratedState.itinerary[0].title, legacyItem.title);
assert.deepStrictEqual([...migratedState.customTerms], ['legacy-term']);

migrated.context.TripStore.saveItinerary([{ ...migratedState.itinerary[0], title: 'updated-title' }]);
assert.match(migrated.values.get('jk-trip-planner-state-v1'), /updated-title/);
assert.match(migrated.values.get('jk-trip-plan-v5'), /updated-title/);

const reset = migrated.context.TripStore.resetItinerary();
assert.strictEqual(reset.itinerary.length, 23);
assert.strictEqual(reset.customTerms[0], 'legacy-term');

console.log('trip-store tests passed');
