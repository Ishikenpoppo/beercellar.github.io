import { CAT_MAP } from './data.js';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export function getCat(id) { return CAT_MAP[id] || CAT_MAP['other']; }

export function uid() { return Date.now() + Math.floor(Math.random() * 1000); }

export function catIcon(id, cls) {
  const c = cls ? ` class="${cls}"` : ` class="icon"`;
  return `<svg${c}><use href="#ic-cat-${id || 'other'}"/></svg>`;
}

export function svgIcon(id, cls) {
  const c = cls ? ` class="${cls}"` : ` class="icon"`;
  return `<svg${c}><use href="#ic-${id}"/></svg>`;
}

export function renderStars(rating, size = 'sm') {
  const sizeClass = size === 'sm' ? '' : size === 'md' ? ' icon--md' : ' icon--lg';
  let html = `<span class="stars">`;
  for (let i = 1; i <= 5; i++) {
    const full = rating >= i;
    const half = !full && rating >= i - 0.5;
    const iconId = full ? 'star-full' : half ? 'star-half' : 'star-empty';
    const color  = (full || half) ? 'var(--gold)' : 'rgba(100,70,45,0.6)';
    html += `<span class="star" style="color:${color}"><svg class="icon${sizeClass}"><use href="#ic-${iconId}"/></svg></span>`;
  }
  return html + '</span>';
}

export function ratingLabel(r) {
  if (!r)       return 'Tocca le stelle per valutare';
  if (r < 1.5)  return 'Non è per me';
  if (r < 2.5)  return 'Nella media';
  if (r < 3.5)  return 'Discreta';
  if (r < 4.5)  return 'Ottima!';
  if (r < 5.0)  return 'Quasi perfetta';
  return 'Capolavoro assoluto!';
}

export function makeBadge(text, color) {
  return `<span class="badge" style="background:${color}1A;border-color:${color}50;color:${color}">${text}</span>`;
}

export function snackbar(msg) {
  const el = document.getElementById('snackbar');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

export function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function buildStarPicker(containerId, currentRating, onChange) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let rating = currentRating;

  function render() {
    el.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const filled = rating >= i;
      const half   = !filled && rating >= i - 0.5;
      const unit   = document.createElement('div');
      unit.className = 'star-unit';

      const full = document.createElement('span');
      full.className = 'star-full';
      const starId = filled ? 'ic-star-full' : half ? 'ic-star-half' : 'ic-star-empty';
      full.style.color   = (filled || half) ? 'var(--gold)' : 'rgba(90,60,35,0.5)';
      full.innerHTML = `<svg class="icon"><use href="#${starId}"/></svg>`;
      full.addEventListener('click', () => { rating = i; onChange(rating); render(); });

      const halfBtn = document.createElement('button');
      halfBtn.className = 'star-half-btn';
      halfBtn.textContent = '½';
      halfBtn.style.color = half ? 'var(--gold)' : 'var(--barrel)';
      halfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        rating = i - 0.5;
        onChange(rating);
        render();
      });

      unit.appendChild(full);
      unit.appendChild(halfBtn);
      el.appendChild(unit);
    }
  }
  render();
}
