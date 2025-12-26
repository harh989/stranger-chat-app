const socket = io("YOUR_BACKEND_URL"); // CHANGE AFTER DEPLOY

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const status = document.getElementById("status");
const typingText = document.getElementById("typing");

let escCount = 0;
let typingTimeout;

socket.on("waiting", () => {
  status.innerText = "Waiting for a stranger...";
});

socket.on("matched", () => {
  status.innerText = "Connected!";
  input.disabled = false;
  sendBtn.disabled = false;
  chat.innerHTML = "";
});

socket.on("message", (msg) => {
  chat.innerHTML += `<p><b>Stranger:</b> ${msg}</p>`;
});

sendBtn.onclick = sendMessage;
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  if (!input.value.trim()) return;
  chat.innerHTML += `<p><b>You:</b> ${input.value}</p>`;
  socket.emit("message", input.value);
  input.value = "";
  socket.emit("stopTyping");
}

input.addEventListener("input", () => {
  socket.emit("typing");
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping");
  }, 800);
});

socket.on("typing", (isTyping) => {
  typingText.innerText = isTyping ? "Stranger is typing..." : "";
});

socket.on("partnerDisconnected", () => {
  status.innerText = "Stranger disconnected. Refresh to reconnect.";
  input.disabled = true;
  sendBtn.disabled = true;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    escCount++;
    if (escCount === 1) {
      alert("Press ESC again to disconnect");
      setTimeout(() => escCount = 0, 1500);
    } else if (escCount === 2) {
      location.reload();
    }
  }
});
