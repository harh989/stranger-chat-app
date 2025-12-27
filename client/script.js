// ===== Stranger Chat Frontend (MATCH FIXED) =====

const BACKEND_URL = "https://stranger-chat-backend.onrender.com";

// create socket
window.socket = io(BACKEND_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  reconnection: true
});

// elements
const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const status = document.getElementById("status");

input.disabled = true;
sendBtn.disabled = true;

// when socket connects to server
socket.on("connect", () => {
  status.innerText = "Connected to server. Finding a stranger...";
  socket.emit("findPartner");   // 🔥 IMPORTANT
});

// waiting
socket.on("waiting", () => {
  status.innerText = "Waiting for a stranger...";
  input.disabled = true;
  sendBtn.disabled = true;
});

// matched
socket.on("matched", () => {
  status.innerText = "Connected to a stranger!";
  chat.innerHTML = "";
  input.disabled = false;
  sendBtn.disabled = false;
});

// receive message
socket.on("message", (msg) => {
  chat.innerHTML += `<p><b>Stranger:</b> ${msg}</p>`;
  chat.scrollTop = chat.scrollHeight;
});

// stranger disconnected
socket.on("partnerDisconnected", () => {
  status.innerText = "Stranger disconnected. Refresh to find new one.";
  input.disabled = true;
  sendBtn.disabled = true;
});

// send message
function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  chat.innerHTML += `<p><b>You:</b> ${msg}</p>`;
  socket.emit("message", msg);
  input.value = "";
}

sendBtn.onclick = sendMessage;
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
