// ===== Stranger Chat Frontend (FINAL FIX) =====

// IMPORTANT: backend base URL
const BACKEND_URL = "https://stranger-chat-backend.onrender.com";

// Force socket.io path + websocket
window.socket = io(BACKEND_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 20000
});

// Elements
const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const status = document.getElementById("status");
const typingText = document.getElementById("typing");

// Disable input initially
input.disabled = true;
sendBtn.disabled = true;

// ---- SOCKET EVENTS ----

socket.on("connect", () => {
  status.innerText = "Connected to server, waiting for stranger...";
});

socket.on("waiting", () => {
  status.innerText = "Waiting for a stranger...";
  input.disabled = true;
  sendBtn.disabled = true;
});

socket.on("matched", () => {
  status.innerText = "Connected!";
  chat.innerHTML = "";
  input.disabled = false;
  sendBtn.disabled = false;
});

socket.on("message", (msg) => {
  chat.innerHTML += `<p><b>Stranger:</b> ${msg}</p>`;
  chat.scrollTop = chat.scrollHeight;
});

socket.on("partnerDisconnected", () => {
  status.innerText = "Stranger disconnected. Refresh to reconnect.";
  input.disabled = true;
  sendBtn.disabled = true;
});

// ---- SEND MESSAGE ----

function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  chat.innerHTML += `<p><b>You:</b> ${msg}</p>`;
  socket.emit("message", msg);
  input.value = "";
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
