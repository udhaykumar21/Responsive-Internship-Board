(() => {
  'use strict';
  const DATA_URL = 'data/internships.json';
  const STORE_KEY = 'internship-applications-v1';
  const $ = (id) => document.getElementById(id);

  const els = {
    form: $('filter-form'), search: $('search'), domain: $('domain'), mode: $('mode'),
    list: $('list'), status: $('status'), loading: $('loading'), error: $('error'),
    errorMsg: $('error-msg'), empty: $('empty'), retry: $('retry'), emptyClear: $('empty-clear'),
    dialog: $('dialog'), dTitle: $('dialog-title'), dDetails: $('dialog-details'),
    dClose: $('dialog-close'), apply: $('apply-form'), applyMsg: $('apply-msg')
  };

  let internships = [];
  let current = null;       // internship shown in dialog
  let lastTrigger = null;   // element to return focus to

  /* ---------- helpers ---------- */
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => (k === 'class' ? (n.className = v) : n.setAttribute(k, v)));
    kids.forEach((k) => n.append(k));
    return n;
  };
  const show = (node, on) => { node.hidden = !on; };
  const unique = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b));

  /* ---------- load data (loading / error / retry) ---------- */
  async function load() {
    show(els.loading, true); show(els.error, false); show(els.empty, false);
    els.list.replaceChildren(); els.status.textContent = '';
    try {
      // Add ?fail=1 to the page URL to demo the error state.
      if (new URLSearchParams(location.search).has('fail')) throw new Error('Simulated failure');
      const res = await fetch(DATA_URL, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Server responded with ' + res.status);
      const json = await res.json();
      if (!json || !Array.isArray(json.internships)) throw new Error('Unexpected data format');
      internships = json.internships;
      fillSelect(els.domain, unique(internships.map((i) => i.domain)));
      fillSelect(els.mode, unique(internships.map((i) => i.mode)));
      show(els.loading, false);
      render();
    } catch (err) {
      show(els.loading, false);
      els.errorMsg.textContent = "We couldn't load internships. Check your connection and try again.";
      show(els.error, true);
      els.retry.focus();
    }
  }
  function fillSelect(select, values) {
    const keep = select.firstElementChild;
    select.replaceChildren(keep);
    values.forEach((v) => select.append(el('option', { value: v }, v)));
  }

  /* ---------- filter + render ---------- */
  function filtered() {
    const q = els.search.value.trim().toLowerCase();
    return internships.filter((i) => {
      if (els.domain.value && i.domain !== els.domain.value) return false;
      if (els.mode.value && i.mode !== els.mode.value) return false;
      if (!q) return true;
      return [i.title, i.domain, i.location, i.mode, ...i.skills].join(' ').toLowerCase().includes(q);
    });
  }

  function card(i) {
    const titleId = 'title-' + i.id;
    const article = el('article', { class: 'card', 'aria-labelledby': titleId });
    article.append(
      el('h3', { id: titleId }, i.title),
      el('p', { class: 'meta' }, `${i.domain} · ${i.mode} · ${i.location}`)
    );
    const tags = el('ul', { class: 'tags', 'aria-label': 'Skills' });
    i.skills.forEach((s) => tags.append(el('li', { class: 'tag' }, s)));
    article.append(tags, el('p', { class: 'meta' }, `${i.openings} ${i.openings === 1 ? 'opening' : 'openings'}`));

    const actions = el('div', { class: 'card-actions' });
    const view = el('button', { type: 'button', class: 'btn btn-secondary', 'aria-label': `View details for ${i.title}` }, 'View details');
    const apply = el('button', { type: 'button', class: 'btn', 'aria-label': `Apply for ${i.title}` }, 'Apply');
    view.addEventListener('click', () => openDialog(i, view));
    apply.addEventListener('click', () => openDialog(i, apply, true));
    actions.append(view, apply);
    article.append(actions);
    return el('li', {}, article);
  }

  function render() {
    const items = filtered();
    els.list.replaceChildren(...items.map(card));
    show(els.empty, items.length === 0);
    els.status.className = 'status';
    els.status.textContent = items.length === 0
      ? 'No internships found.'
      : `Showing ${items.length} of ${internships.length} internships.`;
  }

  function clearFilters() { els.form.reset(); render(); els.search.focus(); }

  /* ---------- dialog ---------- */
  function openDialog(i, trigger, focusForm = false) {
    current = i; lastTrigger = trigger;
    els.dTitle.textContent = i.title;
    els.dDetails.replaceChildren();
    [['ID', i.id], ['Domain', i.domain], ['Work mode', i.mode], ['Location', i.location],
     ['Skills', i.skills.join(', ')], ['Openings', String(i.openings)]].forEach(([k, v]) => {
      els.dDetails.append(el('dt', {}, k), el('dd', {}, v));
    });
    resetForm();
    els.dialog.showModal();
    (focusForm ? $('a-name') : els.dClose).focus();
  }
  function closeDialog() { els.dialog.close(); }
  els.dialog.addEventListener('close', () => { if (lastTrigger) lastTrigger.focus(); });
  els.dClose.addEventListener('click', closeDialog);
  els.dialog.addEventListener('click', (e) => { if (e.target === els.dialog) closeDialog(); }); // backdrop click
  // <dialog> traps focus and closes on Escape natively.

  /* ---------- application form ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function resetForm() {
    els.apply.reset();
    ['name', 'email', 'url'].forEach((f) => setErr(f, ''));
    els.applyMsg.textContent = ''; els.applyMsg.className = 'status';
  }
  function setErr(field, msg) {
    const input = $('a-' + field);
    $('a-' + field + '-err').textContent = msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  function validate(v) {
    const errs = {};
    if (!v.name) errs.name = 'Please enter your full name.';
    else if (v.name.length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!v.email) errs.email = 'Please enter your email address.';
    else if (!EMAIL_RE.test(v.email)) errs.email = 'Enter a valid email, like name@example.com.';
    if (v.url) {
      try {
        const u = new URL(v.url);
        if (u.protocol !== 'https:') errs.url = 'Only https:// links are allowed.';
      } catch { errs.url = 'Enter a valid link starting with https://'; }
    }
    return errs;
  }
  const readStore = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; } };

  els.apply.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = {
      name: $('a-name').value.trim(),
      email: $('a-email').value.trim().toLowerCase(),
      url: $('a-url').value.trim()
    };
    const errs = validate(v);
    ['name', 'email', 'url'].forEach((f) => setErr(f, errs[f] || ''));
    const firstBad = ['name', 'email', 'url'].find((f) => errs[f]);
    if (firstBad) {
      els.applyMsg.className = 'status err';
      els.applyMsg.textContent = 'Please fix the highlighted fields.';
      $('a-' + firstBad).focus();
      return;
    }
    const store = readStore();
    if (store.some((a) => a.internshipId === current.id && a.email === v.email)) {
      setErr('email', 'This email has already applied for this internship.');
      els.applyMsg.className = 'status err';
      els.applyMsg.textContent = 'Duplicate application.';
      $('a-email').focus();
      return;
    }
    try { store.push({ internshipId: current.id, email: v.email, name: v.name, url: v.url }); localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* storage unavailable */ }
    els.applyMsg.className = 'status ok';
    els.applyMsg.textContent = `Thanks ${v.name}! Your application for ${current.title} was submitted.`;
    els.apply.reset();
  });

  /* ---------- events ---------- */
  els.search.addEventListener('input', render);
  els.domain.addEventListener('change', render);
  els.mode.addEventListener('change', render);
  els.form.addEventListener('submit', (e) => e.preventDefault());
  els.form.addEventListener('reset', () => setTimeout(render, 0));
  els.emptyClear.addEventListener('click', clearFilters);
  els.retry.addEventListener('click', load);

  load();
})();
