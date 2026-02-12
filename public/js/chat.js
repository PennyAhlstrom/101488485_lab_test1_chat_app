const messagesBox = document.getElementById("messagesBox");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const typingIndicator = document.getElementById("typingIndicator");
const alertBox = document.getElementById("alertBox");

const roomBadge = document.getElementById("roomBadge");
const userBadge = document.getElementById("userBadge");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const logoutBtn = document.getElementById("logoutBtn");

function showAlert(msg) {
  alertBox.textContent = msg;
  alertBox.classList.remove("d-none");
}

function requireJSONLocalStorage(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function requireLoginAndRoom() {
  const user = requireJSONLocalStorage("user");
  const room = localStorage.getItem("currentRoom");

  if (!user) {
    window.location.href = "/login";
    return null;
  }
  if (!room) {
    window.location.href = "/rooms";
    return null;
  }
  return { user, room };
}

function escapeHTML(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMessage({ from_user, message, date_sent }, currentUsername) {
  const mine = from_user === currentUsername;

  const wrapper = document.createElement("div");
  wrapper.className = `d-flex mb-2 ${mine ? "justify-content-end" : "justify-content-start"}`;

  wrapper.innerHTML = `
    <div class="p-2 rounded-3 ${mine ? "bg-primary text-white" : "bg-body-secondary"}" style="max-width: 75%;">
      <div class="small fw-semibold">${escapeHTML(from_user)}</div>
      <div>${escapeHTML(message)}</div>
      <div class="small opacity-75 mt-1">${escapeHTML(date_sent || "")}</div>
    </div>
  `;

  messagesBox.appendChild(wrapper);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function loadRoomHistory(room, currentUsername) {
  try {
    const res = await fetch(`/api/messages?room=${encodeURIComponent(room)}`);
    const data = await res.json();

    if (!res.ok) {
      showAlert(data.message || "Could not load message history.");
      return;
    }

    messagesBox.innerHTML = "";
    data.messages.forEach((m) => renderMessage(m, currentUsername));
  } catch {
    showAlert("Server error loading message history.");
  }
}

// ---- Main ----
const auth = requireLoginAndRoom();
if (!auth) throw new Error("Missing auth/room");

const { user, room } = auth;

roomBadge.textContent = `Room: ${room}`;
userBadge.textContent = `User: ${user.username}`;

// Connect socket
const socket = io();

// Join room
socket.emit("joinRoom", { username: user.username, room });

// Load history
loadRoomHistory(room, user.username);

// Receive room messages
socket.on("roomMessage", (msg) => {
  renderMessage(msg, user.username);
});

// Typing indicator
let typingTimeout = null;

messageInput.addEventListener("input", () => {
  socket.emit("typing", { username: user.username, room });

  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping", { username: user.username, room });
  }, 700);
});

socket.on("typing", ({ username }) => {
  if (username === user.username) return;
  typingIndicator.textContent = `${username} is typing...`;
});

socket.on("stopTyping", () => {
  typingIndicator.textContent = "";
});

// Send message
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit("roomMessage", {
    from_user: user.username,
    room,
    message: text,
  });

  messageInput.value = "";
  socket.emit("stopTyping", { username: user.username, room });
});

// Leave room
leaveRoomBtn.addEventListener("click", () => {
  socket.emit("leaveRoom", { username: user.username, room });
  localStorage.removeItem("currentRoom");
  window.location.href = "/rooms";
});

// Logout
logoutBtn.addEventListener("click", () => {
  socket.emit("leaveRoom", { username: user.username, room });
  localStorage.removeItem("user");
  localStorage.removeItem("currentRoom");
  window.location.href = "/login";
});
