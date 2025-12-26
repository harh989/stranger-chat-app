const socket = io();
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("msg");
const statusText = document.getElementById("status");
const typingText = document.getElementById("typing");

let escPressed = false;
let typingTimeout;

function addMsg(text, cls) {
  const div = document.createElement("div");
  div.className = "msg " + cls;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on("waiting", () => {
  statusText.innerText = "Waiting to connect with a stranger…";
  addMsg("Waiting for a stranger…", "system");
});

socket.on("matched", () => {
  statusText.innerText = "Connected with a stranger";
  addMsg("Connected with a stranger", "system");
});

socket.on("message", (msg) => {
  addMsg(msg, "stranger");
});

socket.on("typing", () => {
  typingText.innerText = "Stranger is typing…";
});

socket.on("stop_typing", () => {
  typingText.innerText = "";
});

function send() {
  if (!input.value.trim()) return;
  socket.emit("message", input.value);
  addMsg(input.value, "you");
  input.value = "";
  socket.emit("stop_typing");
}

input.addEventListener("input", () => {
  socket.emit("typing");
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stop_typing");
  }, 1000);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!escPressed) {
      escPressed = true;
      addMsg("Press ESC again to disconnect", "system");
      setTimeout(() => escPressed = false, 2000);
    } else {
      socket.emit("disconnect_me");
      escPressed = false;
    }
  }
});
