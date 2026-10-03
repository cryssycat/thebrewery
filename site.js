// Shared config + helpers for every page. Edit the section list here.
const SITE = {
  // collection = the value stored on each character. Change if yours differ.
  sections: [
    { collection: "Star's Characters", label: "Star's Characters", folders: true },
    { collection: "Luna's Characters", label: "Luna's Characters", folders: true },
    { collection: "Couples", label: "Co-Owned Characters", coOwned: true },
    { collection: "Worlds", label: "Worlds", worlds: true },
    { collection: "Mascots", label: "Mascots" },
  ],
  homeCollection: "Site", homeSlug: "home",
  maxOwners: 5,
  gallerySections: [
    { id: "refs", label: "References" }, { id: "art", label: "Art" },
    { id: "g1", label: "Custom 1", custom: true }, { id: "g2", label: "Custom 2", custom: true },
    { id: "g3", label: "Custom 3", custom: true }, { id: "g4", label: "Custom 4", custom: true },
    { id: "g5", label: "Custom 5", custom: true },
  ],
  worldTabs: [
    { id: "overview", label: "Overview" }, { id: "culture", label: "Culture" },
    { id: "magic", label: "Magic System" }, { id: "economy", label: "Economy" },
    { id: "tech", label: "Technology" }, { id: "flora", label: "Flora / Fauna" },
    { id: "custom1", label: "Custom 1", custom: true },
    { id: "custom2", label: "Custom 2", custom: true },
    { id: "custom3", label: "Custom 3", custom: true },
  ],
};
// A character's folder is stored as a hidden tag "folder:Name" (the list API already returns tags).
const visibleTags = (c) => (c.tags || []).filter((t) => !String(t).startsWith("folder:"));
const folderOf = (c) => { const t = (c.tags || []).find((x) => String(x).startsWith("folder:")); return t ? String(t).slice(7).trim() : ""; };
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
  document.body.prepend(el); // outside .wrap so a profile's own CSS can't push it around
  if (!document.getElementById("nav-style")) {
  const st = document.createElement("style");
  st.id = "nav-style";
  st.textContent = "#site-nav{position:sticky!important;top:0;z-index:100;display:flex!important;visibility:visible!important;width:100%!important;box-sizing:border-box;gap:8px;flex-wrap:wrap;justify-content:center;padding:12px 20px;margin:0!important;background:rgba(11,17,32,.94);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.09)}#site-nav a{display:inline-block!important;padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.12);color:#8b94a8!important;font:500 13px -apple-system,'Segoe UI',Inter,sans-serif;text-decoration:none!important;background:transparent}#site-nav a:hover{border-color:rgba(255,255,255,.3);color:#e7ecf5!important}#site-nav a.active{background:#4c5f9c;border-color:#4c5f9c;color:#fff!important}";
  document.head.appendChild(st);
  }
  const link = (href, label, on) => `<a href="${href}"${on ? ' class="active"' : ""}>${label}</a>`;
  el.innerHTML = link("index.html", "Home", active === "home") + SITE.sections.map((s) =>
    link(`member.html?collection=${encodeURIComponent(s.collection)}`, s.label, active === s.collection)).join("");
}
