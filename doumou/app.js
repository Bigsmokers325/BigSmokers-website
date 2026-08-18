/* ============================================================
   دموع (Doumou) — storefront
   ------------------------------------------------------------
   Instagram and email are not set yet — those links are hidden
   until real values are provided. Update CONTACT below to add them.
   ============================================================ */
const CONTACT = {
  whatsapp: "https://wa.me/13134426433",
  instagram: "", // TODO: add real Instagram handle, e.g. "https://instagram.com/handle"
  email: "", // TODO: add real contact email, e.g. "mailto:hello@example.com"
};

const PAGE_SIZE = 24;

const CATEGORY_STYLE = {
  "Abaya / Kaftan": { mono: "A", grad: "linear-gradient(135deg,#5b3247,#8c3a4a)" },
  "Dress": { mono: "D", grad: "linear-gradient(135deg,#a3495a,#d98a95)" },
  "Hijab / Khimar": { mono: "H", grad: "linear-gradient(135deg,#a3813f,#e0bf7f)" },
  "Jilbab / Prayer": { mono: "J", grad: "linear-gradient(135deg,#2f4a3d,#5c8a71)" },
  "Outerwear": { mono: "O", grad: "linear-gradient(135deg,#2b2b33,#565667)" },
  "Set / Separates": { mono: "S", grad: "linear-gradient(135deg,#8a4a2d,#cf9161)" },
  "Other": { mono: "•", grad: "linear-gradient(135deg,#6c6259,#a89c8c)" },
};

const COLOR_MAP = {
  purple: "#7b4d9e", navy: "#1f2a4a", black: "#111111", coffee: "#4a2f22",
  "army green": "#586843", pink: "#e79cb0", yellow: "#e8c94a", "light blue": "#a7cbe8",
  white: "#f5f5f0", wine: "#5e1f2c", "wine red": "#5e1f2c", orange: "#d8792f",
  green: "#3f6b45", "light green": "#8bbf7a", maroon: "#5e1f2c", beige: "#d8c6a8",
  "sky blue": "#87ceeb", "dusty purple": "#8d738f", khaki: "#a99a6b",
  "light gray": "#c7c2b8", gray: "#8a8a82", grey: "#8a8a82", red: "#a3273a",
  blue: "#2f4d7a", brown: "#6b4a30", gold: "#b6924f", silver: "#b9b9b3",
  mustard: "#c9a23a", teal: "#2e6e6b", burgundy: "#5e1f2c", camel: "#b98a55",
  cream: "#eee3ce", ivory: "#f2ead9", mint: "#a8d8c9", lavender: "#c9b8e0",
  turquoise: "#3fa9a0", plum: "#5b3247", rose: "#c98a94", peach: "#f0b58a",
  charcoal: "#333333", olive: "#6e6b3a", coral: "#e17a5f", "sea green": "#2e6e5c",
  denim: "#3a5a7a", "off white": "#efe9dd", "royal blue": "#2b3f8c", "hot pink": "#e0448f",
};

let PRODUCTS = [];
let state = { cat: "all", query: "", sort: "featured", visible: PAGE_SIZE };

const els = {
  grid: document.getElementById("productGrid"),
  tabs: document.getElementById("categoryTabs"),
  search: document.getElementById("searchInput"),
  sort: document.getElementById("sortSelect"),
  resultCount: document.getElementById("resultCount"),
  clearFilters: document.getElementById("clearFilters"),
  emptyState: document.getElementById("emptyState"),
  emptyClear: document.getElementById("emptyClear"),
  loadMoreBtn: document.getElementById("loadMoreBtn"),
  statCount: document.getElementById("statCount"),
  statCats: document.getElementById("statCats"),
  navToggle: document.getElementById("navToggle"),
  navActions: document.getElementById("navActions"),
};

function colorWords(raw) {
  if (!raw) return [];
  // strip a leading "N Colors" / "N Color" count and parentheses wrapper
  let s = raw.replace(/^\s*\d+\s*Colors?\s*/i, "");
  const m = s.match(/\(([^)]+)\)/);
  if (m) s = m[1];
  return s.split(",").map((c) => c.trim()).filter(Boolean);
}

function colorHex(word) {
  const key = word.toLowerCase().trim();
  return COLOR_MAP[key] || "#a89c8c";
}

function money(n) {
  return "$" + Number(n).toFixed(2);
}

function catStyle(cat) {
  return CATEGORY_STYLE[cat] || CATEGORY_STYLE["Other"];
}

function buildTabs() {
  const cats = Array.from(new Set(PRODUCTS.map((p) => p.category))).sort();
  els.statCats.textContent = cats.length;
  cats.forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.dataset.cat = c;
    btn.textContent = c;
    els.tabs.appendChild(btn);
  });
  els.tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    state.cat = btn.dataset.cat;
    state.visible = PAGE_SIZE;
    [...els.tabs.children].forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
}

function filteredSorted() {
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter((p) => {
    if (state.cat !== "all" && p.category !== state.cat) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.colors.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    );
  });
  if (state.sort === "price-asc") list = list.slice().sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") list = list.slice().sort((a, b) => b.price - a.price);
  else if (state.sort === "name-asc") list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function cardHTML(p) {
  const style = catStyle(p.category);
  const dots = colorWords(p.colors).slice(0, 5)
    .map((c) => `<span class="dot" style="background:${colorHex(c)}"></span>`).join("");
  return `
  <div class="card" data-id="${p.id}">
    <div class="swatch" style="background:${style.grad}">
      <span class="cat-pill">${p.category}</span>
      <span class="mono">${style.mono}</span>
      <div class="dots">${dots}</div>
    </div>
    <div class="card-body">
      <div class="card-cat">${p.sku}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-meta">${p.sizes || "Free size"}</div>
      <div class="card-bottom">
        <div class="card-price">${money(p.price)}</div>
        <div class="card-order">View</div>
      </div>
    </div>
  </div>`;
}

function render() {
  const list = filteredSorted();
  const shown = list.slice(0, state.visible);
  els.grid.innerHTML = shown.map(cardHTML).join("");
  els.resultCount.textContent = `${list.length} style${list.length === 1 ? "" : "s"}`;
  els.emptyState.hidden = list.length !== 0;
  els.grid.hidden = list.length === 0;
  els.loadMoreBtn.style.display = state.visible < list.length ? "inline-block" : "none";
  const filtersActive = state.cat !== "all" || state.query.trim() !== "";
  els.clearFilters.hidden = !filtersActive;
}

function openModal(product) {
  const style = catStyle(product.category);
  document.getElementById("modalSwatch").style.background = style.grad;
  document.getElementById("modalSwatch").innerHTML = `<span class="mono">${style.mono}</span>`;
  document.getElementById("modalCat").textContent = product.category;
  document.getElementById("modalName").textContent = product.name;
  document.getElementById("modalPrice").textContent = money(product.price);
  document.getElementById("modalSku").textContent = product.sku;
  document.getElementById("modalMaterial").textContent = product.material || "—";
  document.getElementById("modalSizes").textContent = product.sizes || "Free size";
  document.getElementById("modalColors").textContent = colorWords(product.colors).join(", ") || "—";
  const msg = encodeURIComponent(
    `Hi Doumou, I'd like to order ${product.name} (SKU ${product.sku}) — ${money(product.price)}. Can you confirm availability, color and size?`
  );
  document.getElementById("modalOrder").href = `${CONTACT.whatsapp}?text=${msg}`;
  document.getElementById("productModal").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("productModal").hidden = true;
  document.body.style.overflow = "";
}

function wireEvents() {
  els.search.addEventListener("input", (e) => {
    state.query = e.target.value;
    state.visible = PAGE_SIZE;
    render();
  });
  els.sort.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });
  els.loadMoreBtn.addEventListener("click", () => {
    state.visible += PAGE_SIZE;
    render();
  });
  els.grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const p = PRODUCTS.find((x) => x.id === card.dataset.id);
    if (p) openModal(p);
  });
  els.clearFilters.addEventListener("click", resetFilters);
  els.emptyClear.addEventListener("click", resetFilters);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  els.navToggle.addEventListener("click", () => {
    const open = els.navActions.classList.toggle("open");
    els.navToggle.setAttribute("aria-expanded", String(open));
  });
}

function resetFilters() {
  state.cat = "all";
  state.query = "";
  state.visible = PAGE_SIZE;
  els.search.value = "";
  [...els.tabs.children].forEach((b) => b.classList.toggle("active", b.dataset.cat === "all"));
  render();
}

function wireContactLinks() {
  document.getElementById("contactCta").href = CONTACT.whatsapp;
  document.getElementById("footerWhatsapp").href = CONTACT.whatsapp;
  const ig = document.getElementById("footerInstagram");
  if (CONTACT.instagram) ig.href = CONTACT.instagram;
  else ig.hidden = true;
  const em = document.getElementById("footerEmail");
  if (CONTACT.email) em.href = CONTACT.email;
  else em.hidden = true;
  document.getElementById("year").textContent = new Date().getFullYear();
}

async function init() {
  wireContactLinks();
  wireEvents();
  try {
    const res = await fetch("data/products.json");
    PRODUCTS = await res.json();
  } catch (err) {
    els.resultCount.textContent = "Could not load the catalog.";
    console.error(err);
    return;
  }
  els.statCount.textContent = PRODUCTS.length;
  buildTabs();
  render();
}

init();
