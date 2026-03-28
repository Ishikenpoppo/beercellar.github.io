import { state } from '../state.js';
import { getCat, catIcon, svgIcon, ratingLabel, buildStarPicker } from '../helpers.js';

// ═══════════════════════════════════════════════════════════
// ADD / EDIT RENDER
// ═══════════════════════════════════════════════════════════

export function renderAdd(editId) {
  state.editingId = editId;
  const b = editId ? state.beers.find(x => x.id === editId) : null;

  document.getElementById('add-title').textContent   = b ? 'Modifica birra' : 'Nuova birra';
  document.getElementById('save-icon').innerHTML     = b ? svgIcon('check') : svgIcon('add');
  document.getElementById('save-label').textContent  = b ? 'Salva modifiche' : 'Aggiungi birra';

  document.getElementById('f-name').value     = b?.name        || '';
  document.getElementById('f-brewery').value  = b?.brewery     || '';
  document.getElementById('f-origin').value   = b?.origin      || '';
  document.getElementById('f-abv').value      = b?.abv         || '';
  document.getElementById('f-ibu').value      = b?.ibu         || '';
  document.getElementById('f-color').value    = b?.color       || '';
  document.getElementById('f-desc').value     = b?.description || '';
  document.getElementById('f-history').value  = b?.history     || '';
  document.getElementById('f-notes').value    = b?.notes       || '';
  document.getElementById('f-tried').checked  = b ? b.tried    : false;
  document.getElementById('f-fav').checked    = b?.favorite    || false;

  state.formRating   = b?.rating   || 0;
  state.formCategory = b?.category || 'lager';

  updateCatSelector();
  buildStarPicker('form-star-picker', state.formRating, (r) => {
    state.formRating = r;
    document.getElementById('form-rating-label').textContent = ratingLabel(r);
  });
  document.getElementById('form-rating-label').textContent = ratingLabel(state.formRating);
  validateForm();
}

export function updateCatSelector() {
  const cat = getCat(state.formCategory);
  document.getElementById('cat-sel-emoji').innerHTML = catIcon(cat.id);
  document.getElementById('cat-sel-name').textContent  = cat.name;
  document.getElementById('cat-sel-name').style.color  = cat.color;
}

export function validateForm() {
  const ok = document.getElementById('f-name').value.trim().length > 0;
  document.getElementById('save-btn').disabled = !ok;
  document.getElementById('f-name').classList.toggle('error',
    !ok && document.getElementById('f-name').value.length > 0);
}
