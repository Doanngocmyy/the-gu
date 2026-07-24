const container = document.getElementById("sets-container");
const tabsEl = document.getElementById("season-tabs");

const SEASON_LABELS = {
  summer: "Summer",
  winter: "Winter"
};

let allSets = [];
let seasonOrder = ["summer", "winter"];
let activeSeason = "summer";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSeasonOrder(settings) {
  if (settings && Array.isArray(settings.seasonOrder) && settings.seasonOrder.length) {
    return settings.seasonOrder;
  }
  return ["summer", "winter"];
}

function pickActiveSeason(settings, sets, order) {
  const featured = (settings && settings.featuredSeason) || order[0];
  const hasFeatured = sets.some((set) => set.season === featured);
  if (hasFeatured) return featured;

  const firstWithSets = order.find((season) =>
    sets.some((set) => set.season === season)
  );
  return firstWithSets || featured;
}

function createMiniItem(item) {
  const imgStyle = item.imagePosition
    ? ` style="object-position: ${escapeHtml(item.imagePosition)};"`
    : "";

  return `
    <a
      class="mini-item"
      href="${escapeHtml(item.link)}"
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label="Mua ${escapeHtml(item.name)} trên Shopee"
      title="${escapeHtml(item.name)}"
    >
      <img
        src="${escapeHtml(item.image)}"
        alt="${escapeHtml(item.name)}"
        loading="lazy"${imgStyle}
      >
      <span class="mini-buy-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8h12l1.2 12.5a1 1 0 0 1-1 1.5H5.8a1 1 0 0 1-1-1.5L6 8z"></path>
          <path d="M9 8V6a3 3 0 0 1 6 0v2"></path>
        </svg>
        <span class="mini-buy-text">Mua ngay</span>
      </span>
    </a>
  `;
}

function createOutfitCard(set) {
  const items = Array.isArray(set.items) ? set.items : [];
  const badgeLabel = set.badge || SEASON_LABELS[set.season] || set.season;
  const fullTitle = set.subtitle ? `${set.name} — ${set.subtitle}` : set.name;
  const heroStyle = set.heroPosition
    ? ` style="object-position: ${escapeHtml(set.heroPosition)};"`
    : "";

  return `
    <article class="outfit-card" id="${escapeHtml(set.id)}">
      <div class="outfit-hero">
        <img
          src="${escapeHtml(set.hero)}"
          alt="${escapeHtml(fullTitle)}"
          loading="lazy"${heroStyle}
        >
        <span class="outfit-badge">${escapeHtml(badgeLabel)}</span>
      </div>
      <div class="outfit-content">
        <h2 class="outfit-name" title="${escapeHtml(fullTitle)}">${escapeHtml(set.name)}</h2>
        <div class="item-thumbnails" data-count="${items.length}">
          ${items.map(createMiniItem).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderSeasonTabs() {
  tabsEl.innerHTML = seasonOrder
    .map((season) => {
      const count = allSets.filter((set) => set.season === season).length;
      const disabled = count === 0;
      const label = SEASON_LABELS[season] || season;
      const classes = [
        "season-tab",
        season === activeSeason ? "active" : "",
        disabled ? "disabled" : ""
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <button
          type="button"
          class="${classes}"
          data-season="${escapeHtml(season)}"
          role="tab"
          aria-selected="${season === activeSeason}"
          ${disabled ? "disabled aria-disabled=\"true\"" : ""}
        >${escapeHtml(label)}</button>
      `;
    })
    .join("");
}

function renderGrid() {
  const filtered = allSets.filter((set) => set.season === activeSeason);

  if (!filtered.length) {
    container.innerHTML = '<p class="state-msg">Chưa có set đồ nào cho mùa này.</p>';
    return;
  }

  container.innerHTML = filtered.map(createOutfitCard).join("");
}

tabsEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".season-tab");
  if (!btn || btn.disabled) return;

  const season = btn.dataset.season;
  if (season === activeSeason) return;

  activeSeason = season;
  renderSeasonTabs();
  renderGrid();
});

async function loadProducts() {
  try {
    const response = await fetch("products.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Không tải được products.json: ${response.status}`);
    }

    const data = await response.json();
    allSets = Array.isArray(data.sets) ? data.sets : [];
    seasonOrder = getSeasonOrder(data.settings);
    activeSeason = pickActiveSeason(data.settings, allSets, seasonOrder);

    if (data.social) {
      const tiktokLink = document.getElementById("tiktok-link");
      const handles = document.querySelectorAll(".tiktok-handle");

      if (tiktokLink && data.social.tiktok_url) {
        tiktokLink.href = data.social.tiktok_url;
      }

      handles.forEach((element) => {
        element.textContent =
          data.social.tiktok_handle || "@thegu_myy";
      });
    }

    if (!allSets.length) {
      tabsEl.innerHTML = "";
      container.innerHTML = '<p class="state-msg">Chưa có set đồ nào.</p>';
      return;
    }

    renderSeasonTabs();
    renderGrid();
  } catch (error) {
    console.error(error);

    tabsEl.innerHTML = "";
    container.innerHTML = `
      <p class="state-msg">
        Không tải được danh sách sản phẩm.<br>
        Vui lòng thử lại sau.
      </p>
    `;
  }
}

loadProducts();
