require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

// IMPORTANT: socket.io config for Netlify + Render
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket"]
});

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // If someone is already waiting → match them
  if (waitingUser && waitingUser.connected) {
    const partner = waitingUser;

    socket.partner = partner;
    partner.partner = socket;

    socket.emit("matched");
    partner.emit("matched");

    waitingUser = null;
  } else {
    // Otherwise put this user in waiting
    waitingUser = socket;
    socket.emit("waiting");
  }

  // Receive message and send to partner
  socket.on("message", (msg) => {
    if (socket.partner && socket.partner.connected) {
      socket.partner.emit("message", msg);
    }
  });

  // Typing indicator
  socket.on("typing", () => {
    if (socket.partner && socket.partner.connected) {
      socket.partner.emit("typing", true);
    }
  });

  socket.on("stopTyping", () => {
    if (socket.partner && socket.partner.connected) {
      socket.partner.emit("typing", false);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.partner && socket.partner.connected) {
      socket.partner.emit("partnerDisconnected");
      socket.partner.partner = null;
    }

    if (waitingUser === socket) {
      waitingUser = null;
    }
  });
});

// Health check route
app.get("/", (req, res) => {
  res.send("Stranger Chat Server Running");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
