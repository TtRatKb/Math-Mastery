import { COURSE, FEEDBACK, ERROR_LABELS, PRACTICE_TIPS } from './content.js';
import { createQuestion, gradeAnswer, explainSolution, guidedHint, guidedErrorHelp } from './math.js';
import { createStore } from './progress.js';

const app = document.querySelector('#app');
const store = createStore();
const $ = (selector) => app.querySelector(selector);
const safe = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lessonById = (id) => COURSE.lessons.find((l) => l.id === id);
const state = { page: 'home', lesson: null, session: null, question: null, tries: 0, errors: new Set(), hint: false, answered: false, bridgePending: false, message: '', feedback: null };
const companions = [
  { id: 'fox', name: 'Fuchs', cost: 0 },
  { id: 'owl', name: 'Eule', cost: 35 },
  { id: 'rabbit', name: 'Hase', cost: 55 }
];

function icon(name) {
  const parts = {
    path: '<path d="M4 16c4-12 8 10 14-2s8-10 12-9"/><circle cx="4" cy="16" r="2"/><circle cx="30" cy="5" r="2"/>',
    book: '<path d="M3 5c6-2 11-1 14 2 3-3 8-4 14-2v23c-6-2-11-1-14 2-3-3-8-4-14-2zM17 7v23"/>',
    arrow: '<path d="M5 16h23m-8-8 8 8-8 8"/>',
    check: '<path d="m5 17 7 7L27 9"/>',
    backup: '<path d="M16 4v19m-7-7 7 7 7-7M5 27h22"/>',
    light: '<path d="M12 22h8m-7 5h6M16 3a10 10 0 0 0-6 18v1h12v-1A10 10 0 0 0 16 3z"/>',
    medal: '<circle cx="16" cy="21" r="8"/><path d="M8 2l4 11m12-11-4 11"/>',
    back: '<path d="M27 16H4m8-8-8 8 8 8"/>',
    family: '<circle cx="11" cy="10" r="5"/><circle cx="23" cy="12" r="4"/><path d="M2 29c0-7 4-11 9-11s9 4 9 11m0-10c6 0 10 4 10 10"/>',
    star: '<path d="m16 3 4 9 10 1-8 7 2 10-8-5-8 5 2-10-8-7 10-1z"/>'
  };
  return `<svg class="icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${parts[name] || parts.path}</svg>`;
}
function companionArt(id) {
  if (id === 'fox') return `<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="#b65e3c" d="M20 18 45 32 60 28 75 32 100 18 96 70 83 89 60 99 37 89 24 70z"/><path fill="#edcba6" d="M25 65 60 88 95 65 83 90 60 101 37 90z"/><path fill="#f1d0a7" d="M28 27 42 43 30 48zm64 0L78 43l12 5z"/><circle cx="44" cy="65" r="3.6" fill="#2e342c"/><circle cx="76" cy="65" r="3.6" fill="#2e342c"/><path fill="#2e342c" d="m54 82 6 4 6-4-6 9z"/></svg>`;
  if (id === 'owl') return `<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="#64745c" d="M26 22 45 33 60 27 75 33 94 22v57a34 34 0 0 1-68 0z"/><ellipse cx="46" cy="65" rx="18" ry="21" fill="#e8dfbf"/><ellipse cx="74" cy="65" rx="18" ry="21" fill="#e8dfbf"/><circle cx="48" cy="65" r="7" fill="#2d332b"/><circle cx="72" cy="65" r="7" fill="#2d332b"/><path d="m54 84 6 8 6-8z" fill="#c57f44"/></svg>`;
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="43" cy="30" rx="11" ry="30" fill="#b8a5bc" transform="rotate(-12 43 30)"/><ellipse cx="78" cy="30" rx="11" ry="30" fill="#b8a5bc" transform="rotate(12 78 30)"/><circle cx="60" cy="72" r="37" fill="#e1d5df"/><circle cx="46" cy="69" r="4" fill="#30343c"/><circle cx="74" cy="69" r="4" fill="#30343c"/><path d="m55 83 5 4 5-4-5 11z" fill="#b17b81"/></svg>`;
}

function nav(page) {
  state.page = page;
  state.feedback = null;
  document.querySelectorAll('[data-nav]').forEach((b) => b.classList.toggle('nav-active', b.dataset.nav === page));
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function banner() {
  return store.persistent ? '' : '<div class="storage-warning" role="status"><strong>Fortschritt konnte nicht gespeichert werden.</strong> Bitte im normalen Browserfenster über eine Website öffnen und vor dem Schließen den Lernstand sichern.</div>';
}
function trailSVG() {
  return `<svg class="trail-art" viewBox="0 0 320 240" role="img" aria-label="Ein geschwungener Lernweg zu vier Etappen"><path d="M40 207 C10 156 85 168 100 120 S180 141 180 90 251 104 284 24" fill="none" stroke="#e7d8c5" stroke-width="27" stroke-linecap="round"/><path d="M40 207 C10 156 85 168 100 120 S180 141 180 90 251 104 284 24" fill="none" stroke="#876e5d" stroke-opacity=".5" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/><g><circle cx="40" cy="207" r="20" fill="#be6547"/><text x="40" y="214" text-anchor="middle" fill="white" font-size="18" font-family="Georgia">1</text><circle cx="111" cy="126" r="20" fill="#e9dbbd"/><text x="111" y="133" text-anchor="middle" fill="#584c3b" font-size="18" font-family="Georgia">2</text><circle cx="191" cy="93" r="20" fill="#e9dbbd"/><text x="191" y="100" text-anchor="middle" fill="#584c3b" font-size="18" font-family="Georgia">3</text><circle cx="284" cy="24" r="20" fill="#e9dbbd"/><text x="284" y="31" text-anchor="middle" fill="#584c3b" font-size="18" font-family="Georgia">4</text></g><path d="m237 165 14 26 14-26m-28 10h28" stroke="#6e7c5a" stroke-width="2" fill="none"/><circle cx="229" cy="202" r="3" fill="#be6547"/><circle cx="246" cy="211" r="3" fill="#be6547"/></svg>`;
}
function renderHome() {
  const n = store.data.records.length;
  const lessonCards = COURSE.lessons.map((l) => {
    const stats = store.lessonStats(l.id);
    return `<article class="stage"><div class="stage-num">${l.number}</div><div class="stage-body"><div class="stage-kicker">${safe(l.kicker)}</div><h3>${safe(l.name)}</h3><p>${safe(l.intro)}</p><div class="stage-bottom"><span>${stats.practiced ? `${stats.practiced} Aufgaben versucht` : 'Noch nicht begonnen'}</span><button data-start="${l.id}" class="button button-dark">${stats.practiced ? 'Weiter üben' : 'Etappe starten'} ${icon('arrow')}</button></div></div></article>`;
  }).join('');
  app.innerHTML = `${banner()}<section class="hero"><div><p class="eyebrow">MATHE, DIE SINN ERGIBT · KAPITEL 01</p><h1>Teilen lernen.<br><em>In deinem Tempo.</em></h1><p class="lede">${safe(COURSE.introduction)} Du kannst jederzeit eine Pause machen – es gibt keine Uhr und keinen Punktevergleich.</p><div class="hero-stats"><span><strong>${n}</strong> Aufgaben geübt</span><span><strong>${store.data.xp}</strong> Erfahrungspunkte</span><span><strong>${Math.floor(store.data.xp / 60) + 1}</strong> Level</span></div></div><div class="hero-illustration">${trailSVG()}</div></section><section class="section-heading"><p class="eyebrow">DEIN LERNWEG</p><h2>Vier kleine Etappen</h2><p>Du darfst dort anfangen, wo du gerade Hilfe brauchst.</p></section><div class="stages">${lessonCards}</div><div class="quiet-note">Hier zählt, dass du etwas verstehst – nicht, wie schnell du fertig wirst.</div>`;
}
function model(groups, perGroup, title = 'So sieht das Verteilen aus') {
  return `<div class="math-model" aria-label="${groups} Gruppen mit je ${perGroup} Punkten"><div class="model-title">${safe(title)}</div><div class="model-grid">${Array.from({ length: groups }, (_, k) => `<div class="model-bowl" aria-label="Gruppe ${k + 1} mit ${perGroup} Punkten">${Array.from({ length: perGroup }, () => '<i class="pebble" aria-hidden="true"></i>').join('')}</div>`).join('')}</div><p>In jeder Gruppe liegen gleich viele Punkte.</p></div>`;
}
function renderIntro() {
  const l = lessonById(state.lesson);
  app.innerHTML = `${banner()}<button class="back-link" data-go="home">${icon('back')} Zur Übersicht</button><section class="lesson-intro"><div class="lesson-intro-heading"><p class="eyebrow">ETAPPE ${l.number} · ${safe(l.kicker)}</p><h1>${safe(l.name)}</h1><p class="lede">${safe(l.intro)}</p></div><div class="teaching-card"><span class="teaching-tag">ZUERST VERSTEHEN</span><h2>So funktioniert das</h2><p>${safe(l.explanation)}</p>${l.kind === 'share' ? model(3, 4, '12 Punkte gerecht verteilen') : `<div class="example-equation">${l.kind === 'remainder' ? '14 : 3 = 4 Rest 2' : '3 · 4 = 12 <span>↔</span> 12 : 3 = 4'}</div>`}</div><div class="intro-footer"><p>${l.count} kurze Aufgaben · ohne Zeitlimit · mit Tipps</p><button class="button button-primary" data-action="begin">Jetzt ausprobieren ${icon('arrow')}</button></div></section>`;
}
function nextQuestion() {
  const l = lessonById(state.lesson);
  if (state.session.done >= l.count) { nav('complete'); return; }
  let q;
  for (let i = 0; i < 20; i++) {
    q = createQuestion(l.kind, { bridge: state.bridgePending });
    if (!state.session.seen.includes(q.signature)) break;
  }
  state.bridgePending = false;
  state.session.seen.push(q.signature);
  state.session.seen = state.session.seen.slice(-15);
  state.question = q;
  state.tries = 0;
  state.errors = new Set();
  state.hint = false;
  state.answered = false;
  state.feedback = null;
  renderQuestion();
}
function prompt(q) {
  if (q.kind === 'share') return `Du hast ${q.total} Steine und ${q.divisor} Schalen. Wie viele Steine kommen in jede Schale?`;
  if (q.kind === 'inverse') return `Welche Zahl fehlt? ${q.divisor} · ? = ${q.total}`;
  if (q.kind === 'remainder') return `Wie viel ist ${q.total} : ${q.divisor}? Gib auch den Rest an.`;
  return `Wie viel ist ${q.total} : ${q.divisor}?`;
}
function renderQuestion() {
  const l = lessonById(state.lesson), q = state.question;
  const pct = state.session.done * 100 / l.count;
  app.innerHTML = `${banner()}<section class="exercise"><div class="exercise-top"><div><p class="eyebrow">ETAPPE ${l.number} · ${safe(l.name)}</p><h1>Aufgabe ${state.session.done + 1} <span>von ${l.count}</span></h1></div><button class="back-link" data-go="home">Für heute fertig</button></div><div class="meter" role="progressbar" aria-valuenow="${state.session.done}" aria-valuemin="0" aria-valuemax="${l.count}"><div style="width:${pct}%"></div></div><div class="exercise-card"><div class="exercise-marker">${q.bridge ? 'EIN SCHRITT ZURÜCK – MIT LEICHTEREN ZAHLEN' : 'JETZT BIST DU DRAN'}</div><h2 class="prompt">${safe(prompt(q))}</h2>${q.kind === 'share' ? `<div class="count-line" aria-label="${q.total} Punkte">${Array.from({ length: q.total }, () => '<i class="pebble" aria-hidden="true"></i>').join('')}</div>` : `<div class="math-display">${q.kind === 'inverse' ? `${q.divisor} <span>·</span> ? <span>=</span> ${q.total}` : `${q.total} <span>:</span> ${q.divisor} <span>=</span> ?`}</div>`}<p class="input-help">Schreib deine Antwort hier hinein:</p><form id="answer-form" novalidate><div class="answer-area"><label>Ergebnis<input id="quotient" class="answer-input" type="text" inputmode="numeric" autocomplete="off" placeholder="?" aria-describedby="feedback"></label>${q.kind === 'remainder' ? '<label>Rest<input id="remainder" class="answer-input" type="text" inputmode="numeric" autocomplete="off" placeholder="?" aria-describedby="feedback"></label>' : ''}<button type="submit" id="check" class="button button-primary">Prüfen ${icon('check')}</button></div></form><div id="feedback" role="status" aria-live="polite"></div><div class="exercise-actions"><button class="button button-quiet" data-action="hint">${icon('light')} Tipp ansehen</button><button class="button button-quiet" data-action="solution" style="display:none">Lösung erklären</button></div><div id="hint-panel"></div></div><p class="reassurance">Fehler gehören zum Lernen. Du kannst es in Ruhe noch einmal versuchen.</p></section>`;
  $('#answer-form').addEventListener('submit', checkAnswer);
  $('#quotient').focus({ preventScroll: true });
}
function renderFeedback(text, type = 'info') {
  const target = $('#feedback');
  if (!target) return;
  target.innerHTML = `<div class="feedback ${type}">${safe(text)}</div>`;
}
function toggleHint() {
  state.hint = !state.hint;
  const q = state.question;
  const hint = guidedHint(q);
  const content = state.hint ? `<div class="hint-box"><h3>Ein kleiner Denkanstoß</h3><p>${safe(hint.text)}</p>${hint.model ? model(hint.model.groups, hint.model.perGroup, 'Die erste Runde: je ein Stein') : ''}</div>` : '';
  $('#hint-panel').innerHTML = content;
}
function recordQuestion(solved) {
  const l = lessonById(state.lesson);
  const codes = [...state.errors];
  const firstTry = solved && state.tries === 1 && !state.hint;
  const existing = Object.fromEntries(codes.map((code) => [code, store.data.errorCounts[`${l.id}:${code}`] || 0]));
  store.record({ lesson: l.id, solved, firstTry, hintsUsed: state.hint, errorCodes: codes, bridge: state.question.bridge });
  state.session.results.push({ solved, firstTry });
  for (const code of codes) {
    if (code === 'other') continue;
    const n = store.data.errorCounts[`${l.id}:${code}`] || 0;
    if (n >= 2 && n % 2 === 0 && n > (existing[code] || 0)) state.bridgePending = true;
  }
  return firstTry;
}
function lockAndContinue() {
  state.answered = true;
  $('#answer-form').hidden = true;
  $('.exercise-actions').hidden = true;
  const btn = document.createElement('button');
  btn.className = 'button button-primary next-button';
  btn.dataset.action = 'next';
  btn.innerHTML = `Weiter ${icon('arrow')}`;
  $('#feedback').appendChild(btn);
}
function checkAnswer(event) {
  event.preventDefault();
  if (state.answered) return;
  const q = state.question;
  const result = gradeAnswer(q, $('#quotient').value, $('#remainder')?.value);
  if (result.status === 'invalid') { renderFeedback(result.message, 'warning'); $(result.field === 'remainder' ? '#remainder' : '#quotient').focus(); return; }
  state.tries++;
  if (result.status === 'correct') {
    const firstTry = recordQuestion(true);
    renderFeedback(`Richtig! ${explainSolution(q)} ${firstTry ? '+12' : '+8'} Erfahrungspunkte.`, 'success');
    lockAndContinue();
    return;
  }
  state.errors.add(result.error);
  renderFeedback(guidedErrorHelp(q, result.error, $('#quotient').value), 'warning');
  if (state.tries >= 2) $('.exercise-actions [data-action="solution"]').style.display = '';
  $(result.error === 'remainder_missing' || result.error === 'remainder_incorrect' ? '#remainder' : '#quotient').select();
}
function showSolution() {
  if (state.answered) return;
  recordQuestion(false);
  renderFeedback(`So geht es: ${explainSolution(state.question)} Du darfst eine ähnliche Aufgabe später erneut versuchen.`, 'info');
  lockAndContinue();
}
function renderComplete() {
  const l = lessonById(state.lesson);
  const done = state.session.results.length;
  const correct = state.session.results.filter((x) => x.solved).length;
  const first = state.session.results.filter((x) => x.firstTry).length;
  app.innerHTML = `<div class="finish"><div class="finish-symbol">${icon('medal')}</div><p class="eyebrow">ETAPPE ${l.number}</p><h1>Du hast geübt.</h1><p class="lede">Das ist ein guter Schritt. Du musst heute nichts mehr schaffen.</p><div class="finish-numbers"><div><strong>${done}</strong><span>Aufgaben angeschaut</span></div><div><strong>${correct}</strong><span>selbst gelöst</span></div><div><strong>${first}</strong><span>gleich richtig</span></div></div><p>Du kannst diese Etappe jederzeit wiederholen. Auch mit Fehlern geht dein Lernweg weiter.</p><div class="finish-buttons"><button class="button button-quiet" data-go="home">Zum Lernweg</button><button class="button button-primary" data-start="${l.id}">Noch einmal üben ${icon('arrow')}</button></div></div>`;
}
function renderRewards() {
  const practiced = store.data.records.length;
  const milestones = [
    { title: 'Erster Schritt', detail: 'Eine Aufgabe ausprobiert', reached: practiced >= 1 },
    { title: 'Drangeblieben', detail: 'Zehn Aufgaben ausprobiert', reached: practiced >= 10 },
    { title: 'Weitergedacht', detail: 'Eine Aufgabe nach einem Fehler gelöst', reached: store.data.records.some(r => r.solved && !r.firstTry) },
    { title: 'Entdecker', detail: 'Alle vier Etappen ausprobiert', reached: COURSE.lessons.every(l => store.lessonStats(l.id).practiced > 0) }
  ];
  const stamps = milestones.map((m, idx) => `<div class="stamp ${m.reached ? 'unlocked' : ''}"><span class="stamp-mark">${String(idx + 1).padStart(2, '0')}</span><div><strong>${m.title}</strong><p>${m.detail}</p></div><span class="stamp-status">${m.reached ? 'Erreicht' : 'Noch offen'}</span></div>`).join('');
  const cards = companions.map((c) => {
    const owned = store.data.owned.includes(c.id);
    const selected = store.data.companion === c.id;
    return `<article class="companion-card ${selected ? 'selected' : ''}"><div class="companion-pic">${companionArt(c.id)}</div><h3>${c.name}</h3><p>${selected ? 'Dein Begleiter' : owned ? 'Schon freigeschaltet' : `${c.cost} Münzen`}</p><button class="button ${selected ? 'button-quiet' : 'button-dark'}" data-companion="${c.id}" ${selected ? 'disabled' : ''}>${selected ? 'Ausgewählt' : owned ? 'Auswählen' : 'Freischalten'}</button></article>`;
  }).join('');
  app.innerHTML = `${banner()}<section class="section-heading"><p class="eyebrow">FÜR DEINE LERNREISE</p><h1>Deine Sammlung</h1><p>Du bekommst beim Üben Münzen. Damit kannst du einen Begleiter aussuchen – völlig ohne Wettbewerb.</p><div class="balance"><span>${store.data.coins} Münzen</span><span>${store.data.xp} Erfahrungspunkte</span></div></section><div class="companions">${cards}</div><p id="shop-info" class="inline-status" role="status"></p><section class="milestone-section"><p class="eyebrow">DEINE MEILENSTEINE</p><h2>Was du schon geschafft hast</h2><div class="stamps">${stamps}</div></section>`;
}
function saveFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function renderFamily() {
  const rows = COURSE.lessons.map((l) => {
    const s = store.lessonStats(l.id);
    return `<div class="family-row"><strong>${l.number} · ${safe(l.name)}</strong><span>${s.practiced} ausprobiert · ${s.solved} gelöst · ${s.firstTry} direkt richtig</span></div>`;
  }).join('');
  const errors = Object.entries(store.data.errorCounts).filter(([key, n]) => n >= 2 && !key.endsWith(':other'))
    .sort((a, b) => b[1] - a[1]).slice(0, 4).map(([key, n]) => {
      const code = key.substring(key.indexOf(':') + 1);
      return `<li><strong>${safe(ERROR_LABELS[code] || 'Unsicherheit')}</strong> – bei ${n} bearbeiteten Aufgaben beobachtet${PRACTICE_TIPS[code] ? `<p class="parent-tip">Zum Ausprobieren: ${safe(PRACTICE_TIPS[code])}</p>` : ''}</li>`;
    }).join('');
  app.innerHTML = `${banner()}<section class="family-head"><p class="eyebrow">GEMEINSAM ANSCHAUEN</p><h1>Unser Lernstand</h1><p>Diese Übersicht ist auf diesem Gerät gespeichert. Sie ist keine Note und keine Diagnose.</p></section><section class="family-stats"><div><strong>${store.data.records.length}</strong><span>Aufgaben angeschaut</span></div><div><strong>${store.data.records.filter(x => x.solved).length}</strong><span>selbst gelöst</span></div><div><strong>${store.data.xp}</strong><span>Erfahrungspunkte</span></div></section><div class="family-layout"><section class="panel"><h2>Geübte Etappen</h2>${rows}</section><section class="panel"><h2>Was hilft beim Weiterlernen?</h2>${errors ? `<p>Bei mehreren verschiedenen Aufgaben gab es ähnliche Antworten:</p><ul class="error-list">${errors}</ul><p class="muted">Das sind nur Hinweise aus Antwortmustern, keine gesicherten Ursachen.</p>` : '<p>Im Moment sind keine wiederkehrenden Fehlermuster erkennbar. Das ist völlig in Ordnung.</p>'}</section></div><section class="panel export-panel"><h2>Lernstand behalten</h2><p>Der Fortschritt bleibt nur in diesem Browser erhalten. Beim Löschen der Browserdaten kann er verschwinden. Mit einer Sicherungsdatei lässt er sich wiederherstellen.</p><div class="export-actions"><button class="button button-dark" data-action="export">${icon('backup')} Sicherung speichern</button><label class="button button-quiet file-picker">Sicherung laden<input type="file" id="import-file" accept="application/json,.json"></label><button class="button button-quiet danger" data-action="reset">Lernstand löschen</button></div><p class="inline-status" id="family-message" role="status"></p></section>`;
  $('#import-file').addEventListener('change', importProgress);
}
async function importProgress(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const contents = await file.text();
    if (!window.confirm('Den Lernstand hier durch die Sicherung ersetzen?')) return;
    store.import(contents); renderFamily();
  } catch (err) { $('#family-message').textContent = err.message; }
}
function render() {
  if (state.page === 'home') renderHome();
  else if (state.page === 'intro') renderIntro();
  else if (state.page === 'question') renderQuestion();
  else if (state.page === 'complete') renderComplete();
  else if (state.page === 'rewards') renderRewards();
  else if (state.page === 'family') renderFamily();
}
function start(id) {
  if (!lessonById(id)) return;
  state.lesson = id; state.session = { done: 0, results: [], seen: [] }; state.bridgePending = false;
  nav('intro');
}
app.addEventListener('click', (e) => {
  const el = e.target.closest('button');
  if (!el) return;
  if (el.dataset.start) { start(el.dataset.start); return; }
  if (el.dataset.go) { nav(el.dataset.go); return; }
  if (el.dataset.companion) {
    const c = companions.find(x => x.id === el.dataset.companion);
    if (!c) return;
    if (!store.data.owned.includes(c.id)) {
      if (store.data.coins < c.cost) { $('#shop-info').textContent = 'Dafür fehlen noch Münzen. Du kannst ganz in Ruhe weiterüben.'; return; }
      store.data.coins -= c.cost; store.data.owned.push(c.id);
    }
    store.data.companion = c.id; store.save(); renderRewards(); return;
  }
  const action = el.dataset.action;
  if (action === 'begin') { state.page = 'question'; nextQuestion(); }
  else if (action === 'next') { state.session.done++; nextQuestion(); }
  else if (action === 'hint') toggleHint();
  else if (action === 'solution') showSolution();
  else if (action === 'export') saveFile('mathepfad-lernstand.json', store.export(), 'application/json');
  else if (action === 'reset' && window.confirm('Den gespeicherten Lernstand auf diesem Gerät wirklich löschen?')) { store.reset(); renderFamily(); }
});
document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => nav(button.dataset.nav)));
render();
