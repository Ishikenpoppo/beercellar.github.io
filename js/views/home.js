import { CATEGORIES } from '../data.js';
import { state } from '../state.js';
import { getCat, catIcon, svgIcon, renderStars, makeBadge, esc } from '../helpers.js';
import { getFilteredBeers } from '../filters.js';
import { navigate } from '../app.js';
import { toggleFav } from '../actions.js';

// ═══════════════════════════════════════════════════════════
// HOME RENDER
// ═══════════════════════════════════════════════════════════

export function renderHome() {
  renderCategoryChips();
  renderBeerList();
}

function renderCategoryChips() {
  const el = document.getElementById('category-chips');
  let html = `<button class="chip ${!state.selectedCategory ? 'active' : ''}" data-cat="" style="${!state.selectedCategory ? '--cat-color:var(--amber)' : ''}">${svgIcon('cat-all')} Tutte</button>`;
  CATEGORIES.forEach(c => {
    const active = state.selectedCategory === c.id;
    html += `<button class="chip ${active ? 'active' : ''}" data-cat="${c.id}" style="${active ? `--cat-color:${c.color}` : ''}">${catIcon(c.id)} ${c.name}</button>`;
  });
  el.innerHTML = html;
  el.querySelectorAll('.chip').forEach(ch => {
    ch.addEventListener('click', () => {
      const v = ch.dataset.cat;
      state.selectedCategory = v ? (v === state.selectedCategory ? null : v) : null;
      state.searchQuery = '';
      document.getElementById('search-input').value = '';
      document.getElementById('search-clear').classList.remove('visible');
      renderHome();
    });
  });
}

export function renderBeerList() {
  const beers = getFilteredBeers();
  const el    = document.getElementById('beer-list');
  const count = document.getElementById('beer-count');
  count.textContent = beers.length
    ? `${beers.length} birr${beers.length === 1 ? 'a' : 'e'}`
    : '';

  if (!beers.length) {
    const hasFilter = state.searchQuery || state.selectedCategory;
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">${svgIcon('beer', 'icon icon--2xl')}</div>
        <h3>${hasFilter ? 'Nessuna birra trovata' : 'La tua cantina è vuota'}</h3>
        <p>${hasFilter ? 'Prova con un termine diverso o rimuovi i filtri.' : 'Inizia aggiungendo la prima birra della tua collezione.'}</p>
        ${!hasFilter ? `<button class="save-btn empty-add-btn" style="margin-top:16px;max-width:260px">${svgIcon('add')} Aggiungi la prima birra</button>` : ''}
      </div>`;
    const addBtn = el.querySelector('.empty-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => navigate('add'));
    return;
  }

  el.innerHTML = beers.map((b, i) => {
    const cat = getCat(b.category);
    return `
    <div class="card beer-card" data-id="${b.id}" style="animation-delay:${i * 28}ms;--cat-color:${cat.color}">
      <div class="beer-card-stripe" style="--cat-color:${cat.color}"></div>
      <div class="beer-card-body">
        <div class="beer-emoji-wrap" style="--cat-color:${cat.color}">${catIcon(b.category)}</div>
        <div class="beer-meta">
          <div class="beer-name">${esc(b.name)}</div>
          <div class="beer-brewery">${esc(b.brewery || '')}</div>
          ${b.origin ? `<div class="beer-origin">${svgIcon('pin', 'icon icon--sm')} ${esc(b.origin)}</div>` : ''}
        </div>
        <button class="fav-btn${b.favorite ? ' is-fav' : ''}" data-fav-id="${b.id}">${b.favorite ? svgIcon('heart-full') : svgIcon('heart-empty')}</button>
      </div>
      <div class="beer-card-footer">
        ${makeBadge(`${cat.name}`, cat.color)}
        ${b.abv > 0 ? makeBadge(`${parseFloat(b.abv).toFixed(1)}%`, '#F4C840') : ''}
        <span style="flex:1"></span>
        ${b.rating > 0
          ? `${renderStars(b.rating)} <span style="font-size:0.76rem;color:var(--gold);font-weight:700;margin-left:3px">${b.rating.toFixed(1)}</span>`
          : `<span style="font-size:0.7rem;color:var(--muted);font-family:var(--font-sub);letter-spacing:0.04em">Non valutata</span>`}
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('.beer-card').forEach(card => {
    card.addEventListener('click', () => navigate('detail', { id: +card.dataset.id }));
  });

  el.querySelectorAll('.fav-btn[data-fav-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFav(+btn.dataset.favId);
    });
  });
}
