import { CATEGORIES } from '../data.js';
import { state } from '../state.js';
import { getCat, catIcon, svgIcon, renderStars, esc } from '../helpers.js';

// ═══════════════════════════════════════════════════════════
// STATS RENDER
// ═══════════════════════════════════════════════════════════

export function renderStats() {
  const beers = state.beers;
  const tried = beers.filter(b => b.tried);
  const favs  = beers.filter(b => b.favorite);
  const rated = tried.filter(b => b.rating > 0);
  const avgR  = rated.length ? rated.reduce((a,b) => a + b.rating, 0) / rated.length : 0;
  const cats  = new Set(beers.map(b => b.category)).size;

  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi-card" style="--kpi-color:var(--amber)">
      <div class="kpi-icon">${svgIcon('beer')}</div>
      <div><div class="kpi-value">${tried.length}</div><div class="kpi-label">Birre provate</div></div>
    </div>
    <div class="kpi-card" style="--kpi-color:#D4524A">
      <div class="kpi-icon">${svgIcon('heart-full')}</div>
      <div><div class="kpi-value">${favs.length}</div><div class="kpi-label">Preferite</div></div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--gold)">
      <div class="kpi-icon">${svgIcon('star-full')}</div>
      <div><div class="kpi-value">${avgR > 0 ? avgR.toFixed(1) : '—'}</div><div class="kpi-label">Voto medio</div></div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--hops)">
      <div class="kpi-icon">${svgIcon('palette')}</div>
      <div><div class="kpi-value">${cats}</div><div class="kpi-label">Stili diversi</div></div>
    </div>`;

  const topEl = document.getElementById('stats-top');
  const top5  = [...beers].filter(b => b.rating > 0).sort((a,b) => b.rating - a.rating).slice(0,5);
  const medalColors = ['#D8AA3D','#B0B8C4','#CD7F32'];
  if (top5.length) {
    topEl.innerHTML = `<div class="stats-section-title">${svgIcon('trophy')} Top ${top5.length} birre</div>` +
      top5.map((b,i) => {
        const cat = getCat(b.category);
        const rankStyle = i < 3 ? `color:${medalColors[i]};border:1px solid ${medalColors[i]}40` : '';
        return `
        <div class="top-item" style="--cat-color:${cat.color}">
          <div class="top-rank" style="${rankStyle}">${i+1}</div>
          <div class="top-emoji">${catIcon(b.category)}</div>
          <div class="top-meta">
            <div class="top-name">${esc(b.name)}</div>
            <div class="top-brewery">${esc(b.brewery||'')}</div>
          </div>
          ${renderStars(b.rating)}
          <span style="font-size:0.76rem;color:var(--gold);font-weight:700;margin-left:4px">${b.rating.toFixed(1)}</span>
        </div>`;
      }).join('');
  } else {
    topEl.innerHTML = `
      <div class="stats-section-title">${svgIcon('trophy')} Top birre</div>
      <div class="section-card" style="text-align:center;padding:24px">
        <div style="display:flex;justify-content:center;opacity:0.3;color:var(--gold)">${svgIcon('star-empty','icon icon--xl')}</div>
        <p style="color:var(--muted);font-size:0.86rem;margin-top:8px">Nessuna birra valutata ancora.<br>Apri una scheda e dai le stelle!</p>
      </div>`;
  }

  const barsEl = document.getElementById('stats-bars');
  const bycat  = CATEGORIES
    .map(c => ({ cat:c, count: beers.filter(b => b.category === c.id).length }))
    .filter(x => x.count > 0)
    .sort((a,b) => b.count - a.count);
  const maxC = Math.max(...bycat.map(x => x.count), 1);

  if (bycat.length) {
    barsEl.innerHTML = `<div class="stats-section-title">${svgIcon('stats')} Per stile</div>
      <div class="section-card">
      ${bycat.map(({cat,count}) => `
        <div class="bar-row" style="--cat-color:${cat.color}">
          <span class="bar-emoji">${catIcon(cat.id)}</span>
          <span class="bar-label">${cat.name}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${(count/maxC*100).toFixed(1)}%;background:linear-gradient(90deg,${cat.color},${cat.color}66)"></div>
          </div>
          <span class="bar-count" style="color:${cat.color}">${count}</span>
        </div>`).join('')}
      </div>`;
  } else { barsEl.innerHTML = ''; }
}
