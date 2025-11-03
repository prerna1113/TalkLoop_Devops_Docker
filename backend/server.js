import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Load environment variables and connect to DB
dotenv.config();
connectDB();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000", // React app
  },
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("✅ User joined:", userData.name);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`📍User joined chat: ${room}`);
  });

  socket.on("new message", (newMessageReceived) => {
  var chat = newMessageReceived.chat;

  if (!chat.users) return console.log("chat.users not defined");

  chat.users.forEach((user) => {
    if (user._id == newMessageReceived.sender._id) return;

    // Send message normally
    socket.in(user._id).emit("message received", newMessageReceived);

    // 🔔 Send notification
    socket.in(user._id).emit("notification received", {
      chatId: chat._id,
      sender: newMessageReceived.sender.name,
    });
  });
});


  socket.on("disconnect", () => {
    console.log("🚪 Client disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
