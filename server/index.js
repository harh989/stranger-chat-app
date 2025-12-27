require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// IMPORTANT: explicit socket.io path
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket"]
});

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  if (waitingUser) {
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("matched");
    waitingUser.emit("matched");

    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit("waiting");
  }

  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.partner) {
      socket.partner.emit("partnerDisconnected");
      socket.partner.partner = null;
    }

    if (waitingUser === socket) {
      waitingUser = null;
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
