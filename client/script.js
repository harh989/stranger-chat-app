// ===============================
// Stranger Chat - Frontend Logic
// Production Ready (Render + Netlify)
// ===============================

// 🔴 IMPORTANT: backend URL
const BACKEND_URL = "https://stranger-chat-backend.onrender.com";

// Create socket connection (force websocket)
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  reconnection: true,
});

// DOM elements
const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const status = document.getElementById("status");
const typingText = document.getElementById("typing");

let escCount = 0;
let typingTimeout;

// Initial state
input.disabled = true;
sendBtn.disabled = true;

// -------------------------------
// Socket events
// -------------------------------

// Waiting for partner
socket.on("waiting", () => {
  status.innerText = "Waiting for a stranger...";
  input.disabled = true;
  sendBtn.disabled = true;
});

// Matched with partner
socket.on("matched", () => {
  status.innerText = "Connected!";
  chat.innerHTML = "";
  input.disabled = false;
  sendBtn.disabled = false;
});

// Receive message
socket.on("message", (msg) => {
  chat.innerHTML += `<p><b>Stranger:</b> ${msg}</p>`;
  chat.scrollTop = chat.scrollHeight;
});

// Typing indicator
socket.on("typing", (isTyping) => {
  typingText.innerText = isTyping ? "Stranger is typing..." : "";
});

// Partner disconnected
socket.on("partnerDisconnected", () => {
  status.innerText = "Stranger disconnected. Refresh to connect again.";
  input.disabled = true;
  sendBtn.disabled = true;
  typingText.innerText = "";
});

// -------------------------------
// Send message
// -------------------------------

function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  chat.innerHTML += `<p><b>You:</b> ${msg}</p>`;
  chat.scrollTop = chat.scrollHeight;

  socket.emit("message", msg);
  input.value = "";
  socket.emit("stopTyping");
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// -------------------------------
// Typing detection
// -------------------------------

input.addEventListener("input", () => {
  socket.emit("typing");
  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping");
  }, 800);
});

// -------------------------------
// ESC double-press to disconnect
// -------------------------------

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    escCount++;

    if (escCount === 1) {
      alert("Press ESC again to disconnect");
      setTimeout(() => {
        escCount = 0;
      }, 1500);
    } else if (escCount === 2) {
      location.reload();
    }
  }
});
