"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const initSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected", socket.id);
        socket.on("join", (userId) => {
            socket.join(userId);
        });
        socket.on("send_message", (data) => {
            const { sender, receiver, content } = data;
            io.to(receiver).emit("receive_message", { sender, content });
        });
        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    });
};
exports.initSocket = initSocket;
