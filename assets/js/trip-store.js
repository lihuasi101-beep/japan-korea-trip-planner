(function (global) {
  const STATE_KEY = 'jk-trip-planner-state-v1';
  const LEGACY_ITINERARY_KEY = 'jk-trip-plan-v5';
  const LEGACY_TERMS_KEY = 'jk-custom-terms-v1';
  let memoryState = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function makeId(item, index) {
    const seed = [item.date, item.slot, item.title, index].join('-');
    return 'item-' + seed.replace(/[^0-9A-Za-z\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
  }

  function normalizeItinerary(items, fallback) {
    if (!Array.isArray(items)) return clone(fallback);
    return items.filter(Boolean).map((item, index) => ({
      id: item.id || makeId(item, index),
      date: String(item.date || ''),
      weekday: String(item.weekday || ''),
      city: String(item.city || ''),
      title: String(item.title || ''),
      slot: ['上午', '下午', '晚上'].includes(item.slot) ? item.slot : '上午',
      note: String(item.note || '')
    })).filter(item => item.date && item.title);
  }

  function normalizeTerms(terms) {
    return Array.isArray(terms)
      ? [...new Set(terms.map(term => String(term).trim()).filter(Boolean))]
      : [];
  }

  function persist(state) {
    const next = {
      schemaVersion: TripCatalog.schemaVersion,
      catalogVersion: TripCatalog.catalogVersion,
      itinerary: normalizeItinerary(state.itinerary, TripCatalog.itinerary),
      customTerms: normalizeTerms(state.customTerms),
      updatedAt: new Date().toISOString()
    };
    memoryState = clone(next);
    writeJson(STATE_KEY, next);
    // 过渡期双写旧键，保证回退到旧页面时仍能读到最新修改。
    writeJson(LEGACY_ITINERARY_KEY, next.itinerary);
    writeJson(LEGACY_TERMS_KEY, next.customTerms);
    return clone(next);
  }

  function load() {
    const unified = readJson(STATE_KEY, null);
    if (unified && unified.schemaVersion === TripCatalog.schemaVersion) {
      if (unified.catalogVersion !== TripCatalog.catalogVersion) {
        return persist({
          itinerary: TripCatalog.itinerary,
          customTerms: normalizeTerms(unified.customTerms)
        });
      }
      memoryState = {
        ...unified,
        itinerary: normalizeItinerary(unified.itinerary, TripCatalog.itinerary),
        customTerms: normalizeTerms(unified.customTerms)
      };
      return clone(memoryState);
    }
    return persist({
      itinerary: readJson(LEGACY_ITINERARY_KEY, TripCatalog.itinerary),
      customTerms: readJson(LEGACY_TERMS_KEY, [])
    });
  }

  function current() {
    return memoryState ? clone(memoryState) : load();
  }

  global.TripStore = Object.freeze({
    keys: Object.freeze({ state: STATE_KEY, legacyItinerary: LEGACY_ITINERARY_KEY, legacyTerms: LEGACY_TERMS_KEY }),
    load,
    getState: current,
    saveItinerary(itinerary) {
      const state = current();
      state.itinerary = itinerary;
      return persist(state);
    },
    saveCustomTerms(customTerms) {
      const state = current();
      state.customTerms = customTerms;
      return persist(state);
    },
    resetItinerary() {
      const state = current();
      state.itinerary = TripCatalog.itinerary;
      return persist(state);
    },
    createItem(fields) {
      return {
        id: 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
        date: '', weekday: '', city: '', title: '', slot: '上午', note: '', ...fields
      };
    },
    exportSnapshot() {
      const state = current();
      return { ...state, meta: clone(TripCatalog.meta) };
    }
  });
})(window);
