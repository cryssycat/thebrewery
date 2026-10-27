// Shared config + helpers for every page. Edit the section list and image paths here.
const SITE = {

   extraLinks: [
    { label: "Carrd", href: "https://starbrew.carrd.co" },
  ],
  // ----- Images (paths relative to the page). Leave "" to show a placeholder box. -----
  // Banner images are for the white box, which is 912 px wide inside its border (1824 px for sharp 2x).
  images: {
    background: "images/background.png",  // tiled behind everything; solid indigo if the file is missing
    logo: "images/IMG_2751.png",     // top of every page   — 912 × 300 px
    footer: "images/IMG_2756.png",   // bottom of every page — 912 × 160 px
    divider: "images/IMG_2754.png",  // between blocks      — 912 × 44 px
  },
  // Each section below also has a header banner: set  banner: "images/star.png"  (912 × 140 px).
  // collection = the value stored on each character. Change if yours differ.
  sections: [
    { collection: "Star Characters", label: "Star's Characters", folders: true, banner: "images/IMG_2773.png" },
    { collection: "Luna Characters", label: "Luna's Characters", folders: true, banner: "images/IMG_2774.png" },
    { collection: "Couples", label: "Co-Owned Characters", coOwned: true, banner: "images/IMG_2775.png" },
     { collection: "Mascots", label: "Mascots", banner: "images/IMG_2776.png" },
    { collection: "Worlds", label: "Worlds", worlds: true, banner: "images/IMG_2778.png" },
   
  ],
  homeCollection: "Site", homeSlug: "home",
  maxOwners: 5,
  gallerySections: [
    { id: "refs", label: "References" }, { id: "art", label: "Art" },
    { id: "g1", label: "Custom 1", custom: true }, { id: "g2", label: "Custom 2", custom: true },
    { id: "g3", label: "Custom 3", custom: true }, { id: "g4", label: "Custom 4", custom: true },
    { id: "g5", label: "Custom 5", custom: true },
    { id: "nsfw", label: "NSFW", nsfw: true },   // blurred until clicked; hidden when empty
  ],
  valueLabel: "Total art value", valueCurrency: "$",
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
const visibleTags = (c) => (c.tags || []).filter((t) => !String(t).startsWith("folder:") && !String(t).startsWith("sub:"));
const folderOf = (c) => { const t = (c.tags || []).find((x) => String(x).startsWith("folder:")); return t ? String(t).slice(7).trim() : ""; };
// A sub-folder is stored as a hidden tag "sub:Name" and lives inside the character's main folder.
const subOf = (c) => { const t = (c.tags || []).find((x) => String(x).startsWith("sub:")); return t ? String(t).slice(4).trim() : ""; };
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
  st.textContent = "#site-nav{position:sticky!important;top:0;z-index:100;display:flex!important;visibility:visible!important;width:100%!important;box-sizing:border-box;gap:8px;flex-wrap:wrap;justify-content:center;padding:10px 12px;margin:0!important;background:#4652a1;box-shadow:0 2px 10px rgba(0,0,0,.25)}#site-nav a{display:inline-block!important;padding:6px 18px;border-radius:999px;border:0;background:#7387d4;color:#fff!important;font:500 19px/1.2 'Saira Extra Condensed','Arial Narrow',sans-serif;text-decoration:none!important}#site-nav a:hover{background:#5d70c6}#site-nav a.active{background:#fff;color:#7387d4!important}@media(max-width:600px){#site-nav{position:static!important;gap:6px}#site-nav a{padding:5px 14px;font-size:17px}}";
  document.head.appendChild(st);
  }
  const link = (href, label, on) => `<a href="${href}"${on ? ' class="active"' : ""}>${label}</a>`;
  el.innerHTML = link("index.html", "Home", active === "home") + SITE.sections.map((s) =>
    link(`member.html?collection=${encodeURIComponent(s.collection)}`, s.label, active === s.collection)).join("");
}

// ---------- Page chrome: background, logo, section header banner, footer, dividers ----------
(function () {
  const bg = SITE.images.background;
  document.documentElement.style.setProperty("--bg-image", bg ? `url("${bg}")` : "none");
})();

const siteEsc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
// One image slot: your image when a path is set, otherwise a labelled placeholder.
function siteSlot(cls, src, label, dims, alt) {
  return src
    ? `<div class="slot ${cls} filled"><img src="${siteEsc(src)}" alt="${siteEsc(alt || "")}"></div>`
    : `<div class="slot ${cls}">${siteEsc(label)}<br>${siteEsc(dims)}</div>`;
}
function dividerHtml() { return siteSlot("divider", SITE.images.divider, "DIVIDER PLACEHOLDER", "912 × 44 px", ""); }

// Wraps the page's .wrap in the white box, with logo + section banner above and footer below.
// Safe to call again when the section becomes known (profile pages do this after loading).
function renderChrome(key) {
  const wrap = document.querySelector(".wrap");
  if (!wrap) return;
  let stall = document.getElementById("stall");
  if (!stall) {
    stall = document.createElement("div");
    stall.id = "stall";
    stall.className = "stall";
    wrap.before(stall);
    stall.innerHTML = '<div id="chrome-logo"></div><div id="chrome-banner"></div>';
    stall.append(wrap);
    const f = document.createElement("div");
    f.id = "chrome-footer";
    stall.append(f);
  }
  const s = key && key !== "home" ? sectionOf(key) : null;
  document.getElementById("chrome-logo").innerHTML = siteSlot("logo", SITE.images.logo, "LOGO PLACEHOLDER", "912 × 300 px", "The Brewery");
  document.getElementById("chrome-banner").innerHTML = s
    ? siteSlot("banner", s.banner, `${s.label.toUpperCase()} HEADER BANNER`, "912 × 140 px", s.label) : "";
  document.getElementById("chrome-footer").innerHTML = siteSlot("footer", SITE.images.footer, "FOOTER BANNER PLACEHOLDER", "912 × 160 px", "");
  wrap.querySelectorAll(".divider-host").forEach((h) => { h.innerHTML = dividerHtml(); });
}
