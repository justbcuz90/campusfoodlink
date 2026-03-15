const MENU_STORAGE_KEY = "campusfoodlink-menu";
const VENDOR_AUTH_KEY = "campusfoodlink-vendor-auth";

const state = {
  menu: []
};

const manageMenuGrid = document.getElementById("manageMenuGrid");
const manageMenuForm = document.getElementById("manageMenuForm");
const manageFormTitle = document.getElementById("manageFormTitle");
const manageMenuStatus = document.getElementById("manageMenuStatus");
const resetFormButton = document.getElementById("resetFormButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const vendorLogout = document.getElementById("vendorLogout");
const menuItemId = document.getElementById("menuItemId");
const menuItemName = document.getElementById("menuItemName");
const menuItemCategory = document.getElementById("menuItemCategory");
const menuItemPrice = document.getElementById("menuItemPrice");
const menuItemDescription = document.getElementById("menuItemDescription");
const menuItemImageUrl = document.getElementById("menuItemImageUrl");
const menuItemImageFile = document.getElementById("menuItemImageFile");
const menuImageCurrent = document.getElementById("menuImageCurrent");
const menuImagePreview = document.getElementById("menuImagePreview");

function isVendorAuthenticated() {
  return localStorage.getItem(VENDOR_AUTH_KEY) === "true";
}

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function saveMenu() {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(state.menu));
}

function readStoredMenu() {
  try {
    const storedMenu = JSON.parse(localStorage.getItem(MENU_STORAGE_KEY) || "null");
    return Array.isArray(storedMenu) ? storedMenu : null;
  } catch {
    return null;
  }
}

async function loadMenu() {
  const storedMenu = readStoredMenu();
  if (storedMenu) {
    state.menu = storedMenu;
    renderManageMenu();
    return;
  }

  const response = await fetch("data/menu.json");
  if (!response.ok) {
    throw new Error(`Menu request failed with status ${response.status}.`);
  }

  const menu = await response.json();
  if (!Array.isArray(menu)) {
    throw new Error("Menu data must be an array.");
  }

  state.menu = menu;
  saveMenu();
  renderManageMenu();
}

function renderManageMenu() {
  if (!state.menu.length) {
    manageMenuGrid.innerHTML = "<p>No menu items found yet.</p>";
    return;
  }

  manageMenuGrid.innerHTML = state.menu.map((item) => `
    <article class="manage-item-card">
      <img src="${item.image}" alt="${item.name}">
      <div class="manage-item-body">
        <span class="tag">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="manage-item-meta">
          <strong>${money(item.price)}</strong>
          <button class="button button-outline button-small" type="button" data-edit-id="${item.id}">Edit</button>
        </div>
      </div>
    </article>
  `).join("");
}

function resetForm(clearStatus = true) {
  manageMenuForm.reset();
  menuItemId.value = "";
  menuImageCurrent.value = "";
  manageFormTitle.textContent = "Add Menu Item";
  if (clearStatus) {
    manageMenuStatus.textContent = "";
  }
  updatePreview("");
}

function updatePreview(src) {
  if (!src) {
    menuImagePreview.classList.add("hidden");
    menuImagePreview.removeAttribute("src");
    return;
  }

  menuImagePreview.src = src;
  menuImagePreview.classList.remove("hidden");
}

function populateForm(itemId) {
  const item = state.menu.find((menuItem) => menuItem.id === itemId);
  if (!item) return;

  menuItemId.value = String(item.id);
  menuItemName.value = item.name;
  menuItemCategory.value = item.category;
  menuItemPrice.value = String(item.price);
  menuItemDescription.value = item.description;
  menuItemImageUrl.value = item.image.startsWith("data:") ? "" : item.image;
  menuImageCurrent.value = item.image;
  menuItemImageFile.value = "";
  manageFormTitle.textContent = `Update ${item.name}`;
  manageMenuStatus.textContent = `Editing ${item.name}.`;
  updatePreview(item.image);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

manageMenuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-id]");
  if (!button) return;

  populateForm(Number(button.dataset.editId));
});

resetFormButton.addEventListener("click", resetForm);
cancelEditButton.addEventListener("click", resetForm);

menuItemImageUrl.addEventListener("input", () => {
  if (menuItemImageUrl.value.trim()) {
    updatePreview(menuItemImageUrl.value.trim());
  } else if (menuImageCurrent.value) {
    updatePreview(menuImageCurrent.value);
  } else {
    updatePreview("");
  }
});

menuItemImageFile.addEventListener("change", async () => {
  const [file] = menuItemImageFile.files;
  if (!file) {
    updatePreview(menuItemImageUrl.value.trim() || menuImageCurrent.value);
    return;
  }

  try {
    const imageData = await readImageFile(file);
    updatePreview(imageData);
  } catch (error) {
    manageMenuStatus.textContent = error.message;
  }
});

manageMenuForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = menuItemName.value.trim();
  const category = menuItemCategory.value;
  const price = Number(menuItemPrice.value);
  const description = menuItemDescription.value.trim();
  const imageUrl = menuItemImageUrl.value.trim();
  const currentImage = menuImageCurrent.value.trim();
  const uploadedImage = await readImageFile(menuItemImageFile.files[0]);
  const image = uploadedImage || imageUrl || currentImage;

  if (!name || !category || !description || !image || Number.isNaN(price) || price < 0) {
    manageMenuStatus.textContent = "Complete all item fields before saving.";
    return;
  }

  const existingId = Number(menuItemId.value);
  const nextId = state.menu.length ? Math.max(...state.menu.map((item) => item.id)) + 1 : 1;
  const itemPayload = {
    id: existingId || nextId,
    name,
    category,
    price,
    image,
    description
  };

  if (existingId) {
    state.menu = state.menu.map((item) => item.id === existingId ? itemPayload : item);
    manageMenuStatus.textContent = `${name} updated successfully.`;
  } else {
    state.menu.unshift(itemPayload);
    manageMenuStatus.textContent = `${name} added to the menu.`;
  }

  saveMenu();
  renderManageMenu();
  resetForm(false);
});

vendorLogout.addEventListener("click", () => {
  localStorage.removeItem(VENDOR_AUTH_KEY);
  window.location.href = "./index.html";
});

async function init() {
  if (!isVendorAuthenticated()) {
    window.location.href = "./index.html";
    return;
  }

  try {
    await loadMenu();
  } catch (error) {
    manageMenuGrid.innerHTML = "<p>Unable to load menu items right now.</p>";
    manageMenuStatus.textContent = "Menu data could not be loaded.";
    console.error("Failed to load vendor menu.", error);
  }
}

init();
