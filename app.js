/* ============================================================
   Klokkelab – lær å lese digital klokke
   Ren HTML/CSS/JS. Progresjon lagres i localStorage.
   ============================================================ */

/* ---------- 1. Klokkeslett til norsk tekst ---------- */

const HOUR_WORDS = ['tolv','ett','to','tre','fire','fem','seks','sju','åtte','ni','ti','elleve'];
const NUM_WORDS  = ['','ett','to','tre','fire','fem','seks','sju','åtte','ni','ti','elleve','tolv','tretten','fjorten'];

const hourWord = h => HOUR_WORDS[((h % 12) + 12) % 12];

/** "fem", "ti" eller "tre minutter" / "ett minutt" */
function minuteWord(n){
  const w = NUM_WORDS[n] || String(n);
  if (n === 5 || n === 10) return w;          // fem over, ti på halv …
  if (n === 1) return w + ' minutt';
  return w + ' minutter';
}

/** Som minuteWord, men alltid med enhet: "ti minutter" */
function minuteWordFull(n){
  return (NUM_WORDS[n] || String(n)) + (n === 1 ? " minutt" : " minutter");
}

function dayPart(h){
  if (h === 12) return 'midt på dagen';
  if (h < 6)  return 'på natta';
  if (h < 10) return 'om morgenen';
  if (h < 12) return 'på formiddagen';
  if (h < 18) return 'på ettermiddagen';
  if (h < 23) return 'på kvelden';
  return 'på natta';
}

/** Digital visning, f.eks. 07:05 */
const pad = n => String(n).padStart(2, '0');
const digital = (h, m) => `${pad(h)}:${pad(m)}`;

/** Norsk talemåte for et klokkeslett. */
function timeText(h, m, withDayPart){
  const cur = hourWord(h);
  const nxt = hourWord(h + 1);
  let core;
  if (m === 0)       core = `klokka ${cur}`;
  else if (m === 15) core = `kvart over ${cur}`;
  else if (m === 30) core = `halv ${nxt}`;
  else if (m === 45) core = `kvart på ${nxt}`;
  else if (m < 15)   core = `${minuteWord(m)} over ${cur}`;
  else if (m < 30)   core = `${minuteWord(30 - m)} på halv ${nxt}`;
  else if (m < 45)   core = `${minuteWord(m - 30)} over halv ${nxt}`;
  else               core = `${minuteWord(60 - m)} på ${nxt}`;
  return withDayPart ? `${core} ${dayPart(h)}` : core;
}

/** Kort forklaring som vises når svaret er feil. */
function explain(h, m, withDayPart){
  const parts = [];
  if (withDayPart){
    if (h > 12)        parts.push(`${h} − 12 = ${h - 12}, så vi sier ${hourWord(h)} ${dayPart(h)}.`);
    else if (h === 12) parts.push('12 er midt på dagen — klokka tolv.');
    else if (h === 0)  parts.push('00 er midnatt — det samme som klokka tolv på natta.');
    else               parts.push(`Er tallet under 12, sier vi det som det står: ${hourWord(h)} ${dayPart(h)}.`);
  }
  if (m !== 0 || !withDayPart) parts.push(minuteExplain(h, m));
  return parts.join(' ');
}

/** Forklaring av minuttdelen. */
function minuteExplain(h, m){
  const cur = hourWord(h), nxt = hourWord(h + 1);
  if (m === 0)  return `Står det 00 på minuttplassen, sier vi bare «klokka ${cur}».`;
  if (m === 15) return `15 minutter er et kvarter — altså «kvart over ${cur}».`;
  if (m === 30) return `30 minutter etter ${cur} er «halv ${nxt}» — vi ser framover mot neste hele time!`;
  if (m === 45) return `Det er 15 minutter igjen til ${nxt}, altså «kvart på ${nxt}».`;
  if (m < 15)   return `${minuteWordFull(m)} har gått siden ${cur} — «${timeText(h, m, false)}».`;
  if (m < 30)   return `Det er ${minuteWordFull(30 - m)} igjen til halv ${nxt} (som er ${pad(h)}:30).`;
  if (m < 45)   return `${minuteWordFull(m - 30)} har gått siden halv ${nxt} (${pad(h)}:30).`;
  return `Det er ${minuteWordFull(60 - m)} igjen til klokka blir ${nxt}.`;
}

/* ---------- 2. Nivåer ---------- */

const every5 = [0,5,10,15,20,25,30,35,40,45,50,55];
const allMin = Array.from({length:60}, (_, i) => i);

const LEVELS = [
  { id:1, icon:'🕐', name:'Hele timer',      desc:'Klokka ett, to, tre …',                mins:[0],            example:'07:00' },
  { id:2, icon:'🕜', name:'Halve timer',     desc:'Halv to, halv ni — husk at halv ni er 08:30!', mins:[0,30], example:'08:30' },
  { id:3, icon:'🕒', name:'Kvarter',         desc:'Kvart over og kvart på',               mins:[0,15,30,45],   example:'04:45' },
  { id:4, icon:'🕔', name:'Fem og fem',      desc:'Ti på halv, fem over halv …',          mins:every5,         example:'08:35' },
  { id:5, icon:'⏱️', name:'Alle minutter',   desc:'Også «tre minutter over sju»',         mins:allMin,         example:'06:23' },
  { id:7, icon:'🌗', name:'24-timers hele timer', desc:'Hele timer fra 00 til 23 — morgen, kveld eller natt?', mins:[0], example:'18:00',
    hours24:true, dayPart:true, hint:'Er tallet større enn 12? Trekk fra 12.' },
  { id:6, icon:'🌍', name:'24-timers klokke',desc:'13:45 = kvart på to på ettermiddagen', mins:every5,         example:'17:20',
    hours24:true, dayPart:true, hint:'Er tallet større enn 12? Trekk fra 12.' },
];
const levelById = id => LEVELS.find(l => l.id === id);
const levelNo   = lv => LEVELS.indexOf(lv) + 1;   // rekkefølge i menyen (id-en er lagringsnøkkelen)

/* ---------- 3. Lagring / progresjon ---------- */

const STORE_KEY = 'klokkelab.v1';

const BADGES = [
  { id:'first',    icon:'🎉', name:'Første runde',   desc:'Fullfør en runde' },
  { id:'xp100',    icon:'⭐', name:'100 poeng',      desc:'Samle 100 poeng' },
  { id:'xp500',    icon:'🌟', name:'500 poeng',      desc:'Samle 500 poeng' },
  { id:'streak10', icon:'🔥', name:'10 på rad',      desc:'10 riktige på rad' },
  { id:'perfect',  icon:'💯', name:'Feilfritt',      desc:'10 av 10 i en runde' },
  { id:'basics',   icon:'🥉', name:'Grunnmuren',     desc:'Mestre nivå 1–3' },
  { id:'allmaster',icon:'🏆', name:'Klokkemester',   desc:'Mestre alle nivåene' },
  { id:'days3',    icon:'📅', name:'Trofast',        desc:'Øv på 3 ulike dager' },
];

function emptyState(){
  return { xp:0, bestStreak:0, rounds:0, totalCorrect:0, totalAnswered:0,
           levels:{}, days:{}, badges:[], sound:true };
}

function loadState(){
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyState();
    return Object.assign(emptyState(), JSON.parse(raw));
  } catch (e) {
    console.warn('Kunne ikke lese lagret framgang:', e);
    return emptyState();
  }
}

function saveState(){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Kunne ikke lagre framgang:', e); }
}

let state = loadState();

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
};

function levelStat(id){
  if (!state.levels[id]) state.levels[id] = { correct:0, total:0, recent:[], bestStreak:0 };
  return state.levels[id];
}

/** Mestret = minst 10 svar og 9 av de 10 siste riktige. */
function mastery(id){
  const s = levelStat(id);
  if (!s.recent.length) return 0;
  const hits = s.recent.filter(Boolean).length;
  return Math.round(hits / s.recent.length * 100);
}
const isMastered = id => {
  const s = levelStat(id);
  return s.recent.length >= 10 && mastery(id) >= 90;
};

function recordAnswer(levelId, ok){
  const s = levelStat(levelId);
  s.total++; if (ok) s.correct++;
  s.recent.push(ok);
  if (s.recent.length > 10) s.recent.shift();

  const day = state.days[todayKey()] || { correct:0, total:0 };
  day.total++; if (ok) day.correct++;
  state.days[todayKey()] = day;

  state.totalAnswered++; if (ok) state.totalCorrect++;
  saveState();
}

function checkBadges(roundCorrect, roundTotal){
  const earned = [];
  const give = id => { if (!state.badges.includes(id)) { state.badges.push(id); earned.push(id); } };

  give('first');
  if (state.xp >= 100) give('xp100');
  if (state.xp >= 500) give('xp500');
  if (state.bestStreak >= 10) give('streak10');
  if (roundCorrect === roundTotal && roundTotal >= 10) give('perfect');
  if ([1,2,3].every(isMastered)) give('basics');
  if (LEVELS.every(l => isMastered(l.id))) give('allmaster');
  if (Object.keys(state.days).length >= 3) give('days3');

  saveState();
  return earned;
}

/* ---------- 4. Spørsmålsgenerator ---------- */

const rnd  = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[rnd(0, arr.length - 1)];

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomTime(level){
  const h = level.hours24 ? rnd(0, 23) : rnd(1, 12);
  return { h, m: pick(level.mins) };
}

const wrapHour = (level, h) => level.hours24 ? ((h % 24) + 24) % 24 : ((h - 1 + 12) % 12) + 1;

/** Typiske feilsvar: time-forskyvning, over/på-bytte, halvtime-bom, nabominutt. */
function distractors(level, h, m, count){
  const mins = level.mins;
  const idx  = mins.indexOf(m);
  const cand = [];
  const strict = mins.length <= 12;                // på lave nivåer skal feilsvarene ligne nivået
  const add = (hh, mm) => {
    if (mm < 0 || mm > 59) return;
    if (strict && !mins.includes(mm)) return;
    cand.push({ h: wrapHour(level, hh), m: mm });
  };

  add(h + 1, m);                                   // «halv ni = 09:30»-fella
  add(h - 1, m);
  if (level.hours24) add(h + 12, m);               // formiddag/ettermiddag forvekslet
  if (m > 0) add(h, 60 - m);                       // over/på byttet om
  add(h, m < 30 ? m + 30 : m - 30);                // bommet på halvtimen
  if (idx > -1){                                   // nabo i nivåets minuttsett
    add(h, mins[(idx + 1) % mins.length]);
    add(h, mins[(idx - 1 + mins.length) % mins.length]);
    add(h + 1, mins[(idx + 1) % mins.length]);
  }
  if (mins.length > 12){                           // finminutter
    add(h, m + rnd(1, 4));
    add(h, m - rnd(1, 4));
  }

  const seen = new Set([`${h}:${m}`]);
  const out  = [];
  for (const c of shuffle(cand)){
    const key = `${c.h}:${c.m}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length === count) break;
  }
  while (out.length < count){                      // nødløsning: helt tilfeldig
    const c = randomTime(level);
    const key = `${c.h}:${c.m}`;
    if (!seen.has(key)){ seen.add(key); out.push(c); }
  }
  return out;
}

function makeQuestion(level, mode){
  const dir = mode === 'mix' ? (Math.random() < 0.5 ? 'read' : 'set') : mode;
  const { h, m } = randomTime(level);
  const wrong = distractors(level, h, m, 3);
  const times = shuffle([{ h, m, correct:true }, ...wrong.map(w => ({ ...w, correct:false }))]);
  return { level, dir, h, m, times };
}

/* ---------- 5. Lyd ---------- */

let audioCtx = null;
function beep(ok){
  if (!state.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = ok ? [660, 880] : [300, 190];
    notes.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const t0 = audioCtx.currentTime + i * 0.11;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t0); osc.stop(t0 + 0.18);
    });
  } catch (e) { /* lyd er valgfritt */ }
}

/* ---------- 6. Skjermer og UI ---------- */

const $  = sel => document.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};

function show(name){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(`#screen-${name}`).classList.add('active');
  window.scrollTo({ top:0, behavior:'smooth' });
}

function refreshChips(){
  $('#xpChip').textContent = state.xp;
  $('#streakChip').textContent = state.bestStreak;
  $('#soundBtn').textContent = state.sound ? '🔊' : '🔇';
}

let mode = 'read';

function renderHome(){
  const grid = $('#levelGrid');
  grid.innerHTML = '';
  LEVELS.forEach(lv => {
    const s = levelStat(lv.id);
    const pct = mastery(lv.id);
    const card = el('button', 'levelcard');
    card.innerHTML = `
      <div class="lvhead"><span class="lvicon">${lv.icon}</span> ${levelNo(lv)}. ${lv.name}</div>
      <div class="lvdesc">${lv.desc}</div>
      <div class="lvexample">${lv.example} → ${timeText(
          Number(lv.example.slice(0,2)), Number(lv.example.slice(3)), !!lv.dayPart)}</div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="lvfoot">
        <span>${s.total ? `${s.correct}/${s.total} riktige` : 'Ikke prøvd ennå'}</span>
        <span class="${isMastered(lv.id) ? 'mastered' : ''}">${isMastered(lv.id) ? '✓ Mestret' : pct + '%'}</span>
      </div>`;
    card.addEventListener('click', () => startRound(lv.id));
    grid.appendChild(card);
  });
  refreshChips();
}

/* ---------- 7. Spillrunde ---------- */

const ROUND_LENGTH = 10;
let round = null;

function startRound(levelId){
  const level = levelById(levelId);
  round = {
    level,
    questions: Array.from({ length: ROUND_LENGTH }, () => makeQuestion(level, mode)),
    index: 0, correct: 0, points: 0, streak: 0, answered: false,
  };
  $('#qTotal').textContent = ROUND_LENGTH;
  show('quiz');
  renderQuestion();
}

function clockMarkup(h, m, level){
  const t = digital(h, m);
  return `<div class="clock">
            <span class="ghost-digits">88:88</span>
            <span class="digits">${t}</span>
          </div>
          ${level.hint ? `<div class="daypart">💡 ${level.hint}</div>` : ''}`;
}

function renderQuestion(){
  const q = round.questions[round.index];
  round.answered = false;

  $('#qNow').textContent = round.index + 1;
  $('#progressFill').style.width = (round.index / ROUND_LENGTH * 100) + '%';
  $('#feedback').className = 'feedback';
  $('#feedback').innerHTML = '';
  $('#nextBtn').classList.add('hidden');

  const area = $('#questionArea');
  if (q.dir === 'read'){
    area.innerHTML = `<div class="qtitle">Hva er klokka?</div>${clockMarkup(q.h, q.m, q.level)}`;
  } else {
    area.innerHTML = `<div class="qtitle">Hvilken klokke viser dette?</div>
                      <div class="textclock">${timeText(q.h, q.m, !!q.level.dayPart)}</div>
                      ${q.level.hint ? `<div class="daypart">💡 ${q.level.hint}</div>` : ''}`;
  }

  const box = $('#answers');
  box.className = 'answers' + (q.dir === 'set' ? ' compact' : '');   // korte klokkeslett tåler to kolonner
  box.innerHTML = '';
  q.times.forEach(t => {
    const label = q.dir === 'read' ? timeText(t.h, t.m, !!q.level.dayPart) : digital(t.h, t.m);
    const btn = el('button', 'answer' + (q.dir === 'set' ? ' mono' : ''), label);
    btn.addEventListener('click', () => answer(btn, t));
    box.appendChild(btn);
  });
}

function answer(btn, chosen){
  if (round.answered) return;
  round.answered = true;

  const q  = round.questions[round.index];
  const ok = !!chosen.correct;

  document.querySelectorAll('.answer').forEach((b, i) => {
    b.disabled = true;
    if (q.times[i].correct) b.classList.add('correct');
  });
  if (!ok) btn.classList.add('wrong');

  if (ok){
    round.correct++;
    round.streak++;
    const bonus = Math.min(round.streak - 1, 5) * 2;     // opptil +10 for rekke
    const pts = 10 + bonus;
    round.points += pts;
    state.xp += pts;
    state.bestStreak = Math.max(state.bestStreak, round.streak);
    $('#feedback').className = 'feedback ok';
    $('#feedback').innerHTML = `Riktig! +${pts} poeng${bonus ? ` <small>(${round.streak} på rad 🔥)</small>` : ''}`;
  } else {
    round.streak = 0;
    const fasit = q.dir === 'read'
      ? `${digital(q.h, q.m)} er «${timeText(q.h, q.m, !!q.level.dayPart)}»`
      : `«${timeText(q.h, q.m, !!q.level.dayPart)}» er ${digital(q.h, q.m)}`;
    $('#feedback').className = 'feedback no';
    $('#feedback').innerHTML = `Ikke helt. ${fasit}<span class="sub">${explain(q.h, q.m, !!q.level.dayPart)}</span>`;
  }

  beep(ok);
  recordAnswer(q.level.id, ok);
  refreshChips();

  $('#nextBtn').textContent = round.index === ROUND_LENGTH - 1 ? 'Se resultatet →' : 'Neste →';
  $('#nextBtn').classList.remove('hidden');
  $('#nextBtn').focus();
}

function nextQuestion(){
  round.index++;
  if (round.index >= ROUND_LENGTH) finishRound();
  else renderQuestion();
}

function finishRound(){
  $('#progressFill').style.width = '100%';
  state.rounds++;
  const s = levelStat(round.level.id);
  s.bestStreak = Math.max(s.bestStreak || 0, round.streak);
  saveState();

  const newBadges = checkBadges(round.correct, ROUND_LENGTH);
  const pct = Math.round(round.correct / ROUND_LENGTH * 100);
  const face = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '🌱';
  const msg  = pct === 100 ? 'Perfekt! Alt riktig!'
             : pct >= 80  ? 'Veldig bra jobbet!'
             : pct >= 50  ? 'God framgang – fortsett!'
             : 'Øvelse gjør mester. Prøv nivået en gang til!';

  $('#summaryCard').innerHTML = `
    <div class="big">${face}</div>
    <h2>${msg}</h2>
    <p>${round.level.icon} Nivå ${levelNo(round.level)}: ${round.level.name}</p>
    <div class="score">${round.correct} / ${ROUND_LENGTH} riktige</div>
    <p>+${round.points} poeng · ${state.xp} poeng totalt</p>
    ${isMastered(round.level.id) ? '<p class="mastered">✓ Dette nivået er mestret!</p>' : ''}
    ${newBadges.length ? '<div>' + newBadges.map(id => {
        const b = BADGES.find(x => x.id === id);
        return `<span class="newbadge">${b.icon} Nytt merke: ${b.name}</span>`;
      }).join('') + '</div>' : ''}`;

  show('summary');
  refreshChips();
}

/* ---------- 8. Progresjonsskjerm ---------- */

const DAY_NAMES = ['søn','man','tir','ons','tor','fre','lør'];

function renderStats(){
  const acc = state.totalAnswered ? Math.round(state.totalCorrect / state.totalAnswered * 100) : 0;
  $('#statsTop').innerHTML = `
    <div class="stattile"><div class="v">${state.xp}</div><div class="l">poeng totalt</div></div>
    <div class="stattile"><div class="v">${state.rounds}</div><div class="l">runder spilt</div></div>
    <div class="stattile"><div class="v">${acc}%</div><div class="l">riktige svar</div></div>
    <div class="stattile"><div class="v">${state.bestStreak}</div><div class="l">beste rekke</div></div>`;

  // Søylediagram for de siste 7 dagene
  const days = [];
  for (let i = 6; i >= 0; i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    days.push({ key, label: DAY_NAMES[d.getDay()], today: i === 0, ...(state.days[key] || { correct:0, total:0 }) });
  }
  const max = Math.max(1, ...days.map(d => d.correct));
  $('#chart').innerHTML = days.map(d => `
    <div class="col${d.today ? ' today' : ''}">
      <div class="colval">${d.correct || ''}</div>
      <div class="colbar" style="height:${d.correct / max * 100}%"></div>
      <div class="collabel">${d.label}</div>
    </div>`).join('');

  $('#levelStats').innerHTML = LEVELS.map(lv => {
    const s = levelStat(lv.id);
    const pct = mastery(lv.id);
    return `<div class="lsrow">
      <div class="lshead">
        <span>${lv.icon} ${levelNo(lv)}. ${lv.name}</span>
        <span class="${isMastered(lv.id) ? 'mastered' : ''}">${isMastered(lv.id) ? '✓ Mestret' : pct + '%'}</span>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="lssub">${s.total ? `${s.correct} riktige av ${s.total} · beste rekke ${s.bestStreak || 0}` : 'Ikke prøvd ennå'}</div>
    </div>`;
  }).join('');

  $('#badges').innerHTML = BADGES.map(b => `
    <div class="badge ${state.badges.includes(b.id) ? 'earned' : ''}">
      <div class="bi">${b.icon}</div><div class="bn">${b.name}</div><div class="bd">${b.desc}</div>
    </div>`).join('');

  refreshChips();
}

/* ---------- 9. Hendelser ---------- */

document.querySelectorAll('.modebtn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.modebtn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    mode = b.dataset.mode;
  });
});

$('#nextBtn').addEventListener('click', nextQuestion);
$('#quitBtn').addEventListener('click', () => { renderHome(); show('home'); });
$('#againBtn').addEventListener('click', () => startRound(round.level.id));
$('#homeBtn').addEventListener('click', () => { renderHome(); show('home'); });
$('#statsLink').addEventListener('click', () => { renderStats(); show('stats'); });
$('#backBtn').addEventListener('click', () => { renderHome(); show('home'); });

$('#soundBtn').addEventListener('click', () => {
  state.sound = !state.sound;
  saveState();
  refreshChips();
});

$('#resetBtn').addEventListener('click', () => {
  if (confirm('Vil du slette all framgang? Dette kan ikke angres.')){
    state = emptyState();
    saveState();
    renderStats();
    renderHome();
  }
});

// Tastatur: 1–4 velger svar, Enter går videre
document.addEventListener('keydown', e => {
  if (!$('#screen-quiz').classList.contains('active')) return;
  if (e.key >= '1' && e.key <= '4'){
    const btn = document.querySelectorAll('.answer')[Number(e.key) - 1];
    if (btn && !btn.disabled) btn.click();
  } else if (e.key === 'Enter' && !$('#nextBtn').classList.contains('hidden')){
    nextQuestion();
  }
});

renderHome();
