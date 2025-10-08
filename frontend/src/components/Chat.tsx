import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Sidebar from "./Sidebar";
import MessageBubble from "./MessageBubble";

interface Message {
  sender: string;
  message: string;
}

const socket: Socket = io("http://localhost:3000");

const colors = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export default function Chat() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<string[]>(["General", "Tech", "Random"]);
  const [currentRoom, setCurrentRoom] = useState<string>("General");
  const [userColors, setUserColors] = useState<Record<string, string>>({});
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [newRoom, setNewRoom] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket listeners
  useEffect(() => {
    socket.on("receive_message", (data: Message) => {
      if (!userColors[data.sender] && data.sender !== "system") {
        setUserColors((prev) => ({
          ...prev,
          [data.sender]: colors[Object.keys(prev).length % colors.length],
        }));
      }
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", (msg: string) => {
      setMessages((prev) => [...prev, { sender: "system", message: msg }]);
    });

    socket.on("user_left", (msg: string) => {
      setMessages((prev) => [...prev, { sender: "system", message: msg }]);
    });

    socket.on("active_users", (users: string[]) => {
      setActiveUsers(users);
    });

    socket.on("room_list", (roomNames: string[]) => {
      setRooms(roomNames);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("active_users");
      socket.off("room_list");
    };
  }, [userColors]);

  const joinRoom = () => {
    if (!username.trim()) return alert("Enter username");
    socket.emit("join_room", { roomId: currentRoom, username });
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send_message", { roomId: currentRoom, message: message.trim() });
    setMessages((prev) => [...prev, { sender: username, message: message.trim() }]);
    setMessage("");
  };

  const createRoom = () => {
    if (!newRoom.trim()) return;
    socket.emit("create_room", newRoom.trim());
    setNewRoom("");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        setCurrentRoom={setCurrentRoom}
        activeUsers={activeUsers}
        createRoom={createRoom}
      />

      {/* Chat Area */}
      <div className="flex flex-1 flex-col p-4">
        {!joined ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-1/2 rounded-lg bg-gray-700 p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              onClick={joinRoom}
              className="rounded-lg bg-purple-600 px-6 py-2 font-semibold hover:bg-purple-700"
            >
              Join {currentRoom} Room
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="mb-4 flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-gray-800 p-3">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  msg={msg}
                  currentUser={username}
                  colorMap={userColors}
                />
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 rounded-lg bg-gray-700 p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="rounded-lg bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-700"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
