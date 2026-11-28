/* ---------- Cat v Meg artwork: hand-built SVG, no images ---------- */
// Two identical brunette twins on a podium in the Welsh hills. The week's leader
// holds the trophy, the runner-up sulks, and a tie means fists up.
const Twins = (() => {
  const SKIN = "#F2CBAE", HAIR = "#5A3926", HAIR_HI = "#7C553B", INK = "#2A1E18", BLUSH = "#EE9A90";
  const LEGS = "#2F2C3B", SHOE = "#1D1A24", CREAM = "#FFF6DE", GOLD = "#E9B21C", GOLD_DK = "#B98A0E";
  const DRESS = { cat: "#2F8F5B", meg: "#D23B48" }, SLEEVE = { cat: "#267A4C", meg: "#B8303D" }, SASH = { cat: "#1C6B45", meg: "#A8232F" };
  const BASE = 264;
  const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = n => Array(n).fill(".45 0 .55 1").join(";");

  function spin(a, b, dur, cx, cy, begin = 0) {
    if (still()) return "";
    return `<animateTransform attributeName="transform" type="rotate" values="${a} ${cx} ${cy};${b} ${cx} ${cy};${a} ${cx} ${cy}" keyTimes="0;.5;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines="${ease(2)}"/>`;
  }
  function bob(dy, dur, begin = 0) {
    if (still() || !dy) return "";
    return `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-dy};0 0" keyTimes="0;.5;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines="${ease(2)}"/>`;
  }
  function rise(dur, begin, dist) {
    return `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-dist}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0;.95;0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`;
  }

  /* ---- props ---- */
  function cup(x, y) { // y = bottom of the base
    return `<g transform="translate(${x} ${y})">
      <path d="M-9 -27.5C-16 -27.5 -16 -18 -7.5 -17.5M9 -27.5C16 -27.5 16 -18 7.5 -17.5" fill="none" stroke="${GOLD_DK}" stroke-width="2.4"/>
      <path d="M-10 -29H10V-24C10 -17 5.5 -13 0 -13C-5.5 -13 -10 -17 -10 -24Z" fill="${GOLD}"/>
      <rect x="-2.2" y="-13.5" width="4.4" height="7" fill="${GOLD_DK}"/><rect x="-8" y="-7" width="16" height="6" rx="1.8" fill="${GOLD_DK}"/>
      <path d="M-6 -26.5Q-6.5 -19 -2.5 -16" fill="none" stroke="#FFF3B5" stroke-width="1.6" stroke-linecap="round" opacity=".85"/></g>`;
  }
  function sparkle(x, y, begin) {
    const tw = still() ? "" : `<animateTransform attributeName="transform" type="scale" values="0;1;0" dur="1.6s" begin="${begin}s" repeatCount="indefinite"/>`;
    return `<g transform="translate(${x} ${y})"><path d="M0 -6L1.5 -1.5L6 0L1.5 1.5L0 6L-1.5 1.5L-6 0L-1.5 -1.5Z" fill="#FFF3B5">${tw}</path></g>`;
  }
  function bolt(x, y) {
    const flick = still() ? "" : `<animate attributeName="opacity" values="1;.15;1;1;.3;1" keyTimes="0;.1;.2;.6;.7;1" dur="1.6s" repeatCount="indefinite"/>`;
    return `<path d="M${x + 3} ${y - 20}L${x - 7} ${y + 1}H${x - 1}L${x - 5} ${y + 20}L${x + 8} ${y - 4}H${x + 2}L${x + 7} ${y - 20}Z" fill="${GOLD}" stroke="${GOLD_DK}" stroke-width="1.2" stroke-linejoin="round">${flick}</path>`;
  }

  /* ---- a twin, feet at 0,0, about 115 units tall (145 holding the trophy) ---- */
  function face(kind) {
    const E = [[-6, -94], [6, -94]];
    if (kind === "joy") {
      return E.map(([x, y]) => `<path d="M${x - 3.6} ${y + 1}Q${x} ${y - 4} ${x + 3.6} ${y + 1}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`).join("") +
        `<ellipse cx="-10.5" cy="-87.5" rx="3.4" ry="2.2" fill="${BLUSH}" opacity=".75"/><ellipse cx="10.5" cy="-87.5" rx="3.4" ry="2.2" fill="${BLUSH}" opacity=".75"/>` +
        `<path d="M-6.5 -87.5Q0 -78 6.5 -87.5Z" fill="#8C2F33"/><path d="M-4.6 -87.3H4.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    const dots = E.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.1" fill="${INK}"/><circle cx="${x + .8}" cy="${y - .9}" r=".7" fill="#fff"/>`).join("");
    if (kind === "grump") {
      return dots + `<path d="M-10 -100.5L-3 -98M3 -98L10 -100.5" stroke="${INK}" stroke-width="1.9" stroke-linecap="round"/>` +
        `<path d="M-5 -84Q0 -88.5 5 -84" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    return dots + `<path d="M-10.5 -101L-3 -97.5M3 -97.5L10.5 -101" stroke="${INK}" stroke-width="2.1" stroke-linecap="round"/>` +
      `<rect x="-5.5" y="-88.5" width="11" height="4.6" rx="1.6" fill="#fff" stroke="${INK}" stroke-width="1.2"/>` +
      `<path d="M-5.2 -86.2H5.2M-1.8 -88.3V-84.1M1.8 -88.3V-84.1" stroke="${INK}" stroke-width=".8"/>`;
  }
  function figure(key, name, pose, mood, motion) {
    const arm = d => `<path d="${d}" fill="none" stroke="${SLEEVE[key]}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    const hand = (x, y, r = 3.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SKIN}"/>`;
    const back = `<path d="M-19 -93C-21 -111 -11 -118 0 -118C11 -118 21 -111 19 -93L21 -66C14 -61 -14 -61 -21 -66Z" fill="${HAIR}"/>`;
    const legs = `<g fill="${LEGS}"><rect x="-9" y="-37" width="7" height="35" rx="3.5"/><rect x="2" y="-37" width="7" height="35" rx="3.5"/></g>` +
      `<g fill="${SHOE}"><ellipse cx="-6.5" cy="-1.8" rx="6" ry="3"/><ellipse cx="6.5" cy="-1.8" rx="6" ry="3"/></g>`;
    const dress = `<path d="M-11 -75H11Q15 -75 16 -70L20 -36Q20 -33 17 -33H-17Q-20 -33 -20 -36L-16 -70Q-15 -75 -11 -75Z" fill="${DRESS[key]}"/>`;
    const sash = `<path d="M-14 -73L-7 -76L16 -42L9 -38Z" fill="${CREAM}"/>` +
      `<text transform="translate(-3.4 -64.4) rotate(56)" text-anchor="middle" dominant-baseline="central" font-size="6.2" font-weight="800" letter-spacing=".6" fill="${SASH[key]}" style="font-family:inherit">${name.toUpperCase()}</text>`;
    const head = `<rect x="-3.5" y="-81" width="7" height="8" rx="2" fill="${SKIN}"/><circle cx="0" cy="-94" r="16" fill="${SKIN}"/>`;
    const fringe = `<path d="M-17.5 -91C-19.5 -108 -9 -114.5 0 -114C10 -114.5 19.5 -108 17.5 -91C16 -100 10 -105 3.5 -104.5C-3 -105.5 -11.5 -101.5 -17.5 -91Z" fill="${HAIR}"/>` +
      `<path d="M-17.5 -93C-19.5 -84 -18.5 -75 -15.5 -68L-12 -69C-14.5 -77 -14.8 -85 -13.5 -95Z" fill="${HAIR}"/>` +
      `<path d="M17.5 -93C19.5 -84 18.5 -75 15.5 -68L12 -69C14.5 -77 14.8 -85 13.5 -95Z" fill="${HAIR}"/>` +
      `<path d="M-9 -109Q-1 -112.5 8 -108.5" fill="none" stroke="${HAIR_HI}" stroke-width="2" stroke-linecap="round"/>`;
    let arms = "", extra = "";
    if (pose === "trophy") {
      arms = cup(0, -116) + arm("M-12 -71Q-38 -100 -13 -134") + arm("M12 -71Q38 -100 13 -134") + hand(-13, -134) + hand(13, -134);
      extra = sparkle(17, -146, 0) + sparkle(-19, -128, .8);
    } else if (pose === "crossed") {
      arms = arm("M-12.5 -71L-16 -55") + arm("M12.5 -71L16 -55") +
        `<path d="M-15 -54.5H15" stroke="${SLEEVE[key]}" stroke-width="8" stroke-linecap="round"/><path d="M-15 -54.5H15" stroke="#000" stroke-opacity=".14" stroke-width="8" stroke-linecap="round"/>` +
        hand(10.5, -57.5, 3.2) + hand(-10.5, -52, 3.2);
      // steam from the ears: fuming
      extra = [[-21, -104, 0], [21, -104, .9], [-24, -112, 1.8]].map(([x, y, d]) =>
        `<circle cx="${x}" cy="${y}" r="3.4" fill="#fff" stroke="#C9D2D6" stroke-width="1.2" opacity="${still() ? .85 : 0}">${still() ? "" : rise(2.7, d, 14)}</circle>`).join("");
    } else {
      arms = arm("M-12 -71Q-27 -66 -20 -84") + arm("M12 -71Q27 -66 20 -84") + hand(-20, -86, 4.6) + hand(20, -86, 4.6);
    }
    return `<g>${motion}${back}${legs}${dress}${sash}${head}${fringe}${face(mood)}${arms}${extra}</g>`;
  }

  /* ---- scenery ---- */
  function sheep(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><g fill="#2A2A2A"><rect x="-6" y="2" width="2.2" height="7" rx="1"/><rect x="3" y="2" width="2.2" height="7" rx="1"/></g>
      <g fill="#FAFAF5"><circle cx="-5" cy="0" r="5"/><circle cx="0" cy="-2" r="5.5"/><circle cx="5" cy="0" r="5"/><circle cx="0" cy="2" r="5"/></g>
      <ellipse cx="9.5" cy="-1" rx="3.2" ry="4" fill="#2A2A2A"/></g>`;
  }
  function hills() {
    return `<path d="M-4 176C50 150 110 156 170 166S290 142 364 156V${BASE}H-4Z" fill="var(--hill-far)"/>${sheep(58, 152, .75)}${sheep(300, 147, .65)}
      <path d="M-4 206C70 188 140 200 210 196S320 184 364 194V${BASE}H-4Z" fill="var(--hill)"/>`;
  }
  function bunting() {
    const P = [[-6, 4], [180, 52], [366, 4]], n = 15, cols = ["#1E8F4E", "#FFFFFF", "#D3202F"];
    const at = t => [0, 1].map(k => (1 - t) ** 2 * P[0][k] + 2 * (1 - t) * t * P[1][k] + t * t * P[2][k]);
    let flags = "";
    for (let i = 1; i <= n; i++) {
      const [x, y] = at(i / (n + 1));
      flags += `<path d="M${(x - 7).toFixed(1)} ${(y - .5).toFixed(1)}H${(x + 7).toFixed(1)}L${x.toFixed(1)} ${(y + 14).toFixed(1)}Z" fill="${cols[i % 3]}" stroke="#000" stroke-opacity=".1"/>`;
    }
    return `<path d="M-6 4Q180 52 366 4" fill="none" stroke="#7A6A55" stroke-width="1.4"/>${flags}`;
  }
  // Y Ddraig Goch, flying past every so often
  function dragon() {
    const R = "#C8102E";
    const flap = still() ? "" : `<animateTransform attributeName="transform" type="rotate" values="0 -2 -3;48 -2 -3;0 -2 -3" dur=".7s" repeatCount="indefinite"/>`;
    return `<path d="M-12 1C-20 2 -25 8 -33 6C-37 5 -39 2 -41 3" fill="none" stroke="${R}" stroke-width="3.2" stroke-linecap="round"/><path d="M-40 3L-47 -1L-45 6Z" fill="${R}"/>
      <ellipse cx="0" cy="0" rx="13" ry="5.6" fill="${R}"/>
      <path d="M8 -3C12 -7 14 -11 18.5 -11.5C22.5 -12 26 -9.5 27.5 -7L22.5 -5.6C20 -4.6 17 -2 13.5 2.5Z" fill="${R}"/>
      <path d="M17.5 -11L14 -16L19.5 -12.5Z" fill="${R}"/><circle cx="21.2" cy="-9" r="1.1" fill="#FFE7A3"/>
      <path d="M-6 4.5L-8.5 10M4 4.5L6.5 10" stroke="${R}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M-9 -4.5L-7 -8.5L-5 -5ZM-3 -5.4L-1 -9.2L1 -5.6Z" fill="${R}"/>
      <path d="M-7 -2C-9 -13 -3 -22 6 -25C4 -19 8 -16.5 10.5 -19.5C9.5 -13.5 12.5 -11.5 15 -13.5C12 -7.5 6 -3.5 1 -1.5Z" fill="#A50D26">${flap}</path>`;
  }
  function flight() {
    if (still()) return `<g transform="translate(312 70) scale(.85)">${dragon()}</g>`;
    return `<g><animateTransform attributeName="transform" type="translate" values="-70 84;430 56;430 56" keyTimes="0;.62;1" dur="21s" repeatCount="indefinite"/>
      <g>${bob(4, 1.4)}<g transform="scale(.85)">${dragon()}</g></g></g>`;
  }
  function daffodil(x, h, k) {
    const top = BASE - h;
    const petals = [0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="${x}" cy="${top - 4.2}" rx="2.4" ry="4.4" fill="#F7D23E" transform="rotate(${a} ${x} ${top})"/>`).join("");
    return `<g>${spin(-4, 4, 3 + k * .4, x, BASE, -k * .7)}<path d="M${x} ${BASE}Q${x - 2} ${BASE - h / 2} ${x} ${top}" fill="none" stroke="#4E8A3A" stroke-width="2"/>
      <path d="M${x} ${BASE}Q${x + 7} ${BASE - h * .45} ${x + 4} ${BASE - h * .75}" fill="none" stroke="#5E9A45" stroke-width="2.2"/>${petals}<circle cx="${x}" cy="${top}" r="3" fill="#F29A1F"/></g>`;
  }
  // The joint account takes third. It sweats when money's moved this week.
  function piggy(x, y, sweat) {
    const drop = !sweat ? "" : `<path d="M${x + 10} ${y - 30}c-2.4 3.4 -2.8 5.6 0 5.6c2.8 0 2.4 -2.2 0 -5.6z" fill="#7FC1EE">${still() ? "" :
      `<animateTransform attributeName="transform" type="translate" values="0 0;0 7" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.6;1" dur="1.8s" repeatCount="indefinite"/>`}</path>`;
    return `<g><g fill="#E88AA2"><rect x="${x - 10}" y="${y - 7}" width="5" height="7" rx="2"/><rect x="${x + 5}" y="${y - 7}" width="5" height="7" rx="2"/></g>
      <path d="M${x - 15} ${y - 14}q-6 -1 -5 -5q1 -3 3 -1" fill="none" stroke="#E88AA2" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="${x}" cy="${y - 14}" rx="15" ry="10.5" fill="#F4A9BB"/><path d="M${x + 4} ${y - 23}l3 -6 4 5z" fill="#E88AA2"/>
      <ellipse cx="${x + 15}" cy="${y - 13}" rx="4" ry="3.6" fill="#EE93AA"/><circle cx="${x + 14}" cy="${y - 13.5}" r=".9" fill="#9C4A5E"/><circle cx="${x + 16.4}" cy="${y - 13.5}" r=".9" fill="#9C4A5E"/>
      <circle cx="${x + 8}" cy="${y - 17}" r="1.4" fill="${INK}"/><rect x="${x - 5}" y="${y - 24.8}" width="9" height="2.2" rx="1.1" fill="#9C4A5E"/>${drop}</g>`;
  }
  function confetti(cx) {
    if (still()) return "";
    const C = ["#2F8F5B", "#D23B48", "#F7D23E", "#FFFFFF", GOLD];
    let out = "";
    for (let i = 0; i < 16; i++) {
      const x = cx - 70 + ((i * 37) % 140), d = 2.6 + (i % 5) * .45, b = -((i * .37) % d), r = (i * 47) % 180;
      out += `<g transform="translate(${x} 0)"><g><animateTransform attributeName="transform" type="translate" values="0 -12;${i % 2 ? 10 : -10} ${BASE}" dur="${d.toFixed(2)}s" begin="${b.toFixed(2)}s" repeatCount="indefinite"/>` +
        `<rect x="-2" y="-3.5" width="4" height="7" rx="1" fill="${C[i % C.length]}" transform="rotate(${r})"><animateTransform attributeName="transform" type="rotate" values="${r};${r + 360}" dur="${(d / 2).toFixed(2)}s" repeatCount="indefinite"/></rect></g></g>`;
    }
    return out;
  }
  function step(x, w, top, medal, big, small, ink) {
    return `<rect x="${x}" y="${top}" width="${w}" height="${BASE - top + 2}" fill="var(--step)" stroke="var(--step-side)" stroke-width="1.5"/>
      <rect x="${x}" y="${top}" width="${w}" height="6" fill="${medal}"/>
      <text x="${x + w / 2}" y="${top + 31}" text-anchor="middle" font-size="24" font-weight="800" fill="var(--step-ink)" style="font-family:inherit">${big}</text>
      ${small ? `<text x="${x + w / 2}" y="${top + 48}" text-anchor="middle" font-size="11" font-weight="800" letter-spacing="1.2" fill="${ink}" style="font-family:inherit">${small}</text>` : ""}`;
  }

  /* ---- the whole podium. twins = [{ key, name }], lead = index of the leader, or -1 for level ---- */
  function scene({ twins, lead, sweat }) {
    const S = .74, tie = lead < 0, top = tie ? twins : [twins[lead], twins[1 - lead]];
    const place = (tw, x, y, pose, mood, motion, lean = 0) => `<g transform="translate(${x} ${y}) scale(${S}) rotate(${lean})">${figure(tw.key, tw.name, pose, mood, motion)}</g>`;
    const up = s => s.toUpperCase();
    let steps, people, label;
    if (tie) {
      steps = step(38, 92, 168, GOLD, "1=", up(top[0].name), `var(--${top[0].key})`) + step(130, 100, 168, GOLD, "1=", up(top[1].name), `var(--${top[1].key})`);
      people = place(top[0], 84, 168, "fists", "fierce", bob(2.5, .6), 5) +
        place(top[1], 180, 168, "fists", "fierce", bob(2.5, .6, .3), -5) + bolt(132, 104);
      label = `${twins[0].name} and ${twins[1].name} level on the podium, squaring up to each other`;
    } else {
      steps = step(38, 92, 198, "#C3CAD1", "2", up(top[1].name), `var(--${top[1].key})`) + step(130, 100, 168, GOLD, "1", up(top[0].name), `var(--${top[0].key})`);
      people = place(top[1], 84, 198, "crossed", "grump", spin(-3, 3, 2.4, 0, 0)) + place(top[0], 180, 168, "trophy", "joy", bob(5, .9)) + confetti(180);
      label = `${top[0].name} on top of the podium holding the trophy, ${top[1].name} in second with arms crossed`;
    }
    steps += step(230, 92, 222, "#C98A4B", "3", "", "");
    const flowers = [[14, 22, 0], [26, 17, 1], [334, 21, 2], [347, 16, 3]].map(([x, h, k]) => daffodil(x, h, k)).join("");
    return `<svg viewBox="0 0 360 ${BASE}" role="img" aria-label="${label}">${hills()}${bunting()}${flight()}${steps}${piggy(276, 222, sweat)}${people}${flowers}</svg>`;
  }
  return { scene };
})();
