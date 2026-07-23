const container = document.getElementById("sets-container");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createItem(item) {
  return `
    <a
      class="item-card"
      href="${escapeHtml(item.link)}"
      target="_blank"
      rel="noopener sponsored"
      aria-label="Mua ${escapeHtml(item.name)} trên Shopee"
    >
      <div class="item-image">
        <img
          src="${escapeHtml(item.image)}"
          alt="${escapeHtml(item.name)}"
          loading="lazy"
        >
      </div>

      <div class="item-info">
        <p class="item-eyebrow">${escapeHtml(item.eyebrow)}</p>
        <p class="item-name">${escapeHtml(item.name)}</p>
        <span class="item-cta">Mua trên Shopee →</span>
      </div>
    </a>
  `;
}

function createSet(set) {
  const items = Array.isArray(set.items)
    ? set.items.map(createItem).join("")
    : "";

  return `
    <section class="set-card" id="${escapeHtml(set.id)}">
      <div class="set-hero">
        <img
          src="${escapeHtml(set.hero)}"
          alt="${escapeHtml(set.name)}"
        >
        <span class="set-badge">${escapeHtml(set.badge)}</span>
      </div>

      <div class="set-body">
        <h2 class="set-name">${escapeHtml(set.name)}</h2>
        <p class="set-subtitle">${escapeHtml(set.subtitle)}</p>
        <p class="set-intro">${escapeHtml(set.intro)}</p>
      </div>

      <div class="items-grid">
        ${items}
      </div>
    </section>
  `;
}

async function loadProducts() {
  try {
    const response = await fetch("products.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Không tải được products.json: ${response.status}`);
    }

    const data = await response.json();
    const sets = Array.isArray(data.sets) ? data.sets : [];

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

    if (!sets.length) {
      container.innerHTML =
        '<p class="state-msg">Chưa có set đồ nào.</p>';
      return;
    }

    container.innerHTML = sets.map(createSet).join("");
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p class="state-msg">
        Không tải được danh sách sản phẩm.<br>
        Vui lòng thử lại sau.
      </p>
    `;
  }
}

loadProducts();
