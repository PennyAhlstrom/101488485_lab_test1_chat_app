// public/js/rooms.js

const rooms = [
  "chit-chat",
  "gossip",
  "secrets",
  "spilling-beans",
  "small-talk",
  "blabber",
  "hearsay"
];

const roomList = document.getElementById("roomList");
const alertBox = document.getElementById("alertBox");
const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

function showAlert(message, type = "danger") {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
}

function requireLogin() {
  const raw = localStorage.getItem("user");
  if (!raw) {
    window.location.href = "/login";
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    window.location.href = "/login";
    return null;
  }
}

function renderRooms() {
  roomList.innerHTML = "";

  rooms.forEach((roomName) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    btn.innerHTML = `
      <span class="fw-semibold">${roomName}</span>
      <span class="badge text-bg-primary rounded-pill">Join</span>
    `;

    btn.addEventListener("click", () => {
      // Save selected room for chat page to use
      localStorage.setItem("currentRoom", roomName);

      // Optional: clear any last private chat target you might add later
      // localStorage.removeItem("currentDMUser");

      window.location.href = "/chat";
    });

    roomList.appendChild(btn);
  });
}

// --- Run ---
const user = requireLogin();
if (user) {
  welcomeText.textContent = `Logged in as ${user.username}`;
  renderRooms();
}

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  localStorage.removeItem("currentRoom");
  window.location.href = "/login";
});
