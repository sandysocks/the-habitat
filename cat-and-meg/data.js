/* ======================= SETTINGS: edit these ======================= */

// Saving works like The Habitat: a Google Form writes rows, and the page reads the sheet back.
//  1. Make a new Google Form with three short-answer questions: "Who", "Date" and "Status".
//  2. Responses → Link to Sheets, then share the sheet as "Anyone with the link can view".
//     CSV_URL reads its responses tab as CSV: swap in the sheet's ID and the tab's gid.
//     (A "Publish to web" CSV link works too.)
//  3. In the form: ⋮ → Get pre-filled link, type anything in each box, copy the link.
//     The entry.123… numbers in it go in ENTRY, in the same order as the questions.
//  4. FORM_POST_URL is the form's address with /viewform swapped for /formResponse.
// Leave CSV_URL blank to see made-up demo data.
const CSV_URL = "https://docs.google.com/spreadsheets/d/1V_zhTWqKJFHvPcw3MjZU7mLE6_3DuP4sLyFrhhrdhOE/gviz/tq?tqx=out:csv&headers=1&gid=2114188182";
const FORM_POST_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfGxcZRpDVPuUG-2q2uBBOmvadColaoT5MXB60hsslMhKsAhw/formResponse";
const ENTRY = { who: "entry.1347132005", date: "entry.22024408", status: "entry.1663218690" };

const TWINS = [
  { name: "Cat", key: "cat" },
  { name: "Meg", key: "meg" },
];
const HABIT = "Take 5 min to reply";
const STAKE = 20;   // pounds the other one takes out of the joint account each day you miss
const START = "";   // first day of the bet, like "2026-11-30". Blank = the first day anyone logs.

/* ==================================================================== */

/* ---------- small helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromYmd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = fromYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const daysBetween = (a, b) => Math.round((fromYmd(b) - fromYmd(a)) / 864e5);
const weekOf = s => { const d = fromYmd(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return ymd(d); };
const today = () => ymd(new Date());
const fmt = (s, o) => fromYmd(s).toLocaleDateString("en-GB", o);
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const gbp = n => "£" + n;
const store = {
  get(k, d) { try { const v = localStorage.getItem("catvmeg:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("catvmeg:" + k, JSON.stringify(v)); } catch (e) { /* private mode: keep it in memory */ } },
};

/* ---------- what goes in the Status column ----------
   "done" / "missed" : how that twin got on that day ("clear" takes it back off)
   "took~<id>~<£>"   : that twin took their winnings out of the joint account
   "void~<id>"       : cancels a transfer logged by mistake                    */
const isMoney = r => /^(took|void)~/.test(r.raw);

/* ---------- reading the published sheet ---------- */
function parseCSV(text) {
  const rows = []; let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function sheetDate(s) {
  s = (s || "").trim();
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) return new Date(+m[3], m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) return new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  return null;
}
function rowsFromCSV(text) {
  const table = parseCSV(text).filter(r => r.some(c => c.trim()));
  if (!table.length) return [];
  const head = table[0].map(h => h.trim().toLowerCase());
  const col = (...words) => head.findIndex(h => words.some(w => h.includes(w)));
  const cTs = col("timestamp"), cWho = col("who", "name"), cDate = col("date"), cSt = col("status", "result");
  return table.slice(1).map((r, i) => {
    const twin = TWINS.find(p => p.name.toLowerCase() === (r[cWho] || "").trim().toLowerCase());
    const d = sheetDate(r[cDate]), raw = (r[cSt] || "").trim().toLowerCase();
    if (!twin || !d || !raw) return null;
    const ts = sheetDate(r[cTs]);
    return { who: twin.name, day: ymd(d), raw, ts: ts ? ts.getTime() : 0, order: i };
  }).filter(Boolean);
}

/* ---------- made-up data for demo mode ---------- */
function demoRows() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rows = [], t = today();
  const add = (who, day, raw, ts) => rows.push({ who, day, raw, ts: ts || fromYmd(day).getTime() + 72e6, order: rows.length });
  for (let i = 33; i >= 1; i--) {
    const day = addDays(t, -i);
    TWINS.forEach((p, k) => add(p.name, day, rnd() < (k ? 0.8 : 0.85) ? "done" : "missed"));
  }
  add(TWINS[0].name, t, "done", Date.now() - 36e5);
  add(TWINS[0].name, addDays(t, -12), "took~demo1~20");
  add(TWINS[1].name, addDays(t, -12), "took~demo2~20");
  return rows;
}

/* ---------- saves from this phone that the sheet hasn't caught up with ---------- */
// Same trick as The Habitat: anything saved here overrides the sheet until the sheet
// shows it. `seen` counts identical rows that already existed at save time.
const DEMO = !CSV_URL;
const LOCAL_KEY = DEMO ? "demo" : "pending";
const KEEP_PENDING = 6 * 36e5;
const state = {
  rows: DEMO ? demoRows() : [],
  local: store.get(LOCAL_KEY, []),
  day: null, dayFor: null,
  view: "today", loading: !DEMO, message: "", confirm: null, busy: false,
};
const rowKey = r => r.who + "|" + r.day;
const sameRow = (a, b) => a.who === b.who && a.day === b.day && a.raw === b.raw;
const byTime = (a, b) => a.ts - b.ts || a.order - b.order;
function prune() { if (!DEMO) state.local = state.local.filter(r => Date.now() - r.ts < KEEP_PENDING); }
function pendingRows() {
  prune();
  return state.local.map((r, i) => ({ ...r, order: 1e9 + i, pending: true })).sort(byTime);
}
function allRows() { return state.rows.slice().sort(byTime).concat(pendingRows()); }
function remember(row) {
  prune();
  row.seen = state.rows.filter(r => sameRow(r, row)).length + state.local.filter(r => sameRow(r, row)).length;
  state.local.push(row); store.set(LOCAL_KEY, state.local);
}
function loadSheet(text) {
  state.rows = rowsFromCSV(text);
  const landed = state.local.filter(p => state.rows.filter(r => sameRow(r, p)).length > (p.seen || 0));
  // Once a save has landed, older saves of that same day from this phone are out of date too.
  state.local = state.local.filter(p => !landed.includes(p) &&
    !landed.some(l => !isMoney(l) && !isMoney(p) && rowKey(l) === rowKey(p) && l.ts > p.ts));
  store.set(LOCAL_KEY, state.local);
}

/* ---------- the latest word on each day, and the transfers ---------- */
function results() {
  const day = new Map(), took = new Map(), voided = new Set();
  allRows().forEach(r => {
    if (r.raw === "done" || r.raw === "missed") day.set(rowKey(r), r);
    else if (r.raw === "clear") day.delete(rowKey(r));
    else {
      const [act, id, amt] = r.raw.split("~");
      if (act === "took" && id && !took.has(id)) took.set(id, { id, who: r.who, day: r.day, ts: r.ts, amount: Math.max(0, Math.round(parseFloat(amt) || 0)) });
      else if (act === "void" && id) voided.add(id);
    }
  });
  return { day, transfers: [...took.values()].filter(x => !voided.has(x.id)) };
}
const statusOf = (res, p, d) => (res.day.get(p.name + "|" + d) || {}).raw || null;

/* ---------- the numbers ---------- */
function crunch(res, t) {
  const logged = [...res.day.values()].map(r => r.day).sort();
  const first = START || (logged[0] && logged[0] < t ? logged[0] : t);
  const S = TWINS.map(p => ({ p, done: 0, missed: 0, unlogged: [], earned: 0, taken: 0, streak: 0, best: 0, weeks: {}, weekMiss: {}, won: 0 }));
  const trail = [];
  for (let d = first; d <= t; d = addDays(d, 1)) {
    const v = TWINS.map(p => statusOf(res, p, d)), w = weekOf(d);
    v.forEach((x, i) => {
      const s = S[i];
      if (x === "done") { s.done++; s.weeks[w] = (s.weeks[w] || 0) + 1; }
      else if (x === "missed") { s.missed++; s.weekMiss[w] = (s.weekMiss[w] || 0) + 1; }
      else if (d < t) s.unlogged.push(d);
    });
    // Whoever replied takes the stake when their twin missed. Both missed: no money moves.
    if (v[0] && v[1] && v[0] !== v[1]) {
      const i = v[0] === "done" ? 0 : 1;
      S[i].earned += STAKE;
      trail.push({ day: d, kind: "win", who: i, amount: STAKE });
    } else if (v[0] === "missed" && v[1] === "missed") trail.push({ day: d, kind: "both" });
  }
  S.forEach(s => {
    const st = d => statusOf(res, s.p, d);
    if (st(t) !== "missed") for (let d = st(t) === "done" ? t : addDays(t, -1); d >= first && st(d) === "done"; d = addDays(d, -1)) s.streak++;
    let run = 0;
    for (let d = first; d <= t; d = addDays(d, 1)) { run = st(d) === "done" ? run + 1 : 0; s.best = Math.max(s.best, run); }
  });
  res.transfers.forEach(x => {
    const i = TWINS.findIndex(p => p.name === x.who);
    if (i < 0) return;
    S[i].taken += x.amount;
    trail.push({ day: x.day, kind: "took", who: i, amount: x.amount, id: x.id, ts: x.ts });
  });
  for (let w = weekOf(first); w < weekOf(t); w = addDays(w, 7)) { const s = standings(S, w); if (s.lead >= 0) S[s.lead].won++; }
  trail.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : (b.ts || 0) - (a.ts || 0)));
  return { first, S, trail, started: first <= t };
}
// Most days replied wins the week. Level on that? Fewest misses. Still level? A draw.
function standings(S, w) {
  const v = S.map(s => s.weeks[w] || 0), m = S.map(s => s.weekMiss[w] || 0);
  const lead = v[0] !== v[1] ? (v[0] > v[1] ? 0 : 1) : m[0] !== m[1] ? (m[0] < m[1] ? 0 : 1) : -1;
  return { lead, v, m, onMisses: v[0] === v[1] && lead >= 0 };
}
