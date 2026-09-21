const SNAPSHOTS = [
  "https://raw.githubusercontent.com/nox314/home/main/crawl/example.com.html"
];

let documents = [];
let invertedIndex = new Map();
let builtAt = 0;

const input = document.getElementById("query");
const out = document.getElementById("results");
const statsEl = document.getElementById("stats");
const countEl = document.getElementById("count");
const suggestionsEl = document.getElementById("suggestions");
const trendingEl = document.getElementById("trending");
const paginationEl = document.getElementById("pagination");
const sidepanel = document.getElementById("sidepanel");
const kpMeta = document.getElementById("kp-meta");
const filterbar = document.getElementById("filterbar");

let debounceTimer;
let lastResults = [];
let lastMatchedTerms = [];
let currentPage = 1;
let currentTab = "all";
const PAGE_SIZE = 10;

function tokenize(text) {
  return text.toLowerCase().replace(/https?:\/\//g, "").split(/[^a-zA-Z0-9äöüß]+/).filter(t => t.length > 1);
}
function normalize(word) {
  return word.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss");
}
function stem(w) {
  const endings = ["ungen","eren","isch","lich","heit","keit","ung","ern","em","en","er","es","st","e","n","s"];
  for (const end of endings) {
    if (w.length > end.length + 3 && w.endsWith(end)) return w.slice(0, -end.length);
  }
  return w;
}
function analyze(text) {
  return [...new Set(tokenize(normalize(text)).map(stem))];
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}
function highlight(text, terms) {
  let html = escapeHtml(text);
  terms.forEach(t => {
    const re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    html = html.replace(re, "<mark>$1</mark>");
  });
  return html;
}

function parseQuery(raw) {
  const q = raw.trim();
  const phrases = [];
  const phraseRegex = /"([^"]+)"/g;
  let m;
  while ((m = phraseRegex.exec(q)) !== null) phrases.push(m[1].toLowerCase());
  const cleaned = q.replace(/"[^"]+"/g, "").trim();
  const tokens = cleaned.split(/\s+/);
  const operators = { site:[], filetype:[], type:[] };
  const normalTerms = [];
  tokens.forEach(t => {
    if (t.startsWith("site:")) operators.site.push(t.slice(5).toLowerCase());
    else if (t.startsWith("filetype:")) operators.filetype.push(t.slice(9).toLowerCase());
    else if (t.startsWith("type:")) operators.type.push(t.slice(5).toLowerCase());
    else if (t) normalTerms.push(t.toLowerCase());
  });
  const analyzed = analyze(normalTerms.join(" "));
  return { phrases, operators, terms: analyzed };
}

function makeSnippet(doc, queryTerms) {
  const text = doc.content || doc.description || doc.title || doc.url || "";
  if (!text) return "";
  const lower = text.toLowerCase();
  for (const term of queryTerms) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(text.length, idx + 80);
      return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    }
  }
  return text.slice(0, 160) + (text.length > 160 ? "…" : "");
}

function buildIndex() {
  invertedIndex.clear();
  documents.forEach((doc, i) => {
    const text = [
      doc.title || "",
      doc.description || "",
      doc.content || "",
      (doc.tags || []).join(" "),
      doc.siteName || "",
      doc.url || ""
    ].join(" ");
    const terms = analyze(text);
    doc._terms = terms;
    const freq = new Map();
    terms.forEach(t => freq.set(t, (freq.get(t) || 0) + 1));
    freq.forEach((tf, term) => {
      if (!invertedIndex.has(term)) invertedIndex.set(term, new Map());
      invertedIndex.get(term).set(i, tf);
    });
  });
  builtAt = performance.now();
  renderTrending();
}

function doSearch(rawQuery, tab) {
  const t0 = performance.now();
  const parsed = parseQuery(rawQuery);
  const queryTerms = parsed.terms;
  const phrases = parsed.phrases;
  const ops = parsed.operators;
  if (!queryTerms.length && !phrases.length && !Object.values(ops).some(a => a.length)) {
    return { results: [], ms: 0, matchedTerms: [] };
  }
  const scores = new Map();
  const matchedTerms = [];
  for (const qt of queryTerms) {
    const postings = invertedIndex.get(qt);
    if (!postings) continue;
    matchedTerms.push(qt);
    const idf = Math.log(1 + documents.length / postings.size);
    postings.forEach((tf, i) => {
      const doc = documents[i];
      let score = idf * (1 + Math.log(tf));
      if ((doc.title || "").toLowerCase().includes(qt)) score *= 1.6;
      if ((doc.description || "").toLowerCase().includes(qt)) score *= 1.3;
      scores.set(i, (scores.get(i) || 0) + score);
    });
  }
  documents.forEach((doc, i) => {
    let score = scores.get(i) || 0;
    if (ops.site.length && !ops.site.some(s => (doc.url || "").toLowerCase().includes(s))) score *= 0.01;
    if (ops.filetype.length && !ops.filetype.some(ft => (doc.url || "").toLowerCase().endsWith("." + ft))) score *= 0.01;
    if (ops.type.length && !ops.type.some(t => (doc.type || "").toLowerCase() === t)) score *= 0.01;
    phrases.forEach(ph => {
      const phLower = ph.toLowerCase();
      const text = (doc.content || "") + " " + (doc.description || "") + " " + (doc.title || "");
      if (text.toLowerCase().includes(phLower)) score *= 2.0;
    });
    if (tab !== "all") {
      if ((doc.type || "web") !== tab) score *= 0.01;
    }
    score *= 1 / (1 + (doc.url || "").length / 200);
    if (score > 0) scores.set(i, score);
  });
  const final = [...scores.entries()].map(([i, score]) => ({ doc: documents[i], score }));
  final.sort((a, b) => b.score - a.score);
  return { results: final, ms: (performance.now() - t0), matchedTerms };
}

function renderTrending() {
  if (!documents.length) return;
  const termCounts = [];
  invertedIndex.forEach((map, term) => {
    termCounts.push({ term, count: map.size });
  });
  termCounts.sort((a,b) => b.count - a.count);
  const top = termCounts.slice(0, 8);
  if (!top.length) return;
  trendingEl.innerHTML = "Trending: " + top.map(t =>
    `<span class="tag" data-term="${escapeHtml(t.term)}">${escapeHtml(t.term)}</span>`
  ).join("");
  trendingEl.querySelectorAll(".tag").forEach(tag => {
    tag.onclick = () => {
      input.value = tag.dataset.term;
      runSearch();
    };
  });
}

function renderSuggestions() {
  const q = input.value.trim().toLowerCase();
  if (!q) {
    suggestionsEl.innerHTML = "";
    return;
  }
  const items = [];
  documents.forEach(doc => {
    const t = (doc.title || doc.url || "").toLowerCase();
    if (t.includes(q)) items.push({ text: doc.title || doc.url, hint: doc.siteName || "Treffer" });
  });
  const unique = [];
  const seen = new Set();
  for (const it of items) {
    if (!seen.has(it.text) && unique.length < 8) {
      seen.add(it.text);
      unique.push(it);
    }
  }
  if (!unique.length) {
    suggestionsEl.innerHTML = "";
    return;
  }
  suggestionsEl.innerHTML = unique.map(it =>
    `<li><span>${escapeHtml(it.text)}</span><span class="hint">${escapeHtml(it.hint)}</span></li>`
  ).join("");
  suggestionsEl.querySelectorAll("li").forEach(li => {
    li.onclick = () => {
      input.value = li.querySelector("span").textContent;
      suggestionsEl.innerHTML = "";
      runSearch();
    };
  });
}

function showPanel(doc) {
  sidepanel.innerHTML = `
    <h2>${escapeHtml(doc.title || doc.url || "Eintrag")}</h2>
    <p>${escapeHtml(doc.description || "")}</p>
    <p>${escapeHtml(doc.siteName || "")}</p>
    <p>${doc.published ? escapeHtml(doc.published) : ""}</p>
    <div class="kp-meta">Index: ${documents.length} Seiten · Begriffe: ${invertedIndex.size} · aufgebaut in ${builtAt.toFixed(0)}ms</div>
  `;
}

function renderResults() {
  const total = lastResults.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > pages) currentPage = pages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = lastResults.slice(start, start + PAGE_SIZE);
  countEl.textContent = total || "";
  if (total) statsEl.innerHTML = `Ungefähr <b>${total}</b> Ergebnisse (Seite ${currentPage}/${pages})`;
  else statsEl.innerHTML = "";
  if (!slice.length) {
    out.innerHTML = "<p style='text-align:center;color:#624aff;font-weight:600;'>Keine Ergebnisse gefunden.</p>";
    paginationEl.innerHTML = "";
    return;
  }
  const frag = document.createDocumentFragment();
  slice.forEach(({ doc }) => {
    const snippet = makeSnippet(doc, lastMatchedTerms.length ? lastMatchedTerms : parseQuery(input.value).terms);
    const card = document.createElement("div");
    card.className = "result-card";
    let mediaHtml = "";
    if (doc.type === "image" && doc.image) {
      mediaHtml = `<img src="${escapeHtml(doc.image)}" alt="${escapeHtml(doc.title || "")}" class="result-image">`;
    } else if (doc.type === "video" && doc.video) {
      if (/youtube\.com|youtu\.be/i.test(doc.video)) {
        let id = "";
        const m = doc.video.match(/v=([^&]+)/);
        const s = doc.video.match(/youtu\.be\/([^?]+)/);
        if (m) id = m[1];
        else if (s) id = s[1];
        if (id) {
          mediaHtml = `<iframe class="result-video" src="https://www.youtube.com/embed/${escapeHtml(id)}" frameborder="0" allowfullscreen></iframe>`;
        }
      } else {
        mediaHtml = `<video class="result-video" controls src="${escapeHtml(doc.video)}"></video>`;
      }
    }
    card.innerHTML = `
      <div class="result-header">
        <div>
          <h3>${highlight(doc.title || doc.url || "", lastMatchedTerms)}</h3>
          <a href="${escapeHtml(doc.url || "#")}" target="_blank" rel="noopener">${escapeHtml(doc.url || "")}</a>
        </div>
      </div>
      <div class="snippet">${highlight(snippet, lastMatchedTerms)}</div>
      ${mediaHtml}
    `;
    card.addEventListener("click", () => showPanel(doc));
    frag.appendChild(card);
  });
  out.innerHTML = "";
  out.appendChild(frag);
  paginationEl.innerHTML = "";
  if (pages > 1) {
    for (let p = 1; p <= pages; p++) {
      const btn = document.createElement("button");
      btn.textContent = p;
      if (p === currentPage) btn.classList.add("active");
      btn.onclick = () => {
        currentPage = p;
        renderResults();
      };
      paginationEl.appendChild(btn);
    }
  }
}

function runSearch() {
  const q = input.value.trim();
  if (!q) {
    out.innerHTML = "";
    statsEl.innerHTML = "";
    countEl.textContent = "";
    suggestionsEl.innerHTML = "";
    return;
  }
  const { results, ms, matchedTerms } = doSearch(q, currentTab);
  lastResults = results;
  lastMatchedTerms = matchedTerms;
  currentPage = 1;
  statsEl.innerHTML = results.length ? `Ungefähr <b>${results.length}</b> Ergebnisse (<b>${ms.toFixed(1)}</b> ms)` : "";
  suggestionsEl.innerHTML = "";
  renderResults();
}

input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderSuggestions();
  }, 80);
});

document.getElementById("btn-search").onclick = () => runSearch();
document.getElementById("btn-lucky").onclick = () => {
  const q = input.value.trim();
  const { results } = doSearch(q || "", currentTab);
  suggestionsEl.innerHTML = "";
  if (results.length && results[0].doc.url) window.open(results[0].doc.url, "_blank");
};

filterbar.querySelectorAll("span").forEach(span => {
  span.onclick = () => {
    filterbar.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    span.classList.add("active");
    currentTab = span.dataset.tab;
    runSearch();
  };
});

document.addEventListener("keydown", e => {
  if (e.key === "/" && !e.target.closest("input,textarea")) {
    e.preventDefault();
    input.focus();
  }
  if (e.key === "Escape") {
    input.value = "";
    suggestionsEl.innerHTML = "";
    out.innerHTML = "";
    statsEl.innerHTML = "";
    countEl.textContent = "";
  }
  if (e.key === "Enter" && document.activeElement === input && !e.ctrlKey) {
    runSearch();
  }
  if (e.key === "Enter" && e.ctrlKey) {
    const q = input.value.trim();
    const { results } = doSearch(q || "", currentTab);
    suggestionsEl.innerHTML = "";
    if (results.length && results[0].doc.url) window.open(results[0].doc.url, "_blank");
  }
});

function parseSnapshot(htmlText, url) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const title = doc.querySelector("title") ? doc.querySelector("title").textContent.trim() : url;
  const metaDesc = doc.querySelector('meta[name="description"]');
  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const ogDesc = doc.querySelector('meta[property="og:description"]');
  const ogImage = doc.querySelector('meta[property="og:image"]');
  const ogSite = doc.querySelector('meta[property="og:site_name"]');
  const articleTime = doc.querySelector('meta[property="article:published_time"]');
  const timeEl = doc.querySelector("time");
  let description = metaDesc ? metaDesc.content.trim() : "";
  if (!description && ogDesc) description = ogDesc.content.trim();
  const siteName = ogSite ? ogSite.content.trim() : "";
  const image = ogImage ? ogImage.content.trim() : "";
  let published = "";
  if (articleTime) published = articleTime.content.trim();
  else if (timeEl && timeEl.getAttribute("datetime")) published = timeEl.getAttribute("datetime");
  const imgs = Array.from(doc.querySelectorAll("img")).map(i => i.getAttribute("src")).filter(Boolean);
  const vids = Array.from(doc.querySelectorAll("video")).map(v => v.getAttribute("src")).filter(Boolean);
  const links = Array.from(doc.querySelectorAll("a")).map(a => a.getAttribute("href")).filter(Boolean);
  const textBlocks = Array.from(doc.querySelectorAll("p,article,section")).map(e => e.textContent.trim()).filter(t => t.length > 40);
  const content = textBlocks.join("\n\n").slice(0, 4000);
  let type = "web";
  if (imgs.length && !vids.length) type = "image";
  if (vids.length) type = "video";
  if (/news|article|blog|press/i.test(url) || doc.querySelector("article")) type = "news";
  if (/github|gitlab|bitbucket|code|api/i.test(url)) type = "code";
  if (/docs|documentation|manual|wiki/i.test(url)) type = "doc";
  const tags = [];
  if (title) tokenize(title).forEach(t => tags.push(t));
  if (description) tokenize(description).forEach(t => tags.push(t));
  return {
    url,
    title,
    description,
    content,
    type,
    image: image || imgs[0] || "",
    video: vids[0] || links.find(l => /youtube\.com|youtu\.be/i.test(l)) || "",
    siteName,
    published,
    tags
  };
}

function loadSnapshots() {
  statsEl.innerHTML = "<div class='loading'>Index wird geladen…</div>";
  Promise.all(
    SNAPSHOTS.map(url =>
      fetch(url).then(r => r.text()).then(html => parseSnapshot(html, url.replace(/^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/[^\/]+\//,""))).catch(() => null)
    )
  ).then(list => {
    documents = list.filter(Boolean);
    buildIndex();
    statsEl.innerHTML = `Index bereit: <b>${documents.length}</b> Seiten · <b>${invertedIndex.size}</b> Begriffe · aufgebaut in ${builtAt.toFixed(0)}ms`;
  }).catch(() => {
    statsEl.innerHTML = "Daten konnten nicht geladen werden.";
  });
}

loadSnapshots();
