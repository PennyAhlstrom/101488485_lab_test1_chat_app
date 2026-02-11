const userList = document.getElementById("userList");
const dmMessages = document.getElementById("dmMessages");
const dmForm = document.getElementById("dmForm");
const dmInput = document.getElementById("dmInput");
const dmHeader = document.getElementById("dmHeader");
const meBadge = document.getElementById("meBadge");
const dmTyping = document.getElementById("dmTyping");
const alertBox = document.getElementById("alertBox");
const logoutBtn = document.getElementById("logoutBtn");

function showAlert(msg) {
  alertBox.textContent = msg;
  alertBox.classList.remove("d-none");
}

function requireUser() {
  const raw = localStorage.getItem("user");
  if (!raw) {
    window.location.href = "/login";
    return null;
  }
  try { return JSON.parse(raw); } catch { return null; }
}

function escapeHTML(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderDM(msg, me) {
  const mine = msg.from_user === me;

  const wrapper = document.createElement("div");
  wrapper.className = `d-flex mb-2 ${mine ? "justify-content-end" : "justify-content-start"}`;

  wrapper.innerHTML = `
    <div class="p-2 rounded-3 ${mine ? "bg-primary text-white" : "bg-body-secondary"}" style="max-width: 75%;">
      <div class="small fw-semibold">${escapeHTML(msg.from_user)} → ${escapeHTML(msg.to_user)}</div>
      <div>${escapeHTML(msg.message)}</div>
      <div class="small opacity-75 mt-1">${escapeHTML(msg.date_sent || "")}</div>
    </div>
  `;

  dmMessages.appendChild(wrapper);
  dmMessages.scrollTop = dmMessages.scrollHeight;
}

async function loadUsers(me) {
  const res = await fetch("/api/users");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load users");
  return data.users.filter(u => u !== me);
}

async function loadHistory(me, other) {
  const res = await fetch(`/api/private-messages?user=${encodeURIComponent(me)}&with=${encodeURIComponent(other)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load DM history");

  dmMessages.innerHTML = "";
  data.messages.forEach(m => renderDM(m, me));
}

const me = requireUser();
if (!me) throw new Error("Not logged in");
meBadge.textContent = `You: ${me.username}`;

let currentDMUser = localStorage.getItem("currentDMUser") || "";
let typingTimer = null;

const socket = io();
socket.emit("registerUser", { username: me.username });

function setCurrentDMUser(username) {
  currentDMUser = username;
  localStorage.setItem("currentDMUser", username);
  dmHeader.textContent = `DM with: ${username}`;
  dmTyping.textContent = "";
}

function renderUserButton(username) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `list-group-item list-group-item-action ${username === currentDMUser ? "active" : ""}`;
  btn.textContent = username;

  btn.addEventListener("click", async () => {
    setCurrentDMUser(username);

    // rerender list highlight
    [...userList.children].forEach(el => el.classList.remove("active"));
    btn.classList.add("active");

    try {
      await loadHistory(me.username, currentDMUser);
    } catch (e) {
      showAlert(e.message);
    }
  });

  userList.appendChild(btn);
}

(async () => {
  try {
    const users = await loadUsers(me.username);
    userList.innerHTML = "";
    users.forEach(renderUserButton);

    // if a DM user was already selected before, auto-load
    if (currentDMUser && users.includes(currentDMUser)) {
      setCurrentDMUser(currentDMUser);
      await loadHistory(me.username, currentDMUser);

      // highlight selection
      [...userList.children].forEach(el => {
        if (el.textContent === currentDMUser) el.classList.add("active");
      });
    }
  } catch (e) {
    showAlert(e.message);
  }
})();

// receive live private messages
socket.on("privateMessage", (msg) => {
  // Only auto-render if it belongs to the currently open DM
  const other = currentDMUser;
  if (!other) return;

  const isBetween =
    (msg.from_user === me.username && msg.to_user === other) ||
    (msg.from_user === other && msg.to_user === me.username);

  if (isBetween) renderDM(msg, me.username);
});

// typing indicator for DM
dmInput.addEventListener("input", () => {
  if (!currentDMUser) return;

  socket.emit("privateTyping", { from_user: me.username, to_user: currentDMUser });

  if (typingTimer) clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit("privateStopTyping", { to_user: currentDMUser });
  }, 700);
});

socket.on("privateTyping", ({ from_user }) => {
  if (!currentDMUser) return;
  if (from_user !== currentDMUser) return;
  dmTyping.textContent = `${from_user} is typing...`;
});

socket.on("privateStopTyping", () => {
  dmTyping.textContent = "";
});

// send DM
dmForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentDMUser) {
    showAlert("Select a user first.");
    return;
  }

  const text = dmInput.value.trim();
  if (!text) return;

  socket.emit("privateMessage", {
    from_user: me.username,
    to_user: currentDMUser,
    message: text,
  });

  dmInput.value = "";
  socket.emit("privateStopTyping", { to_user: currentDMUser });
});

// logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  localStorage.removeItem("currentRoom");
  localStorage.removeItem("currentDMUser");
  window.location.href = "/login";
});
