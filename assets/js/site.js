/* Data Analyst Portfolio — concept demo. All datasets are embedded SAMPLES. */
'use strict';

/* ============ ONE swappable constant ============ */
const SITE_NAME = '[Analyst Name]';

document.documentElement.classList.add('js');

document.querySelectorAll('[data-site]').forEach(el => { el.textContent = SITE_NAME; });
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============ scroll reveals ============ */
(function () {
  const els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || !els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* hero line-rise: run once on load */
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.rise').forEach(el => el.classList.add('in'));
  }));
});

/* ============ mobile nav (state machine) ============ */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.getElementById('site-nav');
  if (!toggle || !panel) return;
  let lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    panel.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const first = panel.querySelector('a');
    if (first) first.focus();
  }
  function close() {
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  toggle.addEventListener('click', () => {
    panel.classList.contains('open') ? close() : open();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) close();
  });
})();

/* ============ tiny SVG chart helpers ============ */
const NS = 'http://www.w3.org/2000/svg';
function el(name, attrs, parent) {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
function barChart(svg, opts) {
  // opts: {labels:[], series:[{name,color,values:[]}], height, max?, valueFmt}
  const W = 640, H = opts.height || 300, padL = 8, padB = 34, padT = 26;
  const plotW = W - padL * 2, plotH = H - padB - padT;
  const max = opts.max || Math.max(...opts.series.flatMap(s => s.values)) * 1.15;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  const n = opts.labels.length, groups = opts.series.length;
  const gw = plotW / n, bw = Math.min(44, (gw / groups) * 0.62);
  // gridlines
  for (let i = 0; i <= 4; i++) {
    const y = padT + plotH - (plotH * i / 4);
    el('line', { x1: padL, x2: W - padL, y1: y, y2: y, stroke: 'rgba(22,21,15,.12)', 'stroke-width': 1 }, svg);
  }
  opts.labels.forEach((lab, i) => {
    const cx = padL + gw * i + gw / 2;
    const t = el('text', { x: cx, y: H - 10, 'text-anchor': 'middle', 'font-size': 12, fill: '#5C5748', 'font-family': 'ui-monospace,monospace' }, svg);
    t.textContent = lab;
    opts.series.forEach((s, j) => {
      const v = s.values[i];
      const h = Math.max(2, (v / max) * plotH);
      const x = cx + (j - (groups - 1) / 2) * (bw + 6) - bw / 2;
      const y = padT + plotH - h;
      el('rect', { x, y, width: bw, height: h, rx: 3, fill: s.color, class: 'bar', style: `transition-delay:${(i * groups + j) * 60}ms` }, svg);
      const vt = el('text', { x: x + bw / 2, y: y - 8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600, fill: '#16150F', 'font-family': 'ui-monospace,monospace' }, svg);
      vt.textContent = opts.valueFmt ? opts.valueFmt(v) : v;
    });
  });
}
function hbarChart(svg, opts) {
  // opts: {rows:[{label,value,color}], valueFmt}
  const W = 640, rowH = 64, padL = 150, padR = 90, padT = 10;
  const H = padT + opts.rows.length * rowH + 10;
  const max = Math.max(...opts.rows.map(r => r.value)) * 1.12;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  opts.rows.forEach((r, i) => {
    const y = padT + i * rowH;
    const t = el('text', { x: padL - 14, y: y + rowH / 2 + 5, 'text-anchor': 'end', 'font-size': 13, fill: '#16150F', 'font-weight': 600 }, svg);
    t.textContent = r.label;
    el('rect', { x: padL, y: y + 14, width: W - padL - padR, height: 22, rx: 4, fill: 'rgba(22,21,15,.07)' }, svg);
    const w = Math.max(4, ((r.value / max) * (W - padL - padR)));
    el('rect', { x: padL, y: y + 14, width: w, height: 22, rx: 4, fill: r.color, class: 'bar hbar', style: `transition-delay:${i * 120}ms` }, svg);
    const vt = el('text', { x: padL + w + 12, y: y + 14 + 16, 'font-size': 13, 'font-weight': 700, fill: '#16150F', 'font-family': 'ui-monospace,monospace' }, svg);
    vt.textContent = opts.valueFmt ? opts.valueFmt(r.value) : r.value;
  });
}
function playChart(svg) {
  if (!svg) return;
  svg.classList.remove('play');
  void svg.getBoundingClientRect(); // restart transition
  requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('play')));
}

/* ============ signature widget: mess -> message ============ */
(function () {
  const root = document.getElementById('pipeline');
  if (!root) return;
  const btns = Array.from(root.querySelectorAll('.stage-btns button'));
  const panels = btns.map(b => document.getElementById(b.getAttribute('aria-controls')));
  const live = document.getElementById('pipeline-live');

  function select(i, announce) {
    btns.forEach((b, j) => {
      b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      b.tabIndex = j === i ? 0 : -1;
      panels[j].hidden = j !== i;
    });
    if (i === 2) playChart(document.getElementById('insight-chart'));
    if (announce && live) live.textContent = `Stage ${i + 1} of 3: ${btns[i].dataset.stage}`;
  }
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(i, true));
    b.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { const n = (i + 1) % btns.length; btns[n].focus(); select(n, true); }
      if (e.key === 'ArrowLeft') { const n = (i - 1 + btns.length) % btns.length; btns[n].focus(); select(n, true); }
    });
  });
  // render insight chart on demand
  const svg = document.getElementById('insight-chart');
  if (svg) {
    svg.innerHTML = '';
    const title = el('title', {}, svg); title.textContent = 'Sample churn rate by plan: monthly 38%, annual 12%';
    barChart(svg, {
      labels: ['Monthly plan', 'Annual plan'],
      series: [{ name: 'Churn rate', color: '#0E6B4F', values: [38, 12] }],
      valueFmt: v => v + '%', max: 44, height: 280
    });
  }
  select(0, false);
})();

/* ============ hero mini chart (home) ============ */
(function () {
  const svg = document.getElementById('hero-chart');
  if (!svg) return;
  const title = el('title', {}, svg); title.textContent = 'Sample monthly signups over six months';
  barChart(svg, {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [{ name: 'Signups', color: '#0E6B4F', values: [42, 55, 48, 71, 66, 84] }],
    valueFmt: v => v, height: 240
  });
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { playChart(svg); io.disconnect(); } });
  }, { threshold: 0.3 });
  io.observe(svg);
})();

/* ============ churn case study: segment toggle ============ */
(function () {
  const svg = document.getElementById('churn-chart');
  if (!svg) return;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = {
    monthly: { color: '#C77B2B', values: [9.2, 8.8, 9.5, 8.1, 7.6, 7.2] },
    annual: { color: '#0E6B4F', values: [4.1, 4.3, 3.9, 3.6, 3.4, 3.1] }
  };
  const btns = Array.from(document.querySelectorAll('[data-churn]'));
  function render(mode) {
    svg.innerHTML = '';
    const title = el('title', {}, svg);
    const series = mode === 'both'
      ? [{ name: 'Monthly plan', ...data.monthly }, { name: 'Annual plan', ...data.annual }]
      : [{ name: mode === 'monthly' ? 'Monthly plan' : 'Annual plan', ...(mode === 'monthly' ? data.monthly : data.annual) }];
    title.textContent = 'Sample monthly churn rate, ' + series.map(s => s.name).join(' vs ');
    barChart(svg, { labels: months, series, valueFmt: v => v.toFixed(1) + '%', max: 11, height: 320 });
    playChart(svg);
  }
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    render(b.dataset.churn);
  }));
  render('both');
})();

/* ============ sales case study: region filter ============ */
(function () {
  const svg = document.getElementById('sales-chart');
  if (!svg) return;
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const regions = {
    all:   { label: 'All regions', color: '#0E6B4F', values: [280, 325, 330, 385] },
    north: { label: 'North', color: '#0E6B4F', values: [120, 140, 135, 160] },
    south: { label: 'South', color: '#C77B2B', values: [90, 100, 115, 130] },
    west:  { label: 'West', color: '#2F5D8A', values: [70, 85, 80, 95] }
  };
  const btns = Array.from(document.querySelectorAll('[data-region]'));
  function render(key) {
    const r = regions[key];
    svg.innerHTML = '';
    const title = el('title', {}, svg);
    title.textContent = `Sample quarterly revenue, ${r.label} ($k)`;
    barChart(svg, { labels: quarters, series: [{ name: r.label, color: r.color, values: r.values }], valueFmt: v => '$' + v + 'k', height: 320 });
    playChart(svg);
  }
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    render(b.dataset.region);
  }));
  render('all');
})();

/* ============ loan case study: risk bands ============ */
(function () {
  const svg = document.getElementById('loan-chart');
  if (!svg) return;
  const title = el('title', {}, svg); title.textContent = 'Sample default rate by risk band';
  hbarChart(svg, {
    rows: [
      { label: 'Low risk', value: 2.1, color: '#0E6B4F' },
      { label: 'Medium risk', value: 6.8, color: '#C77B2B' },
      { label: 'High risk', value: 18.4, color: '#B3402A' }
    ],
    valueFmt: v => v.toFixed(1) + '%'
  });
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { playChart(svg); io.disconnect(); } });
  }, { threshold: 0.3 });
  io.observe(svg);
})();

/* ============ projects filter ============ */
(function () {
  const chips = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-tools]'));
  const count = document.getElementById('filter-count');
  if (!chips.length) return;
  function apply(key) {
    let shown = 0;
    cards.forEach(c => {
      const tools = c.dataset.tools.split(' ');
      const ok = key === 'all' || tools.includes(key);
      c.hidden = !ok;
      if (ok) shown++;
    });
    if (count) count.textContent = shown === 1 ? '1 case study' : shown + ' case studies';
  }
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(x => x.setAttribute('aria-pressed', x === ch ? 'true' : 'false'));
    apply(ch.dataset.filter);
  }));
})();

/* ============ contact form (demo) ============ */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const success = document.getElementById('form-success');

  function setErr(name, msg) {
    const field = form.querySelector(`[data-field="${name}"]`);
    const input = form.elements[name];
    const err = field.querySelector('.err');
    if (msg) {
      field.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      err.textContent = msg;
      return false;
    }
    field.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    err.textContent = '';
    return true;
  }
  ['name', 'email', 'message'].forEach(n => {
    const input = form.elements[n];
    input.addEventListener('input', () => setErr(n, ''));
    input.addEventListener('blur', () => validate(n));
  });
  function validate(only) {
    const names = only ? [only] : ['name', 'email', 'message'];
    let ok = true;
    names.forEach(n => {
      const v = form.elements[n].value.trim();
      if (n === 'name' && v.length < 2) ok = setErr(n, 'Please enter your name (at least 2 characters).') && ok;
      if (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) ok = setErr(n, 'Please enter a valid email address.') && ok;
      if (n === 'message' && v.length < 20) ok = setErr(n, 'Tell me a little more — at least 20 characters.') && ok;
    });
    return ok;
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) {
      const first = form.querySelector('.field.invalid input, .field.invalid textarea');
      if (first) first.focus();
      return;
    }
    const consent = form.elements.consent;
    if (!consent.checked) {
      const f = form.querySelector('[data-field="consent"]');
      f.classList.add('invalid');
      f.querySelector('.err').textContent = 'Please tick the consent box so I know how to handle your message.';
      consent.focus();
      return;
    }
    form.hidden = true;
    success.hidden = false;
    success.querySelector('h3').focus();
  });
})();
