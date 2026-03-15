const STUDENT_ACCOUNT_KEY = "campusfoodlink-student-account";
const USER_STORAGE_KEY = "campusfoodlink-user";
const ORDER_STATUS_KEY = "campusfoodlink-order-status";
const ORDER_READY_DELAY_MS = 8000;
const ORDER_COMPLETED_DELAY_MS = 16000;

const mealPlanBalance = document.getElementById("mealPlanBalance");
const accountName = document.getElementById("accountName");
const accountEmail = document.getElementById("accountEmail");
const purchaseCount = document.getElementById("purchaseCount");
const lastPurchaseTotal = document.getElementById("lastPurchaseTotal");
const orderStatusMessage = document.getElementById("orderStatusMessage");
const orderStatusTitle = document.getElementById("orderStatusTitle");
const statusCustomer = document.getElementById("statusCustomer");
const statusLocation = document.getElementById("statusLocation");
const statusItems = document.getElementById("statusItems");
const statusTotal = document.getElementById("statusTotal");
const statusPending = document.getElementById("statusPending");
const statusReady = document.getElementById("statusReady");
const statusCompleted = document.getElementById("statusCompleted");
const purchaseHistoryList = document.getElementById("purchaseHistoryList");
const accountIntro = document.getElementById("accountIntro");
const studentLogout = document.getElementById("studentLogout");
const depositForm = document.getElementById("depositForm");
const depositMessage = document.getElementById("depositMessage");

let currentUser = null;
let currentAccount = null;

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function readStudentAccount() {
  try {
    const storedAccount = JSON.parse(localStorage.getItem(STUDENT_ACCOUNT_KEY) || "null");
    if (storedAccount && typeof storedAccount === "object") {
      return {
        balance: Number(storedAccount.balance ?? 50),
        purchaseHistory: Array.isArray(storedAccount.purchaseHistory) ? storedAccount.purchaseHistory : []
      };
    }
  } catch {
    return {
      balance: 50,
      purchaseHistory: []
    };
  }

  return {
    balance: 50,
    purchaseHistory: []
  };
}

function saveStudentAccount(account) {
  localStorage.setItem(STUDENT_ACCOUNT_KEY, JSON.stringify(account));
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

function renderOrderStatus() {
  const currentOrder = readOrderStatus();
  const statusCards = [statusPending, statusReady, statusCompleted];

  if (!currentOrder) {
    statusCards.forEach((card, index) => {
      card.classList.toggle("is-current", index === 0);
      card.classList.remove("is-complete");
      card.classList.toggle("is-upcoming", index > 0);
    });
    orderStatusTitle.textContent = "No active order yet";
    orderStatusMessage.textContent = "No active order yet. Complete a checkout to start tracking.";
    statusCustomer.textContent = currentUser?.name || "-";
    statusLocation.textContent = "-";
    statusItems.textContent = "0";
    statusTotal.textContent = "$0.00";
    return;
  }

  const stage = getOrderStage(currentOrder);
  statusCards.forEach((card, index) => {
    card.classList.toggle("is-complete", index < stage);
    card.classList.toggle("is-current", index === stage);
    card.classList.toggle("is-upcoming", index > stage);
  });

  const labels = ["Pending", "Ready", "Completed"];
  const messages = [
    "Your order is pending and currently being prepared.",
    "Your order is ready for pickup.",
    "Your order has been completed."
  ];

  orderStatusTitle.textContent = `Order Status: ${labels[stage]}`;
  orderStatusMessage.textContent = messages[stage];
  statusCustomer.textContent = currentOrder.name;
  statusLocation.textContent = currentOrder.location;
  statusItems.textContent = String(currentOrder.itemCount);
  statusTotal.textContent = money(currentOrder.total);
}

function renderPurchaseHistory(history) {
  if (!history.length) {
    purchaseHistoryList.innerHTML = "<p>No purchases yet. Complete a checkout to see your order history here.</p>";
    return;
  }

  purchaseHistoryList.innerHTML = history.map((purchase) => {
    const receiptRows = Array.isArray(purchase.items)
      ? purchase.items.map((item) => {
        const quantity = Number(item.quantity || 0);
        const lineTotal = Number(item.lineTotal ?? ((item.price || 0) * quantity));
        const unitPrice = typeof item.price === "number" ? money(item.price) : "";

        return `
          <div class="receipt-line">
            <div>
              <strong>${quantity}x ${item.name}</strong>
              ${unitPrice ? `<p>${unitPrice} each</p>` : ""}
            </div>
            <span>${money(lineTotal)}</span>
          </div>
        `;
      }).join("")
      : `<div class="receipt-line"><div><strong>Order items</strong><p>Older order details are limited.</p></div><span>${money(purchase.total)}</span></div>`;

    const subtotal = typeof purchase.subtotal === "number"
      ? purchase.subtotal
      : Array.isArray(purchase.items)
        ? purchase.items.reduce((sum, item) => sum + Number(item.lineTotal ?? ((item.price || 0) * (item.quantity || 0))), 0)
        : Math.max(Number(purchase.total || 0) - 1.99, 0);
    const fee = typeof purchase.fee === "number" ? purchase.fee : Number((Number(purchase.total || 0) - subtotal).toFixed(2));

    return `
      <details class="purchase-card" ${history.length === 1 ? "open" : ""}>
        <summary class="purchase-card-header">
          <div>
            <span class="tag">Meal plan receipt</span>
            <h3>${money(purchase.total)}</h3>
          </div>
          <strong>${new Date(purchase.createdAt).toLocaleString()}</strong>
        </summary>
        <div class="receipt-meta">
          <span><strong>Pickup:</strong> ${purchase.location}</span>
          <span><strong>Items:</strong> ${purchase.itemCount}</span>
        </div>
        <div class="receipt-sheet">
          <div class="receipt-lines">
            ${receiptRows}
          </div>
          <div class="receipt-summary">
            <div class="receipt-total-row">
              <span>Subtotal</span>
              <strong>${money(subtotal)}</strong>
            </div>
            <div class="receipt-total-row">
              <span>Service Fee</span>
              <strong>${money(fee)}</strong>
            </div>
            <div class="receipt-total-row grand-total">
              <span>Total</span>
              <strong>${money(purchase.total)}</strong>
            </div>
          </div>
        </div>
      </details>
    `;
  }).join("");
}

function renderAccount(user, account) {
  accountName.textContent = user.name || "Student";
  accountEmail.textContent = user.email || "student@campusfoodlink.com";
  accountIntro.textContent = `Welcome back, ${user.name || "Student"}. Track your meal plan balance and recent purchases.`;
  mealPlanBalance.textContent = money(account.balance);
  purchaseCount.textContent = String(account.purchaseHistory.length);
  lastPurchaseTotal.textContent = account.purchaseHistory.length ? money(account.purchaseHistory[0].total) : "$0.00";
  renderOrderStatus();
  renderPurchaseHistory(account.purchaseHistory);
}

function init() {
  const user = readUser();
  if (!user || user.role !== "student") {
    window.location.href = "./index.html";
    return;
  }

  const account = readStudentAccount();
  saveStudentAccount(account);
  currentUser = user;
  currentAccount = account;
  renderAccount(user, account);
}

studentLogout.addEventListener("click", () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  window.location.href = "./index.html";
});

depositForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedAmount = Number(document.querySelector('input[name="depositAmount"]:checked')?.value || "0");
  if (!currentUser || !currentAccount || !selectedAmount) {
    depositMessage.textContent = "Select a deposit amount first.";
    return;
  }

  currentAccount.balance = Number((currentAccount.balance + selectedAmount).toFixed(2));
  saveStudentAccount(currentAccount);
  renderAccount(currentUser, currentAccount);
  depositMessage.textContent = `Deposit complete, ${currentUser.name} your balance has been updated.`;
});

init();
window.setInterval(renderOrderStatus, 1000);
