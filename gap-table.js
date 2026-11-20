/*
 * <gap-table> – Tabelle, deren Zeilenabstände proportional zum Punkteabstand sind.
 *
 * Attribute:
 *   league     bl1 | bl2 | bl3 | ffb1 | pl | del   (Default: bl1)
 *   season     Startjahr der Saison       (Default: aktuelle Saison)
 *   gap        Pixel je Punkt Abstand     (Default: 6, 0 = klassische Tabelle)
 *   max-gap    Obergrenze je Lücke in px  (Default: 240)
 *   theme      dark | light               (Default: dark)
 *   title      Überschrift                (Default: Ligenname)
 *
 * Datenquelle: https://api.openligadb.de
 */
(() => {
  const API = 'https://api.openligadb.de';

  const LEAGUES = {
    bl1: {
      name: '1. Bundesliga',
      zones: [
        { from: 1, to: 4, cls: 'cl', label: 'Champions League' },
        { from: 5, to: 5, cls: 'el', label: 'Europa League' },
        { from: 6, to: 6, cls: 'ecl', label: 'Conference League' },
        { from: 16, to: 16, cls: 'rel', label: 'Relegation' },
        { from: 17, to: 18, cls: 'down', label: 'Abstieg' },
      ],
    },
    bl2: {
      name: '2. Bundesliga',
      zones: [
        { from: 1, to: 2, cls: 'up', label: 'Aufstieg' },
        { from: 3, to: 3, cls: 'rel', label: 'Relegation' },
        { from: 16, to: 16, cls: 'rel', label: 'Relegation' },
        { from: 17, to: 18, cls: 'down', label: 'Abstieg' },
      ],
    },
    bl3: {
      name: '3. Liga',
      zones: [
        { from: 1, to: 2, cls: 'up', label: 'Aufstieg' },
        { from: 3, to: 3, cls: 'rel', label: 'Relegation' },
        { from: 17, to: 20, cls: 'down', label: 'Abstieg' },
      ],
    },
    ffb1: {
      name: 'Frauen-Bundesliga',
      zones: [
        { from: 1, to: 3, cls: 'cl', label: 'Champions League' },
        { from: 13, to: 14, cls: 'down', label: 'Abstieg' },
      ],
    },
    pl: {
      name: 'Premier League',
      zones: [
        { from: 1, to: 4, cls: 'cl', label: 'Champions League' },
        { from: 5, to: 5, cls: 'el', label: 'Europa League' },
        { from: 18, to: 20, cls: 'down', label: 'Abstieg' },
      ],
    },
    del: {
      name: 'DEL',
      zones: [
        { from: 1, to: 6, cls: 'po', label: 'Playoffs' },
        { from: 7, to: 10, cls: 'ppo', label: 'Pre-Playoffs' },
        { from: 14, to: 14, cls: 'down', label: 'Abstieg' },
      ],
    },
  };

  // Saison beginnt im Juli; davor gilt noch die Vorjahressaison.
  function currentSeason(now = new Date()) {
    return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  const cache = new Map();
  function fetchTable(league, season) {
    const key = `${league}/${season}`;
    if (!cache.has(key)) {
      const p = fetch(`${API}/getbltable/${league}/${season}`)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .catch(e => { cache.delete(key); throw e; });
      cache.set(key, p);
    }
    return cache.get(key);
  }

  const STYLE = `
    :host {
      --gt-bg: #141414;
      --gt-card: #1c1c1c;
      --gt-row: #222;
      --gt-text: #eee;
      --gt-muted: #888;
      --gt-line: #333;
      --gt-accent: #63c1ff;
      --gt-cl: #2f7cf6;
      --gt-el: #f29d38;
      --gt-ecl: #3fb67a;
      --gt-up: #3fb67a;
      --gt-rel: #e3b341;
      --gt-down: #d64541;
      --gt-po: #2f7cf6;
      --gt-ppo: #7fb2ff;
      display: block;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      color: var(--gt-text);
      max-width: 560px;
    }
    :host([theme="light"]) {
      --gt-bg: #f6f6f4;
      --gt-card: #fff;
      --gt-row: #fff;
      --gt-text: #1a1a1a;
      --gt-muted: #6b6b6b;
      --gt-line: #d4d4d0;
    }
    .wrap { background: var(--gt-bg); border-radius: 12px; padding: 14px; }
    h2 { margin: 0 0 10px; font-size: 15px; font-weight: 650; letter-spacing: .02em; }
    .card { background: var(--gt-card); border-radius: 8px; overflow: hidden; }
    .grid {
      display: grid;
      grid-template-columns: 4px 28px 22px minmax(0, 1fr) 30px 40px 36px;
      align-items: center;
      column-gap: 8px;
      padding: 0 10px 0 0;
    }
    .head { color: var(--gt-muted); font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; height: 28px; }
    .row { background: var(--gt-row); height: 36px; font-size: 13px; border-top: 1px solid var(--gt-line); }
    .head + .row, .gap + .row { border-top-color: transparent; }
    .r { text-align: right; font-variant-numeric: tabular-nums; }
    .pos { color: var(--gt-muted); }
    .accent { align-self: stretch; }
    .logo { width: 20px; height: 20px; object-fit: contain; }
    .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pts { font-weight: 700; }
    .muted { color: var(--gt-muted); }

    .cl .accent { background: var(--gt-cl); }
    .el .accent { background: var(--gt-el); }
    .ecl .accent { background: var(--gt-ecl); }
    .up .accent { background: var(--gt-up); }
    .rel .accent { background: var(--gt-rel); }
    .down .accent { background: var(--gt-down); }
    .po .accent { background: var(--gt-po); }
    .ppo .accent { background: var(--gt-ppo); }

    /* Die eigentliche Idee: Leerraum ∝ Punkteabstand */
    .gap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      transition: height .25s ease;
      overflow: hidden;
    }
    .gap::before {
      content: "";
      position: absolute;
      left: 40px; right: 46px; top: 50%;
      border-top: 1px dashed var(--gt-line);
    }
    .gap-num {
      position: relative;
      font-size: 10px;
      color: var(--gt-muted);
      font-variant-numeric: tabular-nums;
    }

    .legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px; font-size: 11px; color: var(--gt-muted); }
    .legend span { display: inline-flex; align-items: center; gap: 5px; }
    .dot { width: 8px; height: 8px; border-radius: 2px; }
    .foot { margin-top: 8px; font-size: 10px; color: var(--gt-muted); }
    .foot a { color: inherit; }
    .msg { padding: 24px; text-align: center; color: var(--gt-muted); font-size: 13px; }

    @media (max-width: 380px) {
      .grid { grid-template-columns: 4px 22px 20px minmax(0, 1fr) 0 34px 30px; column-gap: 6px; }
      .sp { visibility: hidden; }
    }
  `;

  class GapTable extends HTMLElement {
    static get observedAttributes() {
      return ['league', 'season', 'gap', 'max-gap', 'theme', 'title'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._data = null;
      this._loadedKey = null;
    }

    connectedCallback() { this._update(); }
    attributeChangedCallback() { if (this.isConnected) this._update(); }

    get league() { return LEAGUES[this.getAttribute('league')] ? this.getAttribute('league') : 'bl1'; }
    get season() { return parseInt(this.getAttribute('season'), 10) || currentSeason(); }
    get gap() {
      const v = parseFloat(this.getAttribute('gap'));
      return Number.isFinite(v) && v >= 0 ? v : 6;
    }
    get maxGap() {
      const v = parseFloat(this.getAttribute('max-gap'));
      return Number.isFinite(v) && v > 0 ? v : 240;
    }

    async _update() {
      const key = `${this.league}/${this.season}`;
      if (key === this._loadedKey && this._data) return this._render();

      this._loadedKey = key;
      this._data = null;
      this._render();
      try {
        const data = await fetchTable(this.league, this.season);
        if (this._loadedKey !== key) return; // inzwischen umgeschaltet
        this._data = data;
        this._error = null;
      } catch (e) {
        if (this._loadedKey !== key) return;
        this._error = e;
      }
      this._render();
    }

    _zone(pos) {
      return LEAGUES[this.league].zones.find(z => pos >= z.from && pos <= z.to);
    }

    _render() {
      const cfg = LEAGUES[this.league];
      const title = this.getAttribute('title') || `${cfg.name} ${this.season}/${String(this.season + 1).slice(-2)}`;

      let body;
      if (this._error) {
        body = `<div class="msg">Tabelle konnte nicht geladen werden.</div>`;
      } else if (!this._data) {
        body = `<div class="msg">Lade Tabelle …</div>`;
      } else if (this._data.length === 0) {
        body = `<div class="msg">Für diese Saison gibt es noch keine Tabelle.</div>`;
      } else {
        body = this._table(this._data);
      }

      const legend = cfg.zones
        .filter((z, i, arr) => arr.findIndex(o => o.cls === z.cls) === i)
        .map(z => `<span class="${z.cls}"><span class="dot" style="background:var(--gt-${z.cls})"></span>${z.label}</span>`)
        .join('');

      this.shadowRoot.innerHTML = `
        <style>${STYLE}</style>
        <div class="wrap" part="wrap">
          <h2 part="title">${escapeHtml(title)}</h2>
          ${body}
          <div class="legend">${legend}</div>
          <div class="foot">Daten: <a href="https://www.openligadb.de" target="_blank" rel="noopener">OpenLigaDB</a></div>
        </div>`;
    }

    _table(rows) {
      const gap = this.gap;
      const maxGap = this.maxGap;
      let html = `<div class="card" part="card">
        <div class="grid head"><span></span><span class="r">#</span><span></span><span>Verein</span><span class="r sp">Sp</span><span class="r" title="Tordifferenz">+/−</span><span class="r">Pkt</span></div>`;

      rows.forEach((t, i) => {
        const pos = i + 1;
        const zone = this._zone(pos);
        const diff = t.goalDiff > 0 ? `+${t.goalDiff}` : String(t.goalDiff);
        const logo = t.teamIconUrl
          ? `<img class="logo" src="${escapeHtml(t.teamIconUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
          : '<span></span>';

        html += `<div class="grid row ${zone ? zone.cls : ''}" title="${escapeHtml(t.teamName)}">
          <span class="accent"></span>
          <span class="r pos">${pos}</span>
          ${logo}
          <span class="name">${escapeHtml(t.shortName || t.teamName)}</span>
          <span class="r muted sp">${t.matches}</span>
          <span class="r muted">${diff}</span>
          <span class="r pts">${t.points}</span>
        </div>`;

        const next = rows[i + 1];
        if (next && gap > 0) {
          const pointGap = t.points - next.points;
          const px = Math.min(maxGap, Math.round(pointGap * gap));
          if (px > 0) {
            const num = px >= 14 ? `<span class="gap-num">−${pointGap}</span>` : '';
            html += `<div class="gap" style="height:${px}px" aria-hidden="true">${num}</div>`;
          }
        }
      });

      return html + '</div>';
    }
  }

  if (!customElements.get('gap-table')) customElements.define('gap-table', GapTable);
})();
