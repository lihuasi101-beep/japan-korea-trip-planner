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

  function normalizeConfirmations(confirmations) {
    const allowed = new Set(['todo', 'waiting', 'done', 'review', 'skip']);
    if (!confirmations || typeof confirmations !== 'object' || Array.isArray(confirmations)) return {};
    return Object.fromEntries(Object.entries(confirmations)
      .filter(([id, status]) => id && allowed.has(status))
      .map(([id, status]) => [String(id), status]));
  }

  function normalizePersonalNotes(notes) {
    const categories = new Set(['通信', '换汇', '交通卡', '行李', '证件', '购物', '其他']);
    if (!Array.isArray(notes)) return [];
    return notes.filter(Boolean).map((note, index) => ({
      id: String(note.id || `note-${Date.now().toString(36)}-${index}`),
      category: categories.has(note.category) ? note.category : '其他',
      title: String(note.title || '').trim(),
      detail: String(note.detail || '').trim(),
      done: Boolean(note.done),
      createdAt: String(note.createdAt || new Date().toISOString()),
      updatedAt: String(note.updatedAt || note.createdAt || new Date().toISOString())
    })).filter(note => note.title);
  }

  function persist(state) {
    const next = {
      schemaVersion: TripCatalog.schemaVersion,
      catalogVersion: TripCatalog.catalogVersion,
      itinerary: normalizeItinerary(state.itinerary, TripCatalog.itinerary),
      customTerms: normalizeTerms(state.customTerms),
      confirmations: normalizeConfirmations(state.confirmations),
      personalNotes: normalizePersonalNotes(state.personalNotes),
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
          customTerms: normalizeTerms(unified.customTerms),
          confirmations: normalizeConfirmations(unified.confirmations),
          personalNotes: normalizePersonalNotes(unified.personalNotes)
        });
      }
      memoryState = {
        ...unified,
        itinerary: normalizeItinerary(unified.itinerary, TripCatalog.itinerary),
        customTerms: normalizeTerms(unified.customTerms),
        confirmations: normalizeConfirmations(unified.confirmations),
        personalNotes: normalizePersonalNotes(unified.personalNotes)
      };
      return clone(memoryState);
    }
    return persist({
      itinerary: readJson(LEGACY_ITINERARY_KEY, TripCatalog.itinerary),
      customTerms: readJson(LEGACY_TERMS_KEY, []),
      confirmations: {},
      personalNotes: []
    });
  }

  function current() {
    return memoryState ? clone(memoryState) : load();
  }

  global.TripStore = Object.freeze({
    keys: Object.freeze({ state: STATE_KEY, legacyItinerary: LEGACY_ITINERARY_KEY, legacyTerms: LEGACY_TERMS_KEY }),
    load,
    getState: current,
    loadPlan(planId, fallback) {
      const key = STATE_KEY + '-plan-' + String(planId || 'A').toUpperCase();
      const saved = readJson(key, null);
      if (!saved && String(planId || 'A').toUpperCase() === 'A') {
        const legacy = readJson(STATE_KEY, null);
        if (legacy?.itinerary) return normalizeItinerary(legacy.itinerary, fallback || TripCatalog.itinerary);
      }
      const result = normalizeItinerary(saved, fallback || TripCatalog.itinerary);
      if (String(planId || '').toUpperCase() === 'B') {
        const morning = result.find(item => item.id === 'day-05-am');
        const afternoon = result.find(item => item.id === 'day-05-pm');
        if (morning) {
          morning.city = '对马岛';
          morning.title = '对马岛南部收尾、前往严原港';
          morning.slot = '上午';
          morning.note = '退房、跨岛交通与行李衔接；预留上船时间';
        }
        if (afternoon) {
          afternoon.city = '福冈';
          afternoon.title = '严原 → 博多港 → 福冈酒店';
          afternoon.slot = '下午';
          afternoon.note = '对马岛→福冈客轮转场；抵达后入住休息';
        }
        if (!result.some(item => item.id === 'day-06-pm-kushida')) {
          result.push({
            id: 'day-06-pm-kushida',
            date: '9/30',
            weekday: '周三',
            city: '福冈',
            title: '栉田神社',
            slot: '下午',
            note: '可选安排；视太宰府返程时间和体力决定'
          });
        }
      }
      return result;
    },
    savePlan(planId, itinerary) {
      const key = STATE_KEY + '-plan-' + String(planId || 'A').toUpperCase();
      const normalized = normalizeItinerary(itinerary, TripCatalog.itinerary);
      writeJson(key, normalized);
      return normalized;
    },
    saveItinerary(itinerary) {
      const active = localStorage.getItem('jk-trip-active-plan');
      if (active) return { ...current(), itinerary: this.savePlan(active, itinerary) };
      const state = current();
      state.itinerary = itinerary;
      return persist(state);
    },
    saveCustomTerms(customTerms) {
      const state = current();
      state.customTerms = customTerms;
      return persist(state);
    },
    saveConfirmation(id, status) {
      const state = current();
      state.confirmations = normalizeConfirmations({ ...state.confirmations, [id]: status });
      return persist(state);
    },
    savePersonalNotes(personalNotes) {
      const state = current();
      state.personalNotes = personalNotes;
      return persist(state);
    },
    createPersonalNote(fields) {
      return {
        id: 'note-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
        category: '其他', title: '', detail: '', done: false,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...fields
      };
    },
    resetItinerary() {
      const active = localStorage.getItem('jk-trip-active-plan');
      if (active) return { ...current(), itinerary: this.savePlan(active, TripCatalog.plans?.[active] || TripCatalog.itinerary) };
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
