const state = {
  menu: [],
  cart: JSON.parse(localStorage.getItem("campusfoodlink-cart") || "[]"),
  user: JSON.parse(localStorage.getItem("campusfoodlink-user") || "null"),
  reviews: JSON.parse(localStorage.getItem("campusfoodlink-reviews") || "[]"),
  activeCategory: "all"
};

const MENU_STORAGE_KEY = "campusfoodlink-menu";
const VENDOR_AUTH_KEY = "campusfoodlink-vendor-auth";
const ORDER_STATUS_KEY = "campusfoodlink-order-status";
const STUDENT_ACCOUNT_KEY = "campusfoodlink-student-account";
const ORDER_READY_DELAY_MS = 8000;
const ORDER_COMPLETED_DELAY_MS = 16000;
const DEFAULT_MEAL_PLAN_BALANCE = 50;
const DEMO_VENDOR = {
  email: "vendor@campusfoodlink.com",
  password: "vendor123"
};
const DEMO_STUDENT = {
  name: "Student",
  email: "student@campusfoodlink.com",
  password: "student123"
};

const menuGrid = document.getElementById("menuGrid");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartItems = document.getElementById("cartItems");
const checkoutItems = document.getElementById("checkoutItems");
const summaryCount = document.getElementById("summaryCount");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");
const checkoutNameInput = document.getElementById("checkoutName");
const checkoutEmailInput = document.getElementById("checkoutEmail");
const checkoutLocationInput = document.getElementById("checkoutLocation");
const checkoutAccountHint = document.getElementById("checkoutAccountHint");
const checkoutSubmit = document.getElementById("checkoutSubmit");
const loginToggle = document.getElementById("loginToggle");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const vendorToggle = document.getElementById("vendorToggle");
const vendorModal = document.getElementById("vendorModal");
const closeVendor = document.getElementById("closeVendor");
const cartDrawer = document.getElementById("cartDrawer");
const cartToggle = document.getElementById("cartToggle");
const closeCart = document.getElementById("closeCart");
const goCheckout = document.getElementById("goCheckout");
const loginStatus = document.getElementById("loginStatus");
const checkoutMessage = document.getElementById("checkoutMessage");
const vendorStatus = document.getElementById("vendorStatus");
const reviewThanksModal = document.getElementById("reviewThanksModal");
const closeReviewThanks = document.getElementById("closeReviewThanks");
const reviewThanksConfirm = document.getElementById("reviewThanksConfirm");
const checkoutThanksModal = document.getElementById("checkoutThanksModal");
const closeCheckoutThanks = document.getElementById("closeCheckoutThanks");
const checkoutThanksConfirm = document.getElementById("checkoutThanksConfirm");
const viewOrderStatus = document.getElementById("viewOrderStatus");

function saveOrderStatus(order) {
  localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(order));
}

function readOrderStatus() {
  try {
    const storedOrder = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY) || "null");
    return storedOrder && typeof storedOrder === "object" ? storedOrder : null;
  } catch {
    return null;
  }
}

function getOrderStage(order) {
  if (!order) return -1;

  const elapsed = Date.now() - order.createdAt;
  if (elapsed >= ORDER_COMPLETED_DELAY_MS) {
    return 2;
  }

  if (elapsed >= ORDER_READY_DELAY_MS) {
    return 1;
  }

  return 0;
}

function readStudentAccount() {
  try {
    const storedAccount = JSON.parse(localStorage.getItem(STUDENT_ACCOUNT_KEY) || "null");
    if (storedAccount && typeof storedAccount === "object") {
      return {
        balance: Number(storedAccount.balance ?? DEFAULT_MEAL_PLAN_BALANCE),
        purchaseHistory: Array.isArray(storedAccount.purchaseHistory) ? storedAccount.purchaseHistory : []
      };
    }
  } catch {
    return {
      balance: DEFAULT_MEAL_PLAN_BALANCE,
      purchaseHistory: []
    };
  }

  return {
    balance: DEFAULT_MEAL_PLAN_BALANCE,
    purchaseHistory: []
  };
}

function saveStudentAccount(account) {
  localStorage.setItem(STUDENT_ACCOUNT_KEY, JSON.stringify(account));
}

function isStudentLoggedIn() {
  return state.user?.role === "student";
}

function ensureStudentAccount() {
  const existingAccount = readStudentAccount();
  saveStudentAccount(existingAccount);
  return existingAccount;
}

function syncCheckoutForm() {
  if (isStudentLoggedIn()) {
    checkoutNameInput.value = state.user.name || "Student";
    checkoutEmailInput.value = state.user.email || "";
    checkoutLocationInput.disabled = false;
    checkoutSubmit.disabled = false;
    checkoutAccountHint.textContent = `Meal plan checkout for ${state.user.name || "Student"}.`;
    return;
  }

  checkoutNameInput.value = "";
  checkoutEmailInput.value = "";
  checkoutLocationInput.value = "";
  checkoutLocationInput.disabled = true;
  checkoutSubmit.disabled = true;
  checkoutAccountHint.textContent = "Log in as a student to use your meal plan at checkout.";
}

function scrollToOrderStatus() {
  closeCheckoutThanksModal();
  window.location.href = "./my-account.html#orderStatus";
}

function openReviewThanksModal() {
  reviewThanksModal.classList.remove("hidden");
  reviewThanksModal.setAttribute("aria-hidden", "false");
}

function closeReviewThanksModal() {
  reviewThanksModal.classList.add("hidden");
  reviewThanksModal.setAttribute("aria-hidden", "true");
}

function openCheckoutThanksModal() {
  checkoutThanksModal.classList.remove("hidden");
  checkoutThanksModal.setAttribute("aria-hidden", "false");
}

function closeCheckoutThanksModal() {
  checkoutThanksModal.classList.add("hidden");
  checkoutThanksModal.setAttribute("aria-hidden", "true");
}

function openVendorModal() {
  vendorModal.classList.remove("hidden");
  vendorModal.setAttribute("aria-hidden", "false");
}

function closeVendorModal() {
  vendorModal.classList.add("hidden");
  vendorModal.setAttribute("aria-hidden", "true");
}

function saveCart() {
  localStorage.setItem("campusfoodlink-cart", JSON.stringify(state.cart));
}

function saveUser() {
  localStorage.setItem("campusfoodlink-user", JSON.stringify(state.user));
}

function saveReviews() {
  localStorage.setItem("campusfoodlink-reviews", JSON.stringify(state.reviews));
}

function money(value) {
  return `$${value.toFixed(2)}`;
}

function readManagedMenu() {
  try {
    const storedMenu = JSON.parse(localStorage.getItem(MENU_STORAGE_KEY) || "null");
    return Array.isArray(storedMenu) ? storedMenu : null;
  } catch {
    return null;
  }
}

function isVendorAuthenticated() {
  return localStorage.getItem(VENDOR_AUTH_KEY) === "true";
}

async function loadMenu() {
  try {
    const managedMenu = readManagedMenu();
    if (managedMenu) {
      state.menu = managedMenu;
      renderMenu();
      renderCart();
      renderCheckout();
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
    renderMenu();
  } catch (error) {
    state.menu = [];
    menuGrid.innerHTML = "<p>Unable to load the menu right now. Please try again later.</p>";
    console.error("Failed to load menu data.", error);
  }

  renderCart();
  renderCheckout();
}

function renderMenu() {
  const filtered = state.activeCategory === "all"
    ? state.menu
    : state.menu.filter((item) => item.category === state.activeCategory);

  menuGrid.innerHTML = filtered.map((item) => `
    <article class="menu-card">
      <img src="${item.image}" alt="${item.name}">
      <div class="menu-card-body">
        <span class="tag">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price-row">
          <span class="price">${money(item.price)}</span>
        </div>
        <div class="menu-actions">
          <button class="button-outline button" onclick="viewOnly(${item.id})">Details</button>
          <button class="button" onclick="addToCart(${item.id})">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

function viewOnly(id) {
  const item = state.menu.find((menuItem) => menuItem.id === id);
  if (!item) return;

  alert(`${item.name}\n\n${item.description}\n\nPrice: ${money(item.price)}`);
}

function addToCart(id) {
  const found = state.cart.find((item) => item.id === id);
  if (found) {
    found.quantity += 1;
  } else {
    const menuItem = state.menu.find((item) => item.id === id);
    if (!menuItem) return;

    state.cart.push({ ...menuItem, quantity: 1 });
  }

  saveCart();
  renderCart();
  renderCheckout();
}

function changeQuantity(id, delta) {
  const item = state.cart.find((product) => product.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((product) => product.id !== id);
  }

  saveCart();
  renderCart();
  renderCheckout();
}

function removeItem(id) {
  state.cart = state.cart.filter((product) => product.id !== id);
  saveCart();
  renderCart();
  renderCheckout();
}

function getCartSubtotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartCount() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
  cartCount.textContent = getCartCount();
  cartTotal.textContent = money(getCartSubtotal());

  if (!state.cart.length) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartItems.innerHTML = state.cart.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <p>${money(item.price)}</p>
        <div class="qty-controls">
          <button class="qty-button" onclick="changeQuantity(${item.id}, -1)">&minus;</button>
          <span>${item.quantity}</span>
          <button class="qty-button" onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
      <div class="item-side">
        <strong>${money(item.price * item.quantity)}</strong>
        <br>
        <button class="remove-link" onclick="removeItem(${item.id})">Remove</button>
      </div>
    </div>
  `).join("");
}

function renderCheckout() {
  const subtotal = getCartSubtotal();
  const fee = 1.99;
  const total = subtotal + fee;

  summaryCount.textContent = getCartCount();
  summarySubtotal.textContent = money(subtotal);
  summaryTotal.textContent = money(total);

  if (!state.cart.length) {
    checkoutItems.innerHTML = "<p>No items selected yet.</p>";
    return;
  }

  checkoutItems.innerHTML = state.cart.map((item) => `
    <div class="checkout-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <p>Qty: ${item.quantity}</p>
      </div>
      <div class="item-side">
        <strong>${money(item.price * item.quantity)}</strong>
      </div>
    </div>
  `).join("");
}

document.getElementById("filterBar").addEventListener("click", (event) => {
  const button = event.target.closest(".filter-button");
  if (!button) return;

  document.querySelectorAll(".filter-button").forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");
  state.activeCategory = button.dataset.category;
  renderMenu();
});

loginToggle.addEventListener("click", () => {
  if (isStudentLoggedIn()) {
    window.location.href = "./my-account.html";
    return;
  }

  loginModal.classList.remove("hidden");
  loginModal.setAttribute("aria-hidden", "false");
});

vendorToggle.addEventListener("click", () => {
  if (isVendorAuthenticated()) {
    window.location.href = "./manage-menu.html";
    return;
  }

  openVendorModal();
});

closeLogin.addEventListener("click", () => {
  loginModal.classList.add("hidden");
  loginModal.setAttribute("aria-hidden", "true");
});

closeVendor.addEventListener("click", () => {
  closeVendorModal();
});

cartToggle.addEventListener("click", () => {
  cartDrawer.classList.remove("hidden");
  cartDrawer.setAttribute("aria-hidden", "false");
});

closeCart.addEventListener("click", () => {
  cartDrawer.classList.add("hidden");
  cartDrawer.setAttribute("aria-hidden", "true");
});

goCheckout.addEventListener("click", () => {
  cartDrawer.classList.add("hidden");
  cartDrawer.setAttribute("aria-hidden", "true");
});

closeReviewThanks.addEventListener("click", closeReviewThanksModal);
reviewThanksConfirm.addEventListener("click", closeReviewThanksModal);
closeCheckoutThanks.addEventListener("click", closeCheckoutThanksModal);
checkoutThanksConfirm.addEventListener("click", closeCheckoutThanksModal);
viewOrderStatus.addEventListener("click", scrollToOrderStatus);

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  if (email !== DEMO_STUDENT.email || password !== DEMO_STUDENT.password) {
    loginStatus.textContent = "Use the demo student credentials shown above.";
    return;
  }

  state.user = { name: DEMO_STUDENT.name, email: DEMO_STUDENT.email, role: "student" };
  saveUser();
  ensureStudentAccount();
  syncCheckoutForm();

  loginStatus.textContent = "Student login successful.";
  loginToggle.textContent = "My Account";
  setTimeout(() => {
    loginModal.classList.add("hidden");
    loginModal.setAttribute("aria-hidden", "true");
    window.location.href = "./my-account.html";
  }, 700);
});

document.getElementById("vendorForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("vendorEmail").value.trim().toLowerCase();
  const password = document.getElementById("vendorPassword").value.trim();

  if (email !== DEMO_VENDOR.email || password !== DEMO_VENDOR.password) {
    vendorStatus.textContent = "Use the demo vendor credentials shown above.";
    return;
  }

  localStorage.setItem(VENDOR_AUTH_KEY, "true");
  vendorStatus.textContent = "Opening Manage Menu...";
  window.location.href = "./manage-menu.html";
});

document.getElementById("reviewForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const reviewNameInput = document.getElementById("reviewName");
  const reviewEmailInput = document.getElementById("reviewEmail");
  const reviewTextInput = document.getElementById("reviewText");
  const name = reviewNameInput.value.trim();
  const email = reviewEmailInput.value.trim();
  const text = reviewTextInput.value.trim();

  if (!name || !email || !text) {
    const firstBlankInput = [reviewNameInput, reviewEmailInput, reviewTextInput]
      .find((input) => !input.value.trim());
    if (firstBlankInput) {
      firstBlankInput.focus();
      firstBlankInput.setCustomValidity("Please fill out this field.");
      firstBlankInput.reportValidity();
      firstBlankInput.setCustomValidity("");
    }

    return;
  }

  state.reviews.unshift({ name, email, text });
  saveReviews();
  event.target.reset();
  openReviewThanksModal();
});

document.getElementById("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.cart.length) {
    checkoutMessage.textContent = "Add menu items before checkout.";
    return;
  }

  const name = state.user?.name?.trim() || "";
  const email = state.user?.email?.trim() || "";
  const location = checkoutLocationInput.value.trim();

  if (!name || !email || !location) {
    checkoutMessage.textContent = isStudentLoggedIn()
      ? "Complete the pickup location before submitting."
      : "Log in as a student to complete checkout.";
    return;
  }

  const itemCount = getCartCount();
  const subtotal = getCartSubtotal();
  const fee = 1.99;
  const total = subtotal + fee;
  if (!isStudentLoggedIn()) {
    checkoutMessage.textContent = "Log in as a student to pay with your meal plan.";
    return;
  }

  const studentAccount = ensureStudentAccount();
  if (studentAccount.balance < total) {
    checkoutMessage.textContent = "Insufficient meal plan balance for this order.";
    return;
  }

  studentAccount.balance = Number((studentAccount.balance - total).toFixed(2));
  studentAccount.purchaseHistory.unshift({
    id: Date.now(),
    createdAt: new Date().toISOString(),
    name,
    location,
    itemCount,
    subtotal,
    fee,
    total,
    items: state.cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.price * item.quantity
    }))
  });
  saveStudentAccount(studentAccount);

  checkoutMessage.textContent = "";
  saveOrderStatus({
    name,
    email,
    location,
    itemCount,
    total,
    createdAt: Date.now()
  });

  state.cart = [];
  saveCart();
  renderCart();
  renderCheckout();
  event.target.reset();
  syncCheckoutForm();
  openCheckoutThanksModal();
});

if (state.user?.name) {
  loginToggle.textContent = state.user.role === "student" ? "My Account" : state.user.name;
}

if (isVendorAuthenticated()) {
  vendorToggle.textContent = "Manage Menu";
}

loadMenu();
syncCheckoutForm();
