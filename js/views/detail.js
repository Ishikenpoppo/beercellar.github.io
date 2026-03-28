import { state, save } from '../state.js';
import { getCat, catIcon, svgIcon, renderStars, ratingLabel, makeBadge, esc, buildStarPicker } from '../helpers.js';
import { navigate } from '../app.js';

// ═══════════════════════════════════════════════════════════
// DETAIL RENDER
// ═══════════════════════════════════════════════════════════

export function renderDetail(id) {
  const b = state.beers.find(x => x.id === id);
  if (!b) { navigate('home', {}, { replace: true }); return; }
  state.selectedBeer = id;
  const cat = getCat(b.category);

  document.getElementById('detail-fav').innerHTML = b.favorite
    ? svgIcon('heart-full')
    : svgIcon('heart-empty');
  if (b.favorite) {
    document.getElementById('detail-fav').classList.add('is-fav');
  } else {
    document.getElementById('detail-fav').classList.remove('is-fav');
  }

  let badges = makeBadge(cat.name, cat.color);
  if (b.abv > 0) badges += makeBadge(`${parseFloat(b.abv).toFixed(1)}% ABV`, '#F4C840');
  if (b.ibu > 0) badges += makeBadge(`${b.ibu} IBU`, '#8ABF40');
  if (b.origin)  badges += makeBadge(`${svgIcon('pin','icon icon--sm')} ${b.origin}`, '#A08060');
  if (b.color)   badges += makeBadge(b.color, '#8A7A64');

  const html = `
    <div class="detail-hero" style="--cat-color:${cat.color}">
      <div class="detail-hero-bg" style="background:linear-gradient(135deg, ${cat.color}20 0%, ${cat.color}08 60%, transparent 100%)"></div>
      <div class="detail-hero-circle" style="--cat-color:${cat.color}"></div>
      <div class="detail-hero-emoji">${catIcon(b.category, 'icon')}</div>
      <div class="detail-hero-content">
        <div class="detail-hero-name">${esc(b.name)}</div>
        ${b.brewery ? `<div class="detail-hero-brewery" style="color:${cat.color}">${esc(b.brewery)}</div>` : ''}
      </div>
    </div>

    <div class="detail-badges">${badges}</div>

    <div class="detail-section">
      <div class="section-header">
        <div class="section-bar" style="background:var(--gold)"></div>
        <div class="section-title">La tua valutazione</div>
      </div>
      <div class="section-card rating-block">
        <div class="star-picker" id="detail-star-picker"></div>
        <div class="rating-label" id="detail-rating-label">${ratingLabel(b.rating)}</div>
      </div>
    </div>

    ${b.notes ? `
    <div class="detail-section">
      <div class="section-header">
        <div class="section-bar" style="background:var(--amber)"></div>
        <div class="section-title">${svgIcon('note')} Note personali</div>
      </div>
      <div class="section-card"><p class="section-text">${esc(b.notes)}</p></div>
    </div>` : ''}

    ${b.description ? `
    <div class="detail-section">
      <div class="section-header">
        <div class="section-bar" style="background:var(--amber)"></div>
        <div class="section-title">${svgIcon('hop')} Profilo organolettico</div>
      </div>
      <div class="section-card"><p class="section-text">${esc(b.description)}</p></div>
    </div>` : ''}

    ${b.history ? `
    <div class="detail-section">
      <div class="section-header">
        <div class="section-bar" style="background:${cat.color}"></div>
        <div class="section-title">${svgIcon('scroll')} Storia e curiosità</div>
      </div>
      <div class="section-card">
        <div class="history-inner">
          <div class="history-line" style="background:linear-gradient(to bottom, ${cat.color}, transparent)"></div>
          <p class="section-text">${esc(b.history)}</p>
        </div>
      </div>
    </div>` : ''}
  `;

  document.getElementById('detail-content').innerHTML = html;
  buildStarPicker('detail-star-picker', b.rating, (r) => {
    const beer = state.beers.find(x => x.id === state.selectedBeer);
    if (beer) {
      beer.rating = r;
      save();
      document.getElementById('detail-rating-label').textContent = ratingLabel(r);
    }
  });
}
