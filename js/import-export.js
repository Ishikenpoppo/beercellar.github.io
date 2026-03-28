import { CAT_MAP } from './data.js';
import { state, save } from './state.js';
import { snackbar } from './helpers.js';
import { navigate } from './app.js';

// ═══════════════════════════════════════════════════════════
// EXPORT — File System Access API + fallback download
// ═══════════════════════════════════════════════════════════

export async function exportData() {
  const payload = {
    app: 'Beer Cellar',
    exportDate: new Date().toISOString(),
    version: '2.0',
    stats: {
      total: state.beers.length,
      tried: state.beers.filter(b => b.tried).length,
      favorites: state.beers.filter(b => b.favorite).length,
    },
    beers: state.beers,
  };
  const json     = JSON.stringify(payload, null, 2);
  const blob     = new Blob([json], { type: 'application/json' });
  const filename = `beer-cellar-${new Date().toISOString().slice(0,10)}.json`;

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'File JSON — Beer Cellar',
          accept: { 'application/json': ['.json'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      snackbar('Dati salvati con successo!');
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  // Fallback: download diretto
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  snackbar('Download avviato — controlla la cartella Download');
}

// ═══════════════════════════════════════════════════════════
// IMPORT — validate, merge or replace
// ═══════════════════════════════════════════════════════════

let _importPending = null;

export function importData() {
  document.getElementById('import-file-input').click();
}

export function handleImportFile(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    snackbar('File troppo grande (max 5 MB)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    let payload;
    try {
      payload = JSON.parse(e.target.result);
    } catch {
      snackbar('File non valido — JSON malformato');
      return;
    }

    let beers;
    if (Array.isArray(payload)) {
      beers = payload;
    } else if (payload && Array.isArray(payload.beers)) {
      if (payload.app && payload.app !== 'Beer Cellar') {
        snackbar('File da app diversa — tentativo di import comunque');
      }
      beers = payload.beers;
    } else {
      snackbar('Formato non riconosciuto — nessun array "beers" trovato');
      return;
    }

    const sanitize = (b, fallbackId) => ({
      id:          typeof b.id === 'number' ? b.id : fallbackId,
      dateAdded:   typeof b.dateAdded === 'number' ? b.dateAdded : Date.now(),
      name:        String(b.name        || '').trim(),
      brewery:     String(b.brewery     || '').trim(),
      category:    CAT_MAP[b.category]  ? b.category : 'other',
      rating:      typeof b.rating === 'number' ? Math.min(5, Math.max(0, b.rating)) : 0,
      abv:         parseFloat(b.abv)    || 0,
      ibu:         parseInt(b.ibu)      || 0,
      origin:      String(b.origin      || '').trim(),
      color:       String(b.color       || '').trim(),
      description: String(b.description || '').trim(),
      history:     String(b.history     || '').trim(),
      notes:       String(b.notes       || '').trim(),
      tried:       !!b.tried,
      favorite:    !!b.favorite,
    });

    let idCursor = Date.now();
    const valid = beers
      .filter(b => b && String(b.name || '').trim().length > 0)
      .map(b => sanitize(b, idCursor++));

    if (!valid.length) {
      snackbar('Nessuna birra valida trovata nel file');
      return;
    }

    _importPending = valid;

    const dlg = document.getElementById('import-dialog');
    document.getElementById('import-dialog-text').textContent =
      `Trovate ${valid.length} birre nel file. Come vuoi procedere?`;
    dlg.classList.add('open');
  };

  reader.onerror = () => snackbar('Errore nella lettura del file');
  reader.readAsText(file);
}

export function applyImport(strategy) {
  if (!_importPending) return;
  const incoming = _importPending;
  _importPending = null;

  const dlg = document.getElementById('import-dialog');
  dlg.classList.remove('open');

  if (strategy === 'replace') {
    state.beers = incoming;
    save();
    snackbar(`Cantina sostituita — ${incoming.length} birre caricate`);
  } else {
    const existingIds = new Set(state.beers.map(b => b.id));
    let idCursor = Date.now();
    const toAdd = incoming.map(b => {
      if (existingIds.has(b.id)) {
        return { ...b, id: idCursor++ };
      }
      return b;
    });
    state.beers = [...state.beers, ...toAdd];
    save();
    snackbar(`Merge completato — aggiunte ${toAdd.length} birre`);
  }

  navigate('home');
}
