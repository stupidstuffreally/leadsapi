/* ==========================================================================
   Leads API — wireframe/opmaak
   Gedeelde mockdata + interactie. Geen backend: alles leeft in het geheugen
   van de pagina (plus een klein beetje in localStorage voor het thema en
   voor evaluaties die je toevoegt, puur zodat de wireframe prettig voelt).
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------ mock data ------------------------------ */

  const RECRUITERS = [
    { id: "milan", name: "Milan", colors: ["#0a84ff", "#7c5cff"] },
    { id: "karan", name: "Karan", colors: ["#ff9f0a", "#ff5e3a"] },
    { id: "matyas", name: "Matyas", colors: ["#30d158", "#0ac2a4"] },
    { id: "sophie", name: "Sophie de Leeuw", colors: ["#ff375f", "#ff9f0a"] },
    { id: "johan", name: "Johan Kooistra", colors: ["#7c5cff", "#0a84ff"] },
  ];

  // per recruiter: laatste shifts, oplopend in tijd (nieuwste laatst)
  const SHIFT_HISTORY = {
    milan: [7, 8, 6, 9, 8],
    karan: [5, 6, 6, 7, 6],
    matyas: [8, 9, 9, 8, 9],
    sophie: [6, 7, 8, 8, 9],
    johan: [4, 5, 6, 5, 6],
  };

  const EVALUATIONS = {
    milan: [
      { date: "2026-09-24", score: 8, note: "Sterke pitch, opent gesprek altijd met oprechte interesse." },
      { date: "2026-09-17", score: 9, note: "Beste closing rate van de week, goed voorbeeld voor rookies." },
    ],
    karan: [
      { date: "2026-09-24", score: 6, note: "Pitch mag korter en krachtiger; te veel uitleg vooraf." },
      { date: "2026-09-10", score: 6, note: "Nabellen liep achter, twee leads te laat opgevolgd." },
    ],
    matyas: [
      { date: "2026-09-24", score: 9, note: "Begeleidt rookies goed mee tijdens shifts." },
    ],
    sophie: [
      { date: "2026-09-22", score: 8, note: "Zelfverzekerd op straat, vraagt zelf om extra belrondes." },
    ],
    johan: [
      { date: "2026-09-20", score: 5, note: "Spreekt weinig mensen aan; volgende shift samen oefenen." },
      { date: "2026-09-13", score: 6, note: "Beter na wat oefening, blijft nog wat terughoudend." },
    ],
  };

  const COACHING = {
    milan: ["Kan als voorbeeld dienen bij de basistraining."],
    karan: ["Pitch inkorten (AIDA-model herhalen).", "Nabelschema strikter volgen."],
    matyas: ["Klaar om zelf een shift te begeleiden."],
    sophie: ["Volgende stap: kennismakingsgesprekken zelf leren voeren."],
    johan: ["Extra oefenshift op een rustige locatie (bv. NHL Stenden).", "Meelopen met Milan of Matyas."],
  };

  const SHIFTS = [
    { id: "s1", date: "2026-09-26", location: "Leeuwarden Oost", recruiters: ["milan", "sophie"], score: 8, feedback: "Goede flow, 9 leads opgehaald. Milan pakte de rookie goed mee." },
    { id: "s2", date: "2026-09-25", location: "Station", recruiters: ["karan"], score: 6, feedback: "Rustige middag qua doorloop, pitch kan nog korter." },
    { id: "s3", date: "2026-09-24", location: "NHL Stenden", recruiters: ["matyas", "johan"], score: 7, feedback: "Johan spreekt nog te selectief aan, Matyas begeleidt goed." },
    { id: "s4", date: "2026-09-22", location: "Binnenstad", recruiters: ["sophie", "milan"], score: 9, feedback: "Beste shift van de maand: 12 leads, 4 kennismakingsgesprekken." },
  ];

  const STAGES = [
    { id: "gebeld", label: "Gebeld" },
    { id: "gepland", label: "Gepland" },
    { id: "geinterviewd", label: "Geïnterviewd" },
    { id: "aangenomen", label: "Aangenomen" },
    { id: "afgewezen", label: "Afgewezen" },
  ];

  const LEADS = [
    { id: "l1", name: "Lisa de Vries", stage: "gebeld", recruiterId: "milan", calls: 1, source: "F2F", note: "Studeert aan NHL, voorkeur belmoment 18:00." },
    { id: "l2", name: "Tom Bakker", stage: "gebeld", recruiterId: "karan", calls: 3, source: "Station", note: "Twee keer geen gehoor, whatsapp gestuurd." },
    { id: "l3", name: "Fenna Oud", stage: "gepland", recruiterId: "sophie", calls: 2, source: "Binnenstad", note: "Kennismaking do 1 okt, 16:00." },
    { id: "l4", name: "Daan Visser", stage: "gepland", recruiterId: "matyas", calls: 1, source: "F2F", note: "Meteen enthousiast, snel ingepland." },
    { id: "l5", name: "Noa Jansen", stage: "geinterviewd", recruiterId: "milan", calls: 2, source: "Via-via", note: "Gesprek gehad, wacht op beslissing." },
    { id: "l6", name: "Sem Kramer", stage: "geinterviewd", recruiterId: "johan", calls: 4, source: "Station", note: "Twijfelt nog, tweede gesprek voorgesteld." },
    { id: "l7", name: "Julia Mulder", stage: "aangenomen", recruiterId: "sophie", calls: 2, source: "Binnenstad", note: "BCT ingepland voor volgende week." },
    { id: "l8", name: "Ravi Singh", stage: "afgewezen", recruiterId: "karan", calls: 5, source: "Station", note: "Reden: niet bereikt na 5 belpogingen." },
  ];

  /* ------------------------------ helpers ------------------------------ */

  function initials(name) {
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  }

  function avatarStyle(colors) {
    return `--av-a:${colors[0]};--av-b:${colors[1]}`;
  }

  function rollingAverage(scores) {
    const last5 = scores.slice(-5);
    return last5.reduce((a, b) => a + b, 0) / last5.length;
  }

  function trendDirection(scores) {
    if (scores.length < 2) return 0;
    return scores[scores.length - 1] - scores[scores.length - 2];
  }

  function scoreBadgeClass(score) {
    if (score >= 8) return "badge-good";
    if (score >= 6) return "badge-warn";
    return "badge-bad";
  }

  function formatDateShort(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  }

  function recruiterById(id) {
    return RECRUITERS.find((r) => r.id === id);
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  /* ------------------------------ theme ------------------------------ */

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("leadsapi-theme"); } catch (e) { /* ok, geen opslag beschikbaar */ }
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    }
    const toggle = qs("[data-theme-toggle]");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("leadsapi-theme", next); } catch (e) { /* negeren */ }
      });
    }
  }

  /* ------------------------------ nav ------------------------------ */

  function initNav() {
    const page = document.body.dataset.page;
    qsa(".nav-link").forEach((a) => {
      if (a.dataset.nav === page) a.classList.add("active");
    });
  }

  /* ------------------------------ toast ------------------------------ */

  function showToast(msg) {
    let toast = qs(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  /* ------------------------------ evaluatie-modal ------------------------------ */

  function buildEvalModal() {
    if (qs("#eval-modal")) return;
    const wrap = document.createElement("div");
    wrap.id = "eval-modal";
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `
      <div class="modal glass">
        <h2>Nieuwe evaluatie</h2>
        <div class="page-sub">Score en terugkoppeling voor een shift of recruiter.</div>
        <form id="eval-form">
          <div class="field">
            <label for="eval-recruiter">Recruiter</label>
            <select id="eval-recruiter" required>
              ${RECRUITERS.map((r) => `<option value="${r.id}">${r.name}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="eval-score">Score</label>
            <div class="score-input">
              <input type="range" id="eval-score" min="1" max="10" value="7" />
              <span class="score-value" id="eval-score-value">7</span>
            </div>
          </div>
          <div class="field">
            <label for="eval-note">Terugkoppeling</label>
            <textarea id="eval-note" placeholder="Wat viel op tijdens deze shift?"></textarea>
          </div>
          <button type="button" class="btn docs-btn" id="eval-doc-btn">
            📄 Document aanmaken via Google Docs
          </button>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" data-close-modal>Annuleren</button>
            <button type="submit" class="btn btn-primary">Evaluatie opslaan</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(wrap);

    const scoreInput = qs("#eval-score", wrap);
    const scoreValue = qs("#eval-score-value", wrap);
    scoreInput.addEventListener("input", () => { scoreValue.textContent = scoreInput.value; });

    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.hasAttribute("data-close-modal")) closeEvalModal();
    });

    qs("#eval-doc-btn", wrap).addEventListener("click", () => {
      showToast("Google Docs-koppeling volgt bij de opmaak-fase — hier komt straks een nieuw document.");
    });

    qs("#eval-form", wrap).addEventListener("submit", (e) => {
      e.preventDefault();
      const recruiterId = qs("#eval-recruiter", wrap).value;
      const score = Number(qs("#eval-score", wrap).value);
      const note = qs("#eval-note", wrap).value.trim() || "Geen toelichting toegevoegd.";
      if (!EVALUATIONS[recruiterId]) EVALUATIONS[recruiterId] = [];
      EVALUATIONS[recruiterId].unshift({ date: new Date().toISOString().slice(0, 10), score, note });
      if (!SHIFT_HISTORY[recruiterId]) SHIFT_HISTORY[recruiterId] = [];
      SHIFT_HISTORY[recruiterId].push(score);
      closeEvalModal();
      showToast(`Evaluatie opgeslagen voor ${recruiterById(recruiterId).name}.`);
      document.dispatchEvent(new CustomEvent("leadsapi:eval-added", { detail: { recruiterId } }));
    });
  }

  function openEvalModal(recruiterId) {
    buildEvalModal();
    const modal = qs("#eval-modal");
    if (recruiterId) qs("#eval-recruiter", modal).value = recruiterId;
    modal.classList.add("open");
  }

  function closeEvalModal() {
    const modal = qs("#eval-modal");
    if (modal) modal.classList.remove("open");
  }

  /* ------------------------------ render: dashboard ------------------------------ */

  function renderDashboard() {
    const list = qs("#shift-list");
    if (!list) return;

    const avgAll = (
      Object.values(SHIFT_HISTORY).flat().reduce((a, b) => a + b, 0) /
      Object.values(SHIFT_HISTORY).flat().length
    ).toFixed(1);
    const totalLeads = LEADS.length;
    const hired = LEADS.filter((l) => l.stage === "aangenomen").length;

    const statAvg = qs("#stat-avg"); if (statAvg) statAvg.textContent = avgAll;
    const statLeads = qs("#stat-leads"); if (statLeads) statLeads.textContent = totalLeads;
    const statHired = qs("#stat-hired"); if (statHired) statHired.textContent = hired;
    const statShifts = qs("#stat-shifts"); if (statShifts) statShifts.textContent = SHIFTS.length;

    list.innerHTML = SHIFTS.map((shift) => {
      const names = shift.recruiters.map((id) => recruiterById(id).name).join(", ");
      return `
        <div class="card glass" style="margin-bottom:14px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
            <div style="display:flex;gap:14px;align-items:flex-start;">
              <div class="score-ring" style="--pct:${shift.score * 10}">${shift.score}</div>
              <div>
                <div class="row-title">${formatDateShort(shift.date)} · ${shift.location}</div>
                <div class="row-meta">${names}</div>
                <div style="margin-top:8px;font-size:13px;color:var(--text-secondary);max-width:52ch;">${shift.feedback}</div>
              </div>
            </div>
            <span class="badge ${scoreBadgeClass(shift.score)}">${shift.score}/10</span>
          </div>
        </div>`;
    }).join("");
  }

  /* ------------------------------ render: recruiters ------------------------------ */

  function renderRecruiters() {
    const list = qs("#recruiter-list");
    if (!list) return;

    const rows = RECRUITERS.map((r) => {
      const scores = SHIFT_HISTORY[r.id] || [];
      const avg = rollingAverage(scores);
      const trend = trendDirection(scores);
      const trendClass = trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "";
      const trendSymbol = trend > 0 ? "▲" : trend < 0 ? "▼" : "–";
      return { r, avg, trend, trendClass, trendSymbol };
    }).sort((a, b) => b.avg - a.avg);

    list.innerHTML = rows.map(({ r, avg, trendClass, trendSymbol }) => `
      <a class="row" href="recruiter.html?id=${r.id}">
        <div class="avatar" style="${avatarStyle(r.colors)}">${initials(r.name)}</div>
        <div class="row-main">
          <div class="row-title">${r.name}</div>
          <div class="row-meta">Gemiddelde over laatste ${Math.min(5, (SHIFT_HISTORY[r.id] || []).length)} shifts</div>
        </div>
        <span class="trend ${trendClass}">${trendSymbol}</span>
        <span class="badge ${scoreBadgeClass(avg)}">${avg.toFixed(1)}</span>
      </a>`).join("");
  }

  /* ------------------------------ render: recruiter detail ------------------------------ */

  function currentRecruiterId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || RECRUITERS[0].id;
  }

  function renderRecruiterDetail() {
    const root = qs("#recruiter-detail");
    if (!root) return;

    const id = currentRecruiterId();
    const r = recruiterById(id) || RECRUITERS[0];
    const scores = SHIFT_HISTORY[r.id] || [];
    const avg = rollingAverage(scores);
    const evals = EVALUATIONS[r.id] || [];
    const coaching = COACHING[r.id] || [];

    qs("#recruiter-name").textContent = r.name;
    qs("#recruiter-avatar").style.cssText = avatarStyle(r.colors);
    qs("#recruiter-avatar").textContent = initials(r.name);
    qs("#recruiter-avg").textContent = avg.toFixed(1);

    qs("#shift-scores").innerHTML = scores.slice(-5).map((s, i, arr) => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
        <div class="score-ring" style="--pct:${s * 10};width:38px;height:38px;font-size:11.5px;">${s}</div>
        <span style="font-size:10.5px;color:var(--text-tertiary);">shift ${i + 1 - arr.length + 5}</span>
      </div>`).join("");

    const evalList = qs("#eval-list");
    evalList.innerHTML = evals.length ? evals.map((ev) => `
      <div class="row" style="align-items:flex-start;">
        <div class="score-ring" style="--pct:${ev.score * 10};width:38px;height:38px;font-size:11.5px;">${ev.score}</div>
        <div class="row-main">
          <div class="row-meta">${formatDateShort(ev.date)}</div>
          <div style="font-size:13px;margin-top:2px;">${ev.note}</div>
        </div>
      </div>`).join("") : `<div class="empty-hint">Nog geen evaluaties toegevoegd.</div>`;

    qs("#coach-list").innerHTML = coaching.length ? coaching.map((c) => `
      <div class="coach-item"><span class="coach-dot"></span><span>${c}</span></div>`).join("") :
      `<div class="empty-hint">Geen openstaande coachingpunten.</div>`;

    const select = qs("#recruiter-switch");
    if (select) {
      select.innerHTML = RECRUITERS.map((rr) => `<option value="${rr.id}" ${rr.id === r.id ? "selected" : ""}>${rr.name}</option>`).join("");
      select.addEventListener("change", () => {
        window.location.href = `recruiter.html?id=${select.value}`;
      });
    }

    const addBtn = qs("#add-eval-btn");
    if (addBtn) addBtn.addEventListener("click", () => openEvalModal(r.id));
  }

  /* ------------------------------ render: funnel ------------------------------ */

  function renderFunnel() {
    const board = qs("#funnel-board");
    if (!board) return;

    board.innerHTML = STAGES.map((stage) => {
      const leads = LEADS.filter((l) => l.stage === stage.id);
      return `
        <div class="funnel-col glass">
          <div class="funnel-col-head">
            <span class="funnel-col-title">${stage.label}</span>
            <span class="funnel-count">${leads.length}</span>
          </div>
          ${leads.map((lead) => renderLeadCard(lead, stage.id)).join("") || `<div class="empty-hint">Geen leads</div>`}
        </div>`;
    }).join("");

    qsa("[data-advance]").forEach((btn) => {
      btn.addEventListener("click", () => advanceLead(btn.dataset.advance));
    });
    qsa("[data-reject]").forEach((btn) => {
      btn.addEventListener("click", () => rejectLead(btn.dataset.reject));
    });
  }

  function renderLeadCard(lead, stageId) {
    const recruiter = recruiterById(lead.recruiterId);
    const nextIndex = STAGES.findIndex((s) => s.id === stageId) + 1;
    const isFinal = stageId === "aangenomen" || stageId === "afgewezen";
    return `
      <div class="lead-card">
        <div class="lead-name">${lead.name}</div>
        <div class="lead-meta">${recruiter.name} · ${lead.source} · ${lead.calls}× gebeld</div>
        <div class="lead-meta" style="margin-top:4px;">${lead.note}</div>
        ${!isFinal ? `
          <div class="lead-actions">
            <button class="btn btn-sm btn-primary" data-advance="${lead.id}">${STAGES[nextIndex] ? "→ " + STAGES[nextIndex].label : "Afronden"}</button>
            <button class="btn btn-sm btn-ghost" data-reject="${lead.id}">Afwijzen</button>
          </div>` : ""}
      </div>`;
  }

  function advanceLead(id) {
    const lead = LEADS.find((l) => l.id === id);
    if (!lead) return;
    const idx = STAGES.findIndex((s) => s.id === lead.stage);
    if (idx < STAGES.length - 3) { // niet voorbij 'geinterviewd' automatisch doorzetten
      lead.stage = STAGES[idx + 1].id;
    } else {
      lead.stage = "aangenomen";
    }
    showToast(`${lead.name} verplaatst naar ${STAGES.find((s) => s.id === lead.stage).label}.`);
    renderFunnel();
  }

  function rejectLead(id) {
    const lead = LEADS.find((l) => l.id === id);
    if (!lead) return;
    const reason = window.prompt("Reden van afwijzen (verplicht):", "Niet bereikt");
    if (!reason) return;
    lead.stage = "afgewezen";
    lead.note = `Afgewezen: ${reason}`;
    showToast(`${lead.name} afgewezen.`);
    renderFunnel();
  }

  /* ------------------------------ boot ------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNav();
    buildEvalModal();

    renderDashboard();
    renderRecruiters();
    renderRecruiterDetail();
    renderFunnel();

    const fab = qs("[data-open-eval]");
    if (fab) fab.addEventListener("click", () => openEvalModal());

    document.addEventListener("leadsapi:eval-added", () => {
      renderDashboard();
      renderRecruiters();
      renderRecruiterDetail();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeEvalModal();
    });
  });
})();
