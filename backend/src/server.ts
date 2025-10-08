import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

interface RoomUsers {
  [roomId: string]: { [socketId: string]: string };
}

interface RoomMessages {
  [roomId: string]: { sender: string; message: string }[];
}

const rooms: RoomUsers = {};
const roomMessages: RoomMessages = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Create a new room
  socket.on("create_room", (roomName: string) => {
    if (!rooms[roomName]) rooms[roomName] = {};
    if (!roomMessages[roomName]) roomMessages[roomName] = [];
    io.emit("room_list", Object.keys(rooms));
  });

  // Join a room
  socket.on("join_room", ({ roomId, username }: { roomId: string; username: string }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    if (!roomMessages[roomId]) roomMessages[roomId] = [];

    rooms[roomId][socket.id] = username;

    // Send existing messages for that room
    socket.emit("room_history", roomMessages[roomId]);

    io.to(roomId).emit("user_joined", { roomId, msg: `User ${username} joined` });
    io.to(roomId).emit("active_users", Object.values(rooms[roomId]));
    io.emit("room_list", Object.keys(rooms));
  });

  // Handle new messages
  socket.on("send_message", ({ roomId, message }: { roomId: string; message: string }) => {
    const sender = rooms[roomId][socket.id] || "Unknown";
    const msgObj = { sender, message };

    roomMessages[roomId] = roomMessages[roomId] || [];
    roomMessages[roomId].push(msgObj);

    io.to(roomId).emit("receive_message", { ...msgObj, roomId });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        const username = rooms[roomId][socket.id];
        delete rooms[roomId][socket.id];

        io.to(roomId).emit("user_left", { roomId, msg: `${username} left the room` });
        io.to(roomId).emit("active_users", Object.values(rooms[roomId]));
      }
    }
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
