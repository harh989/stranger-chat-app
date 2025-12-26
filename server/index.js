require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let waitingUser = null;
const activeChats = new Map();

io.on("connection", (socket) => {
  socket.isTyping = false;

  // MATCHMAKING
  if (waitingUser && waitingUser.id !== socket.id) {
    activeChats.set(socket.id, waitingUser.id);
    activeChats.set(waitingUser.id, socket.id);

    socket.emit("matched");
    waitingUser.emit("matched");

    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit("waiting");
  }

  // MESSAGE
  socket.on("message", (msg) => {
    const partnerId = activeChats.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("message", msg);
    }
  });

  // TYPING STATUS
  socket.on("typing", () => {
    const partnerId = activeChats.get(socket.id);
    if (partnerId && !socket.isTyping) {
      socket.isTyping = true;
      io.to(partnerId).emit("typing", true);
    }
  });

  socket.on("stopTyping", () => {
    const partnerId = activeChats.get(socket.id);
    socket.isTyping = false;
    if (partnerId) {
      io.to(partnerId).emit("typing", false);
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const partnerId = activeChats.get(socket.id);

    if (partnerId) {
      io.to(partnerId).emit("partnerDisconnected");
      activeChats.delete(partnerId);
    }

    activeChats.delete(socket.id);

    if (waitingUser?.id === socket.id) {
      waitingUser = null;
    }
  });
});

app.get("/", (req, res) => {
  res.send("Stranger Chat Server Running");
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
