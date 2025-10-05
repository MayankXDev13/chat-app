import { Server } from "socket.io";

export const initSocket = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("User connected", socket.id);

        socket.on("join", (userId) => {
            socket.join(userId)
        })

        socket.on("send_message", (data) => {
            const {sender, receiver, content} = data
            io.to(receiver).emit("receive_message", {sender, content})
        })

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        })
    })
}