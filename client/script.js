const status = document.getElementById("status");
const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");

// 🔁 REPLACE with your actual Worker URL
const ws = new WebSocket(
  "wss://stranger-chat-worker.<your-username>.workers.dev"
);

ws.onopen = () => {
  status.innerText = "Connected to server, waiting for stranger...";
};

ws.onmessage = (e) => {
  if (e.data === "WAITING") {
    status.innerText = "Waiting for stranger...";
  } else if (e.data === "CONNECTED") {
    status.innerText = "Connected to a stranger!";
    input.disabled = false;
    sendBtn.disabled = false;
  } else {
    chat.innerHTML += `<p><b>Stranger:</b> ${e.data}</p>`;
  }
};

sendBtn.onclick = () => {
  if (!input.value.trim()) return;
  ws.send(input.value);
  chat.innerHTML += `<p><b>You:</b> ${input.value}</p>`;
  input.value = "";
};
