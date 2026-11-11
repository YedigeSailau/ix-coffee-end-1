// ---------- loyalty page: levels, calculator, cup shelf, join form ----------
const LEVELS = [
  { name: 'Guest',   from: 0,    perks: ['Collect pumpkin points'] },
  { name: 'Regular', from: 100,  perks: ['Free drink in your birthday week'] },
  { name: 'Insider', from: 400,  perks: ['Secret Ingredient: your own drink for a month'] },
  { name: 'Legend',  from: 1000, perks: ['Fast Track in rush hour (top 10%)', 'Personal Cup on the shelf'] }
];
const POINT_RATE = 100;      // 1 point per 100 tenge
const WEEKS_IN_SEASON = 12;  // one autumn season

const CUPS = [
  { name: 'Aigerim', color: '#F28A1E', since: 'September', drink: 'Ghost Latte (her own recipe)', visits: 44 },
  { name: 'Daniyar', color: '#7B4B94', since: 'October',   drink: 'Black Sesame Mocha',           visits: 41 },
  { name: 'Madina',  color: '#8A9A4B', since: 'September', drink: 'Pumpkin Spice Latte, oat milk', visits: 39 },
  { name: 'Timur',   color: '#EFE6D2', since: 'August',    drink: 'Cobweb Cold Brew',             visits: 37 },
  { name: 'Alina',   color: '#C4572B', since: 'October',   drink: 'Caramel Apple Cider',          visits: 35 }
];
const TIER_SIZE = 3;

function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') + ' ₸'; }

function seasonPoints(visitsPerWeek, check) {
  return Math.floor(visitsPerWeek * WEEKS_IN_SEASON * check / POINT_RATE);
}

function levelIndex(points) {
  let index = 0;
  LEVELS.forEach((lvl, i) => { if (points >= lvl.from) index = i; });
  return index;
}

function renderStatus() {
  const visits = Number(document.getElementById('visits').value);
  const check = Number(document.getElementById('check').value);
  const points = seasonPoints(visits, check);
  const index = levelIndex(points);
  const next = LEVELS[index + 1];

  document.getElementById('visitsOut').textContent = visits;
  document.getElementById('checkOut').textContent = money(check);
  document.getElementById('statusName').textContent = LEVELS[index].name;
  document.getElementById('statusPoints').textContent = points;

  let percent = 100;
  if (next) {
    const span = next.from - LEVELS[index].from;
    percent = Math.round((points - LEVELS[index].from) / span * 100);
    document.getElementById('statusNext').textContent = (next.from - points) + ' points to ' + next.name;
  } else {
    document.getElementById('statusNext').textContent = 'top level reached';
  }
  const bar = document.getElementById('statusBar');
  bar.style.width = percent + '%';
  bar.parentElement.setAttribute('aria-valuenow', percent);

  // perks: unlocked or locked
  const list = document.getElementById('statusPerks');
  list.replaceChildren();
  LEVELS.forEach((lvl, i) => lvl.perks.forEach(text => {
    const li = document.createElement('li');
    li.className = i <= index ? 'perk-on' : 'perk-off';
    li.textContent = (i <= index ? '✓ ' : '🔒 ') + text;
    list.append(li);
  }));

  // highlight the matching level card
  document.querySelectorAll('.level').forEach(card => {
    card.classList.toggle('is-current', Number(card.dataset.level) === index);
  });
}

function cupSvg(color, letter, empty) {
  const body = empty
    ? 'fill="rgba(242,138,30,.12)" stroke="#F28A1E" stroke-width="2" stroke-dasharray="5 5"'
    : 'fill="' + color + '"';
  const handle = empty ? 'stroke="#F28A1E" stroke-dasharray="5 5"' : 'stroke="' + color + '"';
  return '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<path d="M10 16h36v18a16 16 0 0 1-16 16h-4a16 16 0 0 1-16-16z" ' + body + '/>' +
    '<path d="M46 22h5a7 7 0 0 1 0 14h-6" fill="none" ' + handle + ' stroke-width="5"/>' +
    (empty ? '' : '<path d="M14.5 23v9" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="28" cy="16" rx="18" ry="3.5" fill="#1F130E" fill-opacity=".4"/>') +
    '<text x="28" y="38" text-anchor="middle" font-family="Young Serif, serif" font-size="19" fill="' + (empty ? '#F28A1E' : '#1F130E') + '" fill-opacity="' + (empty ? '1' : '.6') + '">' + letter + '</text></svg>';
}

let engraved = '';

function showCup(cup, slot) {
  document.querySelectorAll('.cup-slot').forEach(s => s.classList.toggle('is-selected', s === slot));
  const empty = !cup;
  const name = empty ? (engraved || 'Your cup') : cup.name;
  document.getElementById('cupTitle').textContent = name;
  document.getElementById('cupLevel').textContent = empty ? 'Waiting for you' : 'Legend';
  document.getElementById('cupBig').innerHTML = empty
    ? cupSvg('', (engraved[0] || '?').toUpperCase(), true)
    : cupSvg(cup.color, cup.name[0], false);
  const facts = document.getElementById('cupFacts');
  facts.replaceChildren();
  const rows = empty
    ? [['Unlocks at', 'Legend level (top 10%)'], ['Needs', '1 000 points in a season'], ['Served', 'only to you']]
    : [['Legend since', cup.since], ['Usual order', cup.drink], ['Visits this season', String(cup.visits)]];
  rows.forEach(([k, v]) => {
    const li = document.createElement('li');
    const key = document.createElement('span'); key.textContent = k;
    const val = document.createElement('strong'); val.textContent = v;
    li.append(key, val);
    facts.append(li);
  });
}

function renderShelf() {
  const shelf = document.getElementById('shelfUnit');
  const items = CUPS.map(c => ({ cup: c })).concat([{ cup: null }]);
  let emptySlot = null;
  for (let i = 0; i < items.length; i += TIER_SIZE) {
    const tier = document.createElement('div');
    tier.className = 'shelf-tier';
    items.slice(i, i + TIER_SIZE).forEach(({ cup }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cup-slot' + (cup ? '' : ' cup-empty');
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('aria-label', cup ? cup.name + "'s cup" : 'Your empty cup');
      btn.innerHTML = cupSvg(cup ? cup.color : '', cup ? cup.name[0] : '?', !cup);
      const label = document.createElement('span');
      label.className = 'cup-name';
      label.textContent = cup ? cup.name : 'Yours?';
      btn.append(label);
      const pick = () => showCup(cup, btn);
      btn.addEventListener('click', pick);
      btn.addEventListener('mouseenter', pick);
      btn.addEventListener('focus', pick);
      if (!cup) emptySlot = btn;
      tier.append(btn);
    });
    const board = document.createElement('div');
    board.className = 'shelf-board';
    board.setAttribute('aria-hidden', 'true');
    shelf.append(tier, board);
  }
  // engraving: typing a name fills the empty cup
  document.getElementById('engrave').addEventListener('input', e => {
    engraved = e.target.value.trim();
    emptySlot.innerHTML = cupSvg('', (engraved[0] || '?').toUpperCase(), true);
    const label = document.createElement('span');
    label.className = 'cup-name';
    label.textContent = engraved || 'Yours?';
    emptySlot.append(label);
    showCup(null, emptySlot);
  });
  showCup(CUPS[0], shelf.querySelector('.cup-slot'));
}

// ---------- join form validation ----------
function setError(input, message) {
  const box = document.getElementById(input.id + '-error');
  if (message) {
    input.classList.add('is-invalid'); input.classList.remove('is-valid');
    input.setAttribute('aria-invalid', 'true');
    box.textContent = message;
    if (input.type === 'checkbox') box.hidden = false;
  } else {
    input.classList.remove('is-invalid');
    if (input.type !== 'checkbox') input.classList.add('is-valid');
    input.removeAttribute('aria-invalid');
    box.textContent = '';
    if (input.type === 'checkbox') box.hidden = true;
  }
  return !message;
}

function checkName(input) {
  const v = input.value.trim();
  if (!v) return setError(input, 'Please enter your name.');
  if (v.length < 2) return setError(input, 'The name must have at least 2 characters.');
  if (!/^[\p{L}][\p{L} '’-]*$/u.test(v)) return setError(input, 'Use letters only.');
  return setError(input, '');
}

function checkEmail(input) {
  const v = input.value.trim();
  if (!v) return setError(input, 'Please enter your email.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setError(input, 'Enter a valid email, for example name@mail.com.');
  return setError(input, '');
}

function checkAgree(input) {
  return setError(input, input.checked ? '' : 'Please tick the box to join.');
}

function setupJoinForm() {
  const form = document.getElementById('joinForm');
  const name = document.getElementById('jname');
  const email = document.getElementById('jemail');
  const agree = document.getElementById('jagree');
  name.addEventListener('blur', () => checkName(name));
  email.addEventListener('blur', () => checkEmail(email));
  [name, email].forEach(i => i.addEventListener('input', () => { if (i.classList.contains('is-invalid')) (i === name ? checkName : checkEmail)(i); }));
  agree.addEventListener('change', () => checkAgree(agree));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = [checkName(name), checkEmail(email), checkAgree(agree)].every(Boolean);
    if (!ok) { form.querySelector('.is-invalid').focus(); return; }
    const number = 'IX-' + String(Math.floor(1000 + Math.random() * 9000));
    document.getElementById('joinMsg').textContent = 'Welcome, ' + name.value.trim() + '! Your club card number is ' + number + '. Show it at the counter on your next visit.';
    document.dispatchEvent(new CustomEvent('join:done'));
    form.reset();
    form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
  });
}

document.getElementById('visits').addEventListener('input', renderStatus);
document.getElementById('check').addEventListener('input', renderStatus);
renderStatus();
renderShelf();
setupJoinForm();

// ---------- card builder ----------
const CARD_LEVELS = [
  { id: 'regular', name: 'Regular', pct: 5,  perk: 'Birthday-week drink' },
  { id: 'insider', name: 'Insider', pct: 10, perk: 'Secret Ingredient session' },
  { id: 'legend',  name: 'Legend',  pct: 15, perk: 'Fast Track + Personal Cup' }
];
const CARD_THEMES = [
  { id: 'pumpkin', name: 'Pumpkin', c1: '#FFB04D', c2: '#D2601E', text: '#1F130E' },
  { id: 'plum',    name: 'Plum',    c1: '#9A62B3', c2: '#3A2140', text: '#EFE6D2' },
  { id: 'moss',    name: 'Moss',    c1: '#B4C46A', c2: '#6B7A36', text: '#1F130E' },
  { id: 'bone',    name: 'Bone',    c1: '#F6EEDB', c2: '#C9BB9A', text: '#1F130E' }
];
const CARD_STICKERS = ['🎃', '🦇', '👻', '☕', '🍂'];
const cardState = { level: 'insider', theme: 'pumpkin', sticker: '🎃' };

function makeOption(group, value, labelNode, checked, ariaLabel) {
  const label = document.createElement('label');
  label.className = 'opt';
  const input = document.createElement('input');
  input.type = 'radio'; input.name = group; input.value = value; input.className = 'opt-input';
  input.checked = checked;
  if (ariaLabel) input.setAttribute('aria-label', ariaLabel);
  const body = document.createElement('span');
  body.className = 'opt-body';
  body.append(labelNode);
  label.append(input, body);
  input.addEventListener('change', () => { cardState[group] = value; renderCard(); });
  return label;
}

function buildCardOptions() {
  const lv = document.getElementById('optLevel');
  CARD_LEVELS.forEach(l => lv.append(makeOption('level', l.id, document.createTextNode(l.name + ' · ' + l.pct + '%'), l.id === cardState.level)));
  const th = document.getElementById('optTheme');
  CARD_THEMES.forEach(t => {
    const dot = document.createElement('span');
    dot.className = 'swatch';
    dot.style.background = 'linear-gradient(135deg,' + t.c1 + ',' + t.c2 + ')';
    th.append(makeOption('theme', t.id, dot, t.id === cardState.theme, t.name));
  });
  const st = document.getElementById('optSticker');
  CARD_STICKERS.forEach(s => st.append(makeOption('sticker', s, document.createTextNode(s), s === cardState.sticker, 'Sticker ' + s)));
}

function cardNumber(name) {
  let hash = 7;
  for (const ch of name + cardState.level) hash = (hash * 31 + ch.codePointAt(0)) % 10000;
  return 'IX-' + String(hash).padStart(4, '0');
}

function currentLevel() { return CARD_LEVELS.find(l => l.id === cardState.level); }
function currentTheme() { return CARD_THEMES.find(t => t.id === cardState.theme); }

function renderCard() {
  const name = document.getElementById('cname').value.trim();
  const lvl = currentLevel(), th = currentTheme();
  const card = document.getElementById('clubCard');
  card.style.setProperty('--c1', th.c1);
  card.style.setProperty('--c2', th.c2);
  card.style.setProperty('--ct', th.text);
  document.getElementById('ccName').textContent = name || 'Your name';
  document.getElementById('ccLevel').textContent = lvl.name;
  document.getElementById('ccPct').textContent = '\u2212' + lvl.pct + '%';
  document.getElementById('ccPerk').textContent = lvl.perk;
  document.getElementById('ccSticker').textContent = cardState.sticker;
  document.getElementById('ccNo').textContent = cardNumber(name);
  card.setAttribute('aria-label', 'Club card for ' + (name || 'you') + ', ' + lvl.name + ', ' + lvl.pct + '% discount, pick up at the nearest IX Coffee point');
  document.dispatchEvent(new CustomEvent('card:changed'));
}

function checkNick(input) {
  const v = input.value.trim();
  if (!v) return setError(input, 'Type a name or a nickname.');
  if (v.length < 2) return setError(input, 'At least 2 characters, please.');
  if (!/^[\p{L}\p{N}][\p{L}\p{N} ._'’-]*$/u.test(v)) return setError(input, 'Use letters, digits, spaces and . _ - only.');
  return setError(input, '');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function downloadCard() {
  const input = document.getElementById('cname');
  if (!checkNick(input)) { input.focus(); return; }
  const name = input.value.trim(), lvl = currentLevel(), th = currentTheme();
  try { await Promise.all([document.fonts.load('48px "Young Serif"'), document.fonts.load('600 30px "Figtree"')]); } catch (e) { /* fall back to system fonts */ }
  const W = 1012, H = 638;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, th.c1); grad.addColorStop(1, th.c2);
  roundRect(ctx, 0, 0, W, H, 44); ctx.fillStyle = grad; ctx.fill();
  ctx.save(); roundRect(ctx, 0, 0, W, H, 44); ctx.clip();
  const sheen = ctx.createLinearGradient(0, 0, W * .7, H * .8);
  sheen.addColorStop(0, 'rgba(255,255,255,.38)'); sheen.addColorStop(.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen; ctx.fillRect(0, 0, W, H); ctx.restore();
  roundRect(ctx, 2, 2, W - 4, H - 4, 43); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.stroke();

  ctx.fillStyle = th.text; ctx.textBaseline = 'alphabetic';
  ctx.font = '44px "Young Serif", serif'; ctx.textAlign = 'left'; ctx.fillText('IX Coffee', 56, 96);
  ctx.font = '64px serif'; ctx.textAlign = 'right'; ctx.fillText(cardState.sticker, W - 56, 100);
  let size = 82; ctx.textAlign = 'left';
  do { ctx.font = size + 'px "Young Serif", serif'; size -= 4; } while (ctx.measureText(name).width > W - 112 && size > 30);
  ctx.fillText(name, 56, 232);
  ctx.globalAlpha = .75; ctx.font = '600 30px "Figtree", sans-serif'; ctx.fillText(lvl.name.toUpperCase() + ' · REGULARS CLUB', 56, 278); ctx.globalAlpha = 1;
  ctx.font = '150px "Young Serif", serif'; ctx.fillText('\u2212' + lvl.pct + '%', 52, 440);
  const pctWidth = ctx.measureText('\u2212' + lvl.pct + '%').width;
  ctx.font = '600 34px "Figtree", sans-serif'; ctx.fillText('on every order', 52 + pctWidth + 28, 396);
  ctx.globalAlpha = .8; ctx.font = '28px "Figtree", sans-serif'; ctx.fillText(lvl.perk, 52 + pctWidth + 28, 436); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(31,19,14,.18)'; roundRect(ctx, 40, 478, W - 80, 120, 28); ctx.fill();
  ctx.fillStyle = th.text; ctx.font = '600 32px "Figtree", sans-serif'; ctx.fillText('\uD83D\uDCCD Pick up at the nearest IX Coffee point', 70, 531);
  ctx.globalAlpha = .8; ctx.font = '26px "Figtree", sans-serif'; ctx.fillText('Turan Ave 39/3, Astana · daily 8:00–22:00', 70, 574);
  ctx.textAlign = 'right'; ctx.font = '600 28px "Figtree", sans-serif'; ctx.fillText(cardNumber(name), W - 70, 574);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ix-coffee-card-' + name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-') + '.png';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById('cardMsg').textContent = 'Your card is saved as a PNG. Show it at the counter.';
    document.dispatchEvent(new CustomEvent('card:saved'));
  }, 'image/png');
}

function setupCardBuilder() {
  const input = document.getElementById('cname');
  buildCardOptions();
  input.addEventListener('input', () => { if (input.classList.contains('is-invalid')) checkNick(input); renderCard(); });
  input.addEventListener('blur', () => { if (input.value) checkNick(input); });
  document.getElementById('cardDownload').addEventListener('click', downloadCard);
  document.getElementById('cardJoin').addEventListener('click', () => {
    if (!checkNick(input)) { input.focus(); return; }
    const jname = document.getElementById('jname');
    jname.value = input.value.trim();
    checkName(jname);
    document.getElementById('join').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    document.getElementById('jemail').focus({ preventScroll: true });
  });
  // the shine follows the pointer
  const card = document.getElementById('clubCard');
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
  renderCard();
}
setupCardBuilder();
