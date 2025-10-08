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

const rooms: RoomUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create_room", (roomName: string) => {
    if (!rooms[roomName]) rooms[roomName] = {};
    io.emit("room_list", Object.keys(rooms)); // update all clients
  });

  socket.on("join_room", ({ roomId, username }: { roomId: string; username: string }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = username;

    io.to(roomId).emit("user_joined", `User ${username} joined`);
    io.to(roomId).emit("active_users", Object.values(rooms[roomId]));
    io.emit("room_list", Object.keys(rooms)); // update all clients
  });

  socket.on("send_message", ({ roomId, message }: { roomId: string; message: string }) => {
    const sender = rooms[roomId][socket.id] || "Unknown";
    io.to(roomId).emit("receive_message", { sender, message });
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        const username = rooms[roomId][socket.id];
        delete rooms[roomId][socket.id];
        io.to(roomId).emit("user_left", `${username} left the room`);
        io.to(roomId).emit("active_users", Object.values(rooms[roomId]));
      }
    }
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
