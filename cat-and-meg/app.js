/* ---------- drawing the page ---------- */
const CHECK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>`;
const CROSS = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>`;
const ARROW = d => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const dayName = (d, t) => d === t ? "today" : d === addDays(t, -1) ? "yesterday" : fmt(d, { weekday: "long", day: "numeric", month: "short" });
const short = d => fmt(d, { weekday: "short", day: "numeric", month: "short" });
const word = x => x === "done" ? "replied" : x === "missed" ? "missed" : "not logged";

function verdict(res, d, t) {
  const v = TWINS.map(p => statusOf(res, p, d)), n = TWINS.map(p => esc(p.name)), on = d === t ? "today" : "that day";
  if (v[0] === "done" && v[1] === "done") return `Both replied ${on}. No money moves. Chwarae teg.`;
  if (v[0] === "missed" && v[1] === "missed") return `Both missed ${on}, so it’s a wash. No money moves.`;
  if (v[0] && v[1]) { const i = v[0] === "done" ? 0 : 1; return `${n[1 - i]} missed, so ${n[i]} takes <b>${gbp(STAKE)}</b> out of the joint account.`; }
  if (!v[0] && !v[1]) return d === t ? `Nobody’s logged today yet. ${gbp(STAKE)} is riding on it.` : `Nothing logged for ${dayName(d, t)}. Unlogged days don’t count.`;
  const j = v[0] ? 0 : 1, i = 1 - j; // j has logged, i hasn't
  return v[j] === "missed" ? `${n[j]} missed. If ${n[i]} replied, that’s <b>${gbp(STAKE)}</b> to ${n[i]}.` : `${n[j]} replied. Waiting on ${n[i]}.`;
}
function taunt(C, t) {
  const s = standings(C.S, weekOf(t)), lines = [];
  if (s.lead >= 0) {
    const L = TWINS[s.lead].name, O = TWINS[1 - s.lead].name;
    lines.push(`${L}’s ahead this week. ${O}, your phone does work, you know.`, `${O}, ${L} is already spending your ${gbp(STAKE)}.`, `Podium check: ${L} on top, ${O} fuming.`);
  } else lines.push("Dead level. Somebody blink.", "Identical twins, identical scores. Typical.", "All square. The joint account is nervous.");
  C.S.forEach(x => { if (x.streak >= 3) lines.push(`${x.p.name}’s on a ${x.streak}-day streak. Insufferable.`); });
  const h = [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); // same line all day
  return lines[h % lines.length];
}

function renderToday(res, C, t) {
  // A day picked before midnight goes back to today once the date changes.
  if (!state.day || state.day > t || state.dayFor !== t) { state.day = t; state.dayFor = t; }
  const d = state.day, w0 = weekOf(d), when = dayName(d, t), dis = state.busy ? " disabled" : "";
  $("#bet").innerHTML = `<p class="eyebrow">The bet</p><h2 class="habit-name">${esc(HABIT)}</h2>
    <p class="fine">Each day one of you misses, the other takes ${gbp(STAKE)} out of the joint account.${C.started ? "" : ` Starts ${fmt(START, { weekday: "long", day: "numeric", month: "long" })}.`}</p>`;

  const cells = Array.from({ length: 7 }, (_, i) => addDays(w0, i)).map(x => {
    const marks = TWINS.map(p => `<i class="m ${p.key} ${statusOf(res, p, x) || "none"}"></i>`).join("");
    const label = `${fmt(x, { weekday: "long", day: "numeric", month: "long" })}. ${TWINS.map(p => `${p.name} ${word(statusOf(res, p, x))}`).join(", ")}`;
    return `<button type="button" class="d" data-day="${x}" aria-pressed="${x === d}"${x === t ? ' aria-current="date"' : ""}${x > t ? " disabled" : ""} aria-label="${esc(label)}">` +
      `<span class="dow" aria-hidden="true">${fmt(x, { weekday: "short" })}</span><span class="dn" aria-hidden="true">${fromYmd(x).getDate()}</span><span class="marks" aria-hidden="true">${marks}</span></button>`;
  }).join("");
  $("#strip").innerHTML = `<div class="strip-head">
      <button type="button" class="nav" data-week="-1" aria-label="Previous week">${ARROW("M10 3.5L5.5 8l4.5 4.5")}</button>
      <b>${w0 === weekOf(t) ? "This week" : "Week of " + fmt(w0, { day: "numeric", month: "short" })}</b>
      <button type="button" class="nav" data-week="1" aria-label="Next week"${addDays(w0, 7) > t ? " disabled" : ""}>${ARROW("M6 3.5l4.5 4.5L6 12.5")}</button>
    </div><div class="days">${cells}</div>
    <p class="fine key">${TWINS.map(p => `<span class="${p.key}"><i class="m done"></i>${esc(p.name)} replied</span>`).join("")}<span><i class="m missed" style="--fill:var(--muted)"></i>Missed</span></p>`;

  $("#duel").innerHTML = TWINS.map((p, i) => {
    const x = statusOf(res, p, d), r = res.day.get(p.name + "|" + d), s = C.S[i];
    const status = x === "done" ? `Replied ${when}` : x === "missed" ? `Missed ${when}` : d === t ? "Not logged yet" : "Not logged";
    return `<article class="who ${p.key}">
      <h2>${esc(p.name)}</h2>
      <p class="state">${status}</p>
      <div class="choice" role="group" aria-label="${esc(p.name)}, ${when}">
        <button type="button" class="pick" data-log="${i}" data-val="done" aria-pressed="${x === "done"}"${dis}>${CHECK}Did it</button>
        <button type="button" class="pick miss" data-log="${i}" data-val="missed" aria-pressed="${x === "missed"}"${dis}>${CROSS}Missed</button>
      </div>
      <p class="fine">${s.streak ? `${plural(s.streak, "day")} streak` : "No streak going"}${r && r.pending && !DEMO ? " · syncing" : ""}</p>
    </article>`;
  }).join("");
  $("#verdict").innerHTML = verdict(res, d, t);

  // Past days nobody filled in, from the last fortnight
  const since = addDays(t, -14);
  const gaps = C.S.flatMap((s, i) => s.unlogged.filter(x => x >= since).map(x => ({ i, x }))).sort((a, b) => (a.x < b.x ? 1 : -1)).slice(0, 4);
  $("#nudge").hidden = !gaps.length;
  $("#nudge").innerHTML = gaps.length ? `<span class="fine">Still to log:</span>` +
    gaps.map(g => `<button type="button" class="chip ${TWINS[g.i].key}" data-day="${g.x}">${esc(TWINS[g.i].name)}, ${fmt(g.x, { weekday: "short", day: "numeric" })}</button>`).join("") : "";

  $("#taunt").textContent = taunt(C, t);
  const s = standings(C.S, weekOf(t));
  $("#mini").innerHTML = `<span>This week <b>${TWINS.map((p, i) => `<span style="color:var(--${p.key})">${s.v[i]}</span>`).join(" – ")}</b></span><span class="go">See the podium →</span>`;
}

function weekChart(C, t) {
  const cur = weekOf(t), weeks = [];
  for (let i = 7; i >= 0; i--) { const w = addDays(cur, -7 * i); if (i === 0 || w >= weekOf(C.first)) weeks.push(w); }
  const W = 640, H = 230, top = 26, base = H - 34, gw = W / weeks.length, bw = Math.min(30, gw / 3.2), max = 7;
  let svg = `<line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="var(--rule)" stroke-width="2"/>`;
  weeks.forEach((w, i) => {
    C.S.forEach((s, j) => {
      const v = s.weeks[w] || 0, h = (v / max) * (base - top), x = gw * i + gw / 2 + (j ? 2 : -bw - 2);
      svg += `<rect x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="5" fill="var(--${s.p.key}-fill)"/>`;
      if (v) svg += `<text x="${(x + bw / 2).toFixed(1)}" y="${(base - h - 7).toFixed(1)}" text-anchor="middle" font-size="19" font-weight="700">${v}</text>`;
    });
    svg += `<text x="${(gw * i + gw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="21">${w === cur ? (weeks.length > 5 ? "Now" : "This week") : fmt(w, { day: "numeric", month: "short" })}</text>`;
  });
  return `<div class="legend">${C.S.map(s => `<span class="${s.p.key}">${esc(s.p.name)}</span>`).join("")}</div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Days replied each week for the last ${plural(weeks.length, "week")}">${svg}</svg>`;
}

let lastScene = "";
function renderScores(res, C, t) {
  const w = weekOf(t), s = standings(C.S, w), busy = state.busy ? " disabled" : "";
  // Only redraw the podium when it changes, so the animation doesn't restart on every tap.
  const svg = Twins.scene({ twins: TWINS, lead: s.lead, sweat: C.trail.some(e => e.kind === "win" && weekOf(e.day) === w) });
  if (svg !== lastScene) { $("#podium").innerHTML = svg; lastScene = svg; }

  const daysLeft = 6 - daysBetween(w, t), sum = s.v[0] + s.v[1], left = sum ? s.v[0] / sum : 0.5;
  const lead = s.lead < 0 ? "Level pegging" : `${esc(TWINS[s.lead].name)} leads ${s.onMisses ? "on fewer misses" : `by ${plural(Math.abs(s.v[0] - s.v[1]), "day")}`}`;
  const lw = addDays(w, -7);
  let last = "";
  if (C.started && lw >= weekOf(C.first)) {
    const p = standings(C.S, lw);
    last = p.lead < 0 ? ` Last week was a draw, ${p.v[0]}–${p.v[1]}.` : ` Last week: ${esc(TWINS[p.lead].name)} won ${p.v[p.lead]}–${p.v[1 - p.lead]}.`;
  }
  $("#tug").innerHTML = `<div class="row-split"><h2 class="h">This week so far</h2><span class="fine">${daysLeft ? `${plural(daysLeft, "day")} to go` : "Last day"}</span></div>
    <div class="tug-scores">${TWINS.map((p, i) => i ? `<span class="${p.key}"><b>${s.v[i]}</b> ${esc(p.name)}</span>` : `<span class="${p.key}">${esc(p.name)} <b>${s.v[i]}</b></span>`).join("")}</div>
    <div class="rope" aria-hidden="true"><span class="${TWINS[0].key}" style="flex-grow:${left}"></span><span class="${TWINS[1].key}" style="flex-grow:${1 - left}"></span></div>
    <p class="fine">${lead}. Most days replied, Monday to Sunday, takes the top step.${last}</p>`;

  const net = C.S[0].earned - C.S[1].earned;
  $("#money").innerHTML = `<p class="money-head">${net ? `${esc(C.S[net > 0 ? 0 : 1].p.name)} is <b>${gbp(Math.abs(net))}</b> up overall` : "All square on money"}</p>
    <div class="wallets">${C.S.map((x, i) => {
      const owed = x.earned - x.taken, key = "took:" + i;
      return `<article class="who ${x.p.key}"><h3>${esc(x.p.name)}</h3>
        <p class="credits"><b>${gbp(Math.max(0, owed))}</b> to take</p>
        <p class="fine num">Won ${gbp(x.earned)}, taken ${gbp(x.taken)}</p>
        ${owed > 0 ? `<button type="button" class="primary small" data-act="${key}"${busy}>${state.confirm === key ? "Sure?" : `Mark ${gbp(owed)} taken`}</button>` : owed < 0 ? `<p class="fine">Took ${gbp(-owed)} too much</p>` : ""}
      </article>`;
    }).join("")}</div>
    <p class="fine">You each win ${gbp(STAKE)} for every day the other misses and you don’t. Once the money’s out of the joint account, tap “Mark taken” so nobody claims it twice.</p>`;

  const rows = [
    ["Days replied", x => x.done],
    ["Days missed", x => x.missed],
    ["Hit rate", x => (x.done + x.missed ? Math.round((100 * x.done) / (x.done + x.missed)) + "%" : "–")],
    ["Current streak", x => plural(x.streak, "day")],
    ["Best streak", x => plural(x.best, "day")],
    ["Weeks won", x => x.won],
    ["Money won", x => gbp(x.earned)],
  ];
  $("#records").innerHTML = `<thead><tr><th scope="col"><span class="fine">&nbsp;</span></th>${C.S.map(x => `<th scope="col" class="${x.p.key}">${esc(x.p.name)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(([label, f]) => `<tr><td>${label}</td>${C.S.map(x => `<td>${f(x)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  $("#weekChart").innerHTML = weekChart(C, t);

  const items = C.trail.slice(0, 12).map(e => {
    const when = `<span class="when">${short(e.day)}</span>`;
    if (e.kind === "both") return `<li>${when}<span class="what">Both missed. No money moved.</span></li>`;
    const p = TWINS[e.who], q = TWINS[1 - e.who];
    if (e.kind === "win") return `<li class="${p.key}">${when}<span class="what">${esc(q.name)} missed</span><span class="amt">${esc(p.name)} +${gbp(e.amount)}</span></li>`;
    const key = "void:" + e.id;
    return `<li class="${p.key}">${when}<span class="what">${esc(p.name)} took ${gbp(e.amount)} out of the joint account</span>` +
      `<button type="button" class="ghost" data-act="${esc(key)}"${busy}>${state.confirm === key ? "Sure?" : "Undo"}</button></li>`;
  });
  $("#trail").innerHTML = items.length ? items.join("") : `<li><span class="what fine">Nothing yet. The first miss gets the money moving.</span></li>`;
}

function render() {
  const t = today(), res = results(), C = crunch(res, t);
  $("#brand").innerHTML = `<span class="${TWINS[0].key}">${esc(TWINS[0].name)}</span> <span class="v">v</span> <span class="${TWINS[1].key}">${esc(TWINS[1].name)}</span>`;
  $("#todayLabel").textContent = fmt(t, { weekday: "long", day: "numeric", month: "long" });
  const banner = $("#banner");
  const msg = state.message || (DEMO ? "Demo mode. These results are made up, and anything you log stays on this device until the Google Form is connected." : state.loading ? "Fetching the latest results…" : "");
  banner.hidden = !msg; banner.textContent = msg; banner.classList.toggle("error", !!state.message);
  renderToday(res, C, t);
  renderScores(res, C, t);
}

/* ---------- saving ---------- */
let toastTimer;
function toast(text) {
  const el = $("#toast");
  el.textContent = text; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 3400);
}
// Sends one row to the Google Form. In demo mode nothing leaves the device.
async function send(who, day, raw) {
  if (DEMO) return true;
  if (!FORM_POST_URL) { toast("Add FORM_POST_URL in data.js to save to Google Sheets."); return false; }
  const body = new URLSearchParams();
  body.append(ENTRY.who, who); body.append(ENTRY.date, day); body.append(ENTRY.status, raw);
  try { await fetch(FORM_POST_URL, { method: "POST", mode: "no-cors", body }); return true; }
  catch (e) { toast("Couldn’t reach Google Forms. Check your connection and try again."); return false; }
}
function refocus(sel, kb) { if (!kb) return; const b = document.querySelector(sel); if (b && !b.disabled) b.focus(); }

// Tapping the answer that's already chosen takes it back off.
async function logDay(i, val, kb) {
  if (state.busy) return;
  const p = TWINS[i], q = TWINS[1 - i], d = state.day || today();
  const raw = statusOf(results(), p, d) === val ? "clear" : val;
  state.busy = true; render();
  // Just opened? Give the first load a moment, so this save is compared with the sheet rather than an old copy.
  if (state.loading) await Promise.race([firstLoad, new Promise(r => setTimeout(r, 4000))]);
  const sent = await send(p.name, d, raw);
  state.busy = false;
  if (sent) remember({ who: p.name, day: d, raw, ts: Date.now() });
  render();
  refocus(`[data-log="${i}"][data-val="${val}"]`, kb);
  if (!sent) return;
  const t = today(), when = dayName(d, t), them = statusOf(results(), q, d);
  toast(raw === "clear" ? `Cleared ${p.name} for ${when}.`
    : raw === "done" ? (them === "missed" ? `Da iawn, ${p.name}! ${q.name} missed, so that’s ${gbp(STAKE)} to you.` : `Da iawn, ${p.name}! Logged for ${when}.`)
    : them === "done" ? `${p.name} missed ${when}. ${q.name} takes ${gbp(STAKE)}.` : `Logged: ${p.name} missed ${when}.`);
}

// Money buttons need two taps: the first arms it ("Sure?"), a second within five seconds does it.
let confirmTimer;
async function moneyAct(key, kb) {
  if (state.busy) return;
  clearTimeout(confirmTimer);
  const sel = `[data-act="${CSS.escape(key)}"]`;
  if (state.confirm !== key) {
    state.confirm = key; render(); refocus(sel, kb);
    confirmTimer = setTimeout(() => { state.confirm = null; render(); }, 5000);
    return;
  }
  state.confirm = null;
  const cut = key.indexOf(":"), act = key.slice(0, cut), arg = key.slice(cut + 1), t = today();
  let who, raw, done;
  if (act === "took") {
    const s = crunch(results(), t).S[+arg], owed = s ? s.earned - s.taken : 0;
    if (owed <= 0) { render(); return; }
    who = s.p.name; raw = `took~${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}~${owed}`;
    done = `Noted: ${who} took ${gbp(owed)} out of the joint account.`;
  } else {
    const x = results().transfers.find(y => y.id === arg);
    if (!x) { render(); return; }
    who = x.who; raw = `void~${arg}`; done = `Undone. ${x.who} has ${gbp(x.amount)} back to take.`;
  }
  state.busy = true; render();
  const sent = await send(who, t, raw);
  state.busy = false;
  if (sent) { remember({ who, day: t, raw, ts: Date.now() }); toast(done); }
  render();
}

/* ---------- loading from Google Sheets ---------- */
let fetches = 0, newestApplied = 0;
async function refresh() {
  if (DEMO) return;
  const n = ++fetches;
  try {
    const res = await fetch(CSV_URL + (CSV_URL.includes("?") ? "&" : "?") + "t=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    if (/^\s*</.test(text)) throw new Error("not CSV");
    if (n < newestApplied) return; // a later fetch has already landed; don't wind it back
    newestApplied = n;
    loadSheet(text);
    store.set("cache", text);
    state.message = "";
  } catch (e) {
    if (n < newestApplied) return;
    state.message = state.rows.length
      ? "Showing the last results this phone saw. Couldn’t reach Google Sheets just now."
      : "Couldn’t load results from Google Sheets. Check CSV_URL is the ‘Publish to web’ CSV link for the responses sheet.";
  }
  state.loading = false;
  render();
}

/* ---------- tabs and taps ---------- */
const VIEWS = ["today", "scores"];
function show(view, push) {
  if (!VIEWS.includes(view)) view = "today";
  state.view = view;
  VIEWS.forEach(v => { $("#view-" + v).hidden = v !== view; });
  document.querySelectorAll(".tabs button").forEach(b => (b.dataset.view === view ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
  if (push) { try { history.replaceState(null, "", view === "today" ? location.pathname + location.search : "#" + view); } catch (e) { /* sandboxed preview */ } window.scrollTo(0, 0); }
}
function pickDay(d) { state.day = d; state.dayFor = today(); state.confirm = null; render(); }
function moveWeek(n) { const t = today(); let d = addDays(state.day || t, 7 * n); if (d > t) d = t; pickDay(d); }
document.addEventListener("click", e => {
  const b = e.target.closest("button"), kb = e.detail === 0;
  if (!b || b.disabled) return;
  if (b.dataset.view) show(b.dataset.view, true);
  else if (b.dataset.log) logDay(+b.dataset.log, b.dataset.val, kb);
  else if (b.dataset.day) { const d = b.dataset.day; pickDay(d); refocus(`.d[data-day="${d}"]`, kb); }
  else if (b.dataset.week) { const w = b.dataset.week; moveWeek(+w); refocus(`[data-week="${w}"]`, kb); }
  else if (b.dataset.act) moneyAct(b.dataset.act, kb);
});
window.addEventListener("hashchange", () => show(location.hash.slice(1)));
document.addEventListener("visibilitychange", () => { if (!document.hidden) { render(); refresh(); } });

if (!DEMO) { const cached = store.get("cache", ""); if (cached) loadSheet(cached); }
render();
show(location.hash.slice(1));
const firstLoad = refresh();
if (!DEMO) setInterval(() => { if (!document.hidden) refresh(); }, 120000);
