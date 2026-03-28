import { state } from './state.js';

// ═══════════════════════════════════════════════════════════
// FILTER + SORT pipeline
// ═══════════════════════════════════════════════════════════

export function getFilteredBeers() {
  let beers = [...state.beers];
  const q = state.searchQuery.trim().toLowerCase();
  if (q) beers = beers.filter(b =>
    b.name.toLowerCase().includes(q) ||
    (b.brewery||'').toLowerCase().includes(q) ||
    (b.origin||'').toLowerCase().includes(q));
  if (state.selectedCategory)
    beers = beers.filter(b => b.category === state.selectedCategory);
  if (state.filterType === 'tried')     beers = beers.filter(b => b.tried);
  if (state.filterType === 'favorites') beers = beers.filter(b => b.favorite);

  switch (state.sortOrder) {
    case 'date_desc':   beers.sort((a,b) => b.dateAdded - a.dateAdded); break;
    case 'rating_desc': beers.sort((a,b) => b.rating - a.rating);        break;
    case 'name_asc':    beers.sort((a,b) => a.name.localeCompare(b.name)); break;
    case 'brewery_asc': beers.sort((a,b) => (a.brewery||'').localeCompare(b.brewery||'')); break;
  }
  return beers;
}
