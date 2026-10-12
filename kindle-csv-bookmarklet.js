// Kindle CSV Export — readable source.
// kindle-csv-bookmarklet.txt is generated from this file by build.sh.
// You can also paste this file as-is into the DevTools console.

(async () => {
  if (window.__kindleExport) { alert('Eksport już trwa.'); return; }
  if (!document.getElementById('CONTENT_LIST')) {
    alert('Otwórz listę zawartości: Manage Your Content and Devices → Content.');
    return;
  }
  window.__kindleExport = true;

  const API_URL = '/hz/mycd/digital-console/ajax';
  const BATCH_SIZE = 500;  // items per request; Amazon accepts at least 1000
  const PARALLEL = 4;      // concurrent requests
  const RETRIES = 3;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const waitFor = async (test, ms) => {
    for (let t = 0; t < ms; t += 100) { if (test()) return true; await sleep(100); }
    return false;
  };

  // "Showing 1 to 25 of 1234 items" -> {start, end, total}
  // A list that fits on one page shows "Showing All (6)" instead.
  const pageCounter = () => {
    const text = document.getElementById('CONTENT_COUNT')?.textContent || '';
    const m = text.match(/(\d+)\D+(\d+)\D+(\d+)/);
    if (m) return { start: +m[1], end: +m[2], total: +m[3] };
    const one = text.match(/\d+/);
    return one ? { start: 1, end: +one[0], total: +one[0] } : null;
  };

  const formatDate = x => {
    const d = new Date(x);
    if (isNaN(d)) return x;
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  const formatTime = s => {
    s = Math.round(s);
    const m = Math.floor(s / 60);
    return m + ':' + String(s - m * 60).padStart(2, '0');
  };

  // The API returns HTML-encoded text (&oacute;, &#322;) and sometimes decomposed
  // characters (o + U+0301). A <textarea> decodes entities without running markup.
  const decoder = document.createElement('textarea');
  const decode = s => { decoder.innerHTML = s || ''; return decoder.value.normalize('NFC'); };

  // ---- Progress overlay ----
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:16px;right:16px;z-index:2147483647;width:320px;background:white;color:rgb(17,17,17);border:1px solid rgb(200,200,200);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.25);padding:14px 16px;font:14px/1.4 system-ui,sans-serif';
  box.innerHTML = '<div style="font-weight:600;margin-bottom:8px">Eksport listy Kindle</div>'
    + '<div data-k="msg">Przygotowanie…</div>'
    + '<div style="height:8px;background:rgb(230,230,230);border-radius:4px;margin:10px 0;overflow:hidden"><div data-k="bar" style="height:100%;width:0;background:rgb(255,153,0);transition:width .3s"></div></div>'
    + '<div data-k="stat" style="font-size:12px;color:rgb(90,90,90)"></div>'
    + '<button data-k="btn" style="margin-top:10px;padding:6px 12px;border:1px solid rgb(180,180,180);border-radius:6px;background:rgb(245,245,245);cursor:pointer">Zatrzymaj i zapisz</button>';
  document.body.appendChild(box);
  const ui = k => box.querySelector('[data-k="' + k + '"]');

  let stopped = false, finished = false;
  ui('btn').onclick = () => {
    if (finished) { box.remove(); return; }
    stopped = true;
    ui('btn').disabled = true;
    ui('msg').textContent = 'Zatrzymuję…';
  };

  const rows = new Map();  // asin -> CSV row
  const startedAt = Date.now();
  const elapsed = () => formatTime((Date.now() - startedAt) / 1000);

  const saveCsv = () => {
    const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
    const head = ['Tytuł', 'Autor', 'Rozmiar', 'Data dodania', 'Liczba urządzeń', 'Urządzenia', 'Kolekcje', 'Przeczytane', 'ID'];
    const csv = [head, ...rows.values()].map(r => r.map(esc).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'kindle-lista.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ---- Capture the request the page itself sends ----
  // Clicking a pagination button makes the page call GetContentOwnershipData.
  // Reusing its parameters keeps the selected view, filters, sort order and CSRF token.
  const origSend = XMLHttpRequest.prototype.send;
  const origFetch = window.fetch;
  let captured = null;
  const inspect = body => {
    try {
      const p = new URLSearchParams(typeof body === 'string' || body instanceof URLSearchParams ? body : '');
      if (p.get('activity') === 'GetContentOwnershipData' && p.get('csrfToken')) captured = p;
    } catch (e) { /* not a form body */ }
  };

  // ---- Fallback for a list that fits on one page ----
  // There is no pagination button to click then, so the parameters are rebuilt from
  // the URL (/contentlist/<view>/<sort>/<search>) and the fixed fields of each view,
  // as sent by the page. The server returns nothing without contentType.
  const VIEWS = {
    booksAll: {
      contentType: 'Ebook',
      contentCategoryReference: 'booksAll',
      itemStatusList: ['Active', 'Expired'],
      excludeExpiredItemsFor: ['KOLL', 'Purchase', 'Pottermore', 'FreeTrial', 'DeviceRegistration', 'KindleUnlimited', 'Sample', 'Prime', 'ComicsUnlimited', 'Comixology'],
      originTypes: ['Purchase', 'PublicLibraryLending', 'PersonalLending', 'Sample', 'ComicsUnlimited', 'KOLL', 'RFFLending', 'Pottermore', 'Prime', 'Rental', 'DeviceRegistration', 'FreeTrial', 'KindleUnlimited', 'Comixology'],
      showSharedContent: true,
      isExtendedMYK: false,
    },
    pdocs: {
      contentType: 'KindlePDoc',
      contentCategoryReference: 'pdocs',
      itemStatusList: ['Active'],
      isExtendedMYK: false,
    },
  };
  const paramsFromUrl = () => {
    const segs = location.pathname.split('/');
    const i = segs.indexOf('contentlist');
    const view = i < 0 ? null : VIEWS[segs[i + 1]];
    if (!view || !window.csrfToken) return null;
    const sort = (segs[i + 2] || '').match(/^([a-z]+)(Asc|Dsc)$/i);  // "dateDsc" -> DATE, DESCENDING
    const fetchCriteria = {
      sortOrder: sort && sort[2] === 'Asc' ? 'ASCENDING' : 'DESCENDING',
      sortIndex: sort ? sort[1].toUpperCase() : 'DATE',
      startIndex: 0,
      batchSize: 25,
    };
    if (segs[i + 3]) fetchCriteria.searchPhrase = decodeURIComponent(segs[i + 3]);
    return new URLSearchParams({
      activity: 'GetContentOwnershipData',
      activityInput: JSON.stringify({ ...view, fetchCriteria, surfaceType: 'Desktop' }),
      clientId: 'MYCD_WebService',
      csrfToken: window.csrfToken,
    });
  };

  try {
    if (!await waitFor(pageCounter, 30000)) { ui('msg').textContent = 'Lista się nie wczytała.'; return; }

    const c = pageCounter();
    const perPage = c.end - c.start + 1;
    const page = Math.floor((c.start - 1) / perPage) + 1;
    const button = document.getElementById('page-' + (page + 1))
      || document.getElementById('page-' + (page - 1))
      || document.getElementById('page-' + page);

    ui('msg').textContent = 'Odczytuję parametry listy…';
    XMLHttpRequest.prototype.send = function (body) { inspect(body); return origSend.apply(this, arguments); };
    window.fetch = function (url, opts) { inspect(opts?.body); return origFetch.apply(this, arguments); };
    try {
      if (button) { button.click(); await waitFor(() => captured, 10000); }
    } finally {
      XMLHttpRequest.prototype.send = origSend;
      window.fetch = origFetch;
    }
    if (!captured) captured = paramsFromUrl();
    if (!captured) {
      ui('msg').textContent = button
        ? 'Nie udało się odczytać parametrów listy. Odśwież stronę i spróbuj ponownie.'
        : 'Ten widok nie jest obsługiwany, gdy lista mieści się na jednej stronie. Obsługiwane są Books i Docs.';
      return;
    }

    // ---- API calls ----
    const baseInput = JSON.parse(captured.get('activityInput'));

    const callApi = async (activity, input) => {
      const body = new URLSearchParams(captured);
      body.set('activity', activity);
      body.set('activityInput', JSON.stringify(input));
      for (let attempt = 1; ; attempt++) {
        try {
          const r = await origFetch.call(window, API_URL, { method: 'POST', credentials: 'same-origin', body });
          if (!r.ok) throw Error('HTTP ' + r.status);
          const result = (await r.json())[activity];
          if (!result) throw Error('nieoczekiwana odpowiedź');
          return result;
        } catch (e) {
          if (attempt >= RETRIES) throw e;
          await sleep(1500 * attempt);
        }
      }
    };

    // startIndex is an item offset, not a page number. Note: hasMoreItems and the
    // inner success flag are always false, so the loop relies on numberOfItems.
    const fetchBatch = async start => {
      const g = await callApi('GetContentOwnershipData', {
        ...baseInput,
        fetchCriteria: { ...baseInput.fetchCriteria, startIndex: start, batchSize: BATCH_SIZE },
      });
      if (!Array.isArray(g.items)) throw Error('brak pozycji w odpowiedzi');
      return g;
    };

    // targetDevices is keyed by deviceAccountID ({"<deviceAccountID>": 1}).
    // deviceSerialNumber and deviceTypeID are not unique across apps, so don't use them.
    const devicesPromise = callApi('GetDeviceDetailsBatch', { surfaceType: baseInput.surfaceType || 'Desktop' })
      .then(d => d.deviceList || [], () => []);

    ui('msg').textContent = 'Pobieram listę…';
    const first = await fetchBatch(0);
    const total = first.numberOfItems || first.items.length;

    const batches = [first.items];
    const starts = [];
    for (let s = BATCH_SIZE; s < total; s += BATCH_SIZE) starts.push(s);

    let fetched = first.items.length, next = 0, error = null;
    const progress = () => {
      ui('bar').style.width = Math.min(100, Math.round(fetched / total * 100)) + '%';
      ui('msg').textContent = 'Pobrano porcji: ' + batches.filter(Boolean).length + ' z ' + (starts.length + 1);
      ui('stat').textContent = fetched + ' / ' + total + ' pozycji · minęło ' + elapsed();
    };
    progress();

    await Promise.all(Array.from({ length: PARALLEL }, async () => {
      while (next < starts.length && !stopped && !error) {
        const j = next++;
        try {
          const g = await fetchBatch(starts[j]);
          batches[j + 1] = g.items;
          fetched += g.items.length;
          progress();
        } catch (e) { error = e; }
      }
    }));

    const deviceNames = new Map();
    for (const d of await devicesPromise) if (d.deviceAccountID) deviceNames.set(d.deviceAccountID, d.deviceName);

    // flat() skips batches that were never fetched (stop or error)
    for (const item of batches.flat()) {
      const devices = Object.keys(item.targetDevices || {});
      rows.set(item.asin || item.title, [
        decode(item.title),
        decode(item.author),
        item.size || '',
        formatDate(item.acquiredTime || item.acquiredDate),
        devices.length,
        devices.map(id => decode(deviceNames.get(id) || id)).join(', '),
        (item.collectionList || []).map(col => decode(col.collectionName)).join(', '),
        item.readStatus === 'READ' ? 'tak' : '',
        item.asin || '',
      ]);
    }

    let note = error ? 'Błąd pobierania (' + error.message + '), zapisano część danych. '
      : stopped ? 'Zatrzymano ręcznie. ' : '';
    const shown = pageCounter()?.total;
    if (!error && !stopped && shown && shown !== rows.size) {
      note += 'Uwaga: strona pokazuje ' + shown + ' pozycji, pobrano ' + rows.size + '. ';
    }

    saveCsv();
    ui('bar').style.width = Math.min(100, Math.round(rows.size / total * 100)) + '%';
    ui('stat').textContent = rows.size + ' / ' + total + ' pozycji · minęło ' + elapsed();
    ui('msg').textContent = note + 'Zapisano ' + rows.size + ' pozycji do pliku kindle-lista.csv.';
  } catch (e) {
    ui('msg').textContent = 'Błąd: ' + e.message;
    if (rows.size) saveCsv();
  } finally {
    window.__kindleExport = false;
    finished = true;
    ui('btn').disabled = false;
    ui('btn').textContent = 'Zamknij';
  }
})();
