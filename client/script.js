// ===== Stranger Chat (FINAL WORKING CLIENT) =====

const BACKEND_URL = "https://stranger-chat-backend.onrender.com";

const socket = io(BACKEND_URL, {
  transports: ["websocket"]
});

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const status = document.getElementById("status");

input.disabled = true;
sendBtn.disabled = true;

// Ask for partner AFTER connection
socket.on("connect", () => {
  status.innerText = "Connected to server. Finding stranger...";
  socket.emit("findPartner");
});

socket.on("waiting", () => {
  status.innerText = "Waiting for a stranger...";
});

socket.on("matched", () => {
  status.innerText = "Connected to a stranger!";
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
