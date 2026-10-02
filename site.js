// Shared config + helpers for every page. Edit the section list here.
const SITE = {
  // collection = the value stored on each character. Change if yours differ.
  sections: [
    { collection: "Star's Characters", label: "Star's Characters" },
    { collection: "Luna's Characters", label: "Luna's Characters" },
    { collection: "Couples", label: "Co-Owned Characters", coOwned: true },
    { collection: "Worlds", label: "Worlds", worlds: true },
    { collection: "Mascots", label: "Mascots" },
  ],
  homeCollection: "Site", homeSlug: "home",
  maxOwners: 5,
  worldTabs: [
    { id: "overview", label: "Overview" }, { id: "culture", label: "Culture" },
    { id: "magic", label: "Magic System" }, { id: "economy", label: "Economy" },
    { id: "tech", label: "Technology" }, { id: "flora", label: "Flora / Fauna" },
    { id: "custom1", label: "Custom 1", custom: true },
    { id: "custom2", label: "Custom 2", custom: true },
    { id: "custom3", label: "Custom 3", custom: true },
  ],
};
const sectionOf = (collection) => SITE.sections.find((s) => s.collection === collection);

// Extra data lives inside profile_html as comments, so the worker needs no changes:
//   <!--meta:{"owners":["A","B"]}-->   and   <!--tab:culture|Optional title-->...html...
function parseProfile(raw) {
  raw = raw || "";
  let meta = {};
  const m = raw.match(/^\s*<!--meta:([\s\S]*?)-->\s*/);
  if (m) { try { meta = JSON.parse(m[1]); } catch {} raw = raw.slice(m[0].length); }
  const marks = [...raw.matchAll(/<!--tab:([a-z0-9_]+)(?:\|([\s\S]*?))?-->/g)];
  const tabs = marks.map((k, i) => ({
    id: k[1], title: (k[2] || "").trim(),
    html: raw.slice(k.index + k[0].length, i + 1 < marks.length ? marks[i + 1].index : undefined).trim(),
  }));
  return { meta, tabs, body: (marks.length ? raw.slice(0, marks[0].index) : raw).trim() };
}
function buildProfile(meta, tabs, body) {
  let out = Object.keys(meta).length
    ? `<!--meta:${JSON.stringify(meta).replace(/</g, "\\u003c").replace(/>/g, "\\u003e")}-->\n` : "";
  if (tabs) out += tabs.filter((t) => t.html.trim() || t.title).map((t) =>
    `<!--tab:${t.id}|${(t.title || "").replace(/[<>]/g, "").replace(/-{2,}/g, "-")}-->\n${t.html.trim()}\n`).join("");
  return out + (body || "");
}

function renderNav(active) {
  const el = document.getElementById("site-nav");
  if (!el) return;
  const st = document.createElement("style");
  st.textContent = "#site-nav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}#site-nav a{padding:9px 18px;border-radius:999px;border:1px solid var(--border);color:var(--text-dim);font-size:13px;font-weight:500}#site-nav a:hover{border-color:var(--border-strong);color:var(--text);text-decoration:none}#site-nav a.active{background:var(--accent-dim,#4c5f9c);border-color:var(--accent-dim,#4c5f9c);color:#fff}";
  document.head.appendChild(st);
  const link = (href, label, on) => `<a href="${href}"${on ? ' class="active"' : ""}>${label}</a>`;
  el.innerHTML = link("index.html", "Home", active === "home") + SITE.sections.map((s) =>
    link(`member.html?collection=${encodeURIComponent(s.collection)}`, s.label, active === s.collection)).join("");
}
