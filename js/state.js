import { SAMPLE_BEERS } from './data.js';

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════

export const state = {
  beers: [],
  currentView: 'home',
  prevView: 'home',
  selectedBeer: null,
  editingId: null,
  searchQuery: '',
  selectedCategory: null,
  filterType: 'all',
  sortOrder: 'date_desc',
  formRating: 0,
  formCategory: 'lager',
};

const LS_KEY = 'beer-cellar-5050-v4';

export function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(state.beers));
}

export function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      state.beers = JSON.parse(raw);
      let id = Date.now();
      const existingKeys = new Set(state.beers.map(b => b.name + '|' + b.brewery));
      const missing = SAMPLE_BEERS.filter(b => !existingKeys.has(b.name + '|' + b.brewery));
      if (missing.length > 0) {
        const newEntries = missing.map(b => ({ ...b, id: id++, dateAdded: id }));
        state.beers = state.beers.concat(newEntries);
        save();
      }
    } else { seed(); }
  } catch { seed(); }
}

function seed() {
  let id = Date.now();
  state.beers = SAMPLE_BEERS.map(b => ({ ...b, id: id++, dateAdded: id }));
  save();
}
