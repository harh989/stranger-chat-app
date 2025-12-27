require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🔥 QUEUE-BASED MATCHMAKING (SAFE)
const waitingQueue = [];

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("findPartner", () => {
    console.log("Find partner:", socket.id);

    // Remove socket if already in queue
    const index = waitingQueue.indexOf(socket);
    if (index !== -1) waitingQueue.splice(index, 1);

    if (waitingQueue.length > 0) {
      const partner = waitingQueue.shift();

      socket.partner = partner;
      partner.partner = socket;

      socket.emit("matched");
      partner.emit("matched");

      console.log("Matched:", socket.id, partner.id);
    } else {
      waitingQueue.push(socket);
      socket.emit("waiting");
      console.log("Waiting:", socket.id);
    }
  });

  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    // Remove from queue if waiting
    const index = waitingQueue.indexOf(socket);
    if (index !== -1) waitingQueue.splice(index, 1);

    if (socket.partner) {
      socket.partner.emit("partnerDisconnected");
      socket.partner.partner = null;
    }
  });
});

// Health check
app.get("/", (req, res) => {
  res.send("Stranger Chat Server Running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
