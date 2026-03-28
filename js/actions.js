import { state, save } from './state.js';
import { svgIcon, snackbar, uid } from './helpers.js';
import { navigate } from './app.js';
import { renderBeerList } from './views/home.js';

// ═══════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════

export function toggleFav(id) {
  const b = state.beers.find(x => x.id === id);
  if (!b) return;
  b.favorite = !b.favorite;
  save();
  snackbar(b.favorite ? 'Aggiunta ai preferiti' : 'Rimossa dai preferiti');
  if (state.currentView === 'home') renderBeerList();
  if (state.currentView === 'detail') {
    const btn = document.getElementById('detail-fav');
    btn.innerHTML = b.favorite ? svgIcon('heart-full') : svgIcon('heart-empty');
    btn.classList.toggle('is-fav', b.favorite);
  }
}

export function saveBeer() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) return;

  const isEdit   = !!state.editingId;
  const existing = isEdit ? state.beers.find(b => b.id === state.editingId) : null;

  const beer = {
    id:          existing?.id        || uid(),
    dateAdded:   existing?.dateAdded || Date.now(),
    name,
    brewery:     document.getElementById('f-brewery').value.trim(),
    category:    state.formCategory,
    rating:      state.formRating,
    abv:         parseFloat(document.getElementById('f-abv').value) || 0,
    ibu:         parseInt(document.getElementById('f-ibu').value)   || 0,
    origin:      document.getElementById('f-origin').value.trim(),
    color:       document.getElementById('f-color').value.trim(),
    description: document.getElementById('f-desc').value.trim(),
    history:     document.getElementById('f-history').value.trim(),
    notes:       document.getElementById('f-notes').value.trim(),
    tried:       document.getElementById('f-tried').checked,
    favorite:    document.getElementById('f-fav').checked,
  };

  if (isEdit) {
    const idx = state.beers.findIndex(b => b.id === state.editingId);
    if (idx > -1) state.beers[idx] = beer;
  } else {
    state.beers.unshift(beer);
  }
  save();
  snackbar(isEdit ? `"${name}" aggiornata` : `"${name}" aggiunta alla cantina`);
  if (isEdit) {
    history.back();
  } else {
    navigate('home');
  }
}

export function deleteBeer(id) {
  const b = state.beers.find(x => x.id === id);
  if (!b) return;
  document.getElementById('delete-dialog-text').textContent =
    `Vuoi davvero eliminare "${b.name}"? L'operazione non è reversibile.`;
  const dlg = document.getElementById('delete-dialog');
  dlg.classList.add('open');

  document.getElementById('delete-confirm').onclick = () => {
    state.beers = state.beers.filter(x => x.id !== id);
    save();
    dlg.classList.remove('open');
    snackbar(`"${b.name}" eliminata`);
    history.back();
  };
  document.getElementById('delete-cancel').onclick = () => dlg.classList.remove('open');
}
