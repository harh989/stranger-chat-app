const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../client")));

let waitingQueue = [];

function tryMatch() {
  if (waitingQueue.length >= 2) {
    const user1 = waitingQueue.shift();
    const user2 = waitingQueue.shift();

    if (!user1.connected || !user2.connected) {
      if (user1.connected) waitingQueue.push(user1);
      if (user2.connected) waitingQueue.push(user2);
      return;
    }

    user1.partner = user2;
    user2.partner = user1;

    user1.emit("matched");
    user2.emit("matched");
  }
}

io.on("connection", (socket) => {
  socket.partner = null;

  // Add user to waiting queue
  waitingQueue.push(socket);
  socket.emit("waiting");
  tryMatch();

  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  socket.on("typing", () => {
    if (socket.partner) {
      socket.partner.emit("typing");
    }
  });

  socket.on("stop_typing", () => {
    if (socket.partner) {
      socket.partner.emit("stop_typing");
    }
  });

  socket.on("disconnect_me", () => {
    disconnectUser(socket);
  });

  socket.on("disconnect", () => {
    disconnectUser(socket, true);
  });

  function disconnectUser(user, silent = false) {
    if (user.partner) {
      const other = user.partner;
      user.partner = null;
      other.partner = null;

      if (other.connected) {
        waitingQueue.push(other);
        other.emit("waiting");
        tryMatch();
      }
    }

    waitingQueue = waitingQueue.filter(u => u !== user);

    if (!silent) {
      waitingQueue.push(user);
      user.emit("waiting");
      tryMatch();
    }
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("✅ Server running on http://localhost:" + PORT);
});
