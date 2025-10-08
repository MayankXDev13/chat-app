import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Sidebar from "./Sidebar";
import MessageBubble from "./MessageBubble";

interface Message {
  sender: string;
  message: string;
}

const socket: Socket = io("http://localhost:3000");

const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];

export default function Chat() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [rooms, setRooms] = useState<string[]>(["General", "Tech", "Random"]);
  const [currentRoom, setCurrentRoom] = useState<string>("General");
  const [userColors, setUserColors] = useState<Record<string, string>>({});
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentRoom]);

  // Socket listeners
  useEffect(() => {
    socket.on("room_history", (history: Message[]) => {
      setMessages((prev) => ({ ...prev, [currentRoom]: history }));
    });

    socket.on("receive_message", (data: Message & { roomId: string }) => {
      setMessages((prev) => {
        const roomMsgs = prev[data.roomId] || [];
        return { ...prev, [data.roomId]: [...roomMsgs, data] };
      });

      if (!userColors[data.sender] && data.sender !== "system") {
        setUserColors((prev) => ({
          ...prev,
          [data.sender]: colors[Object.keys(prev).length % colors.length],
        }));
      }
    });

    socket.on("user_joined", ({ roomId, msg }: { roomId: string; msg: string }) => {
      setMessages((prev) => {
        const roomMsgs = prev[roomId] || [];
        return { ...prev, [roomId]: [...roomMsgs, { sender: "system", message: msg }] };
      });
    });

    socket.on("user_left", ({ roomId, msg }: { roomId: string; msg: string }) => {
      setMessages((prev) => {
        const roomMsgs = prev[roomId] || [];
        return { ...prev, [roomId]: [...roomMsgs, { sender: "system", message: msg }] };
      });
    });

    socket.on("active_users", (users: string[]) => setActiveUsers(users));
    socket.on("room_list", (roomNames: string[]) => setRooms(roomNames));

    return () => {
      socket.off("room_history");
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("active_users");
      socket.off("room_list");
    };
  }, [userColors, currentRoom]);

  // Join a room
  const joinRoom = (roomName: string) => {
    if (!username.trim()) return alert("Enter username");
    setCurrentRoom(roomName);
    socket.emit("join_room", { roomId: roomName, username });
    setJoined(true);
  };

  // Send message to current room
  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send_message", { roomId: currentRoom, message: message.trim() });
    setMessages((prev) => {
      const roomMsgs = prev[currentRoom] || [];
      return { ...prev, [currentRoom]: [...roomMsgs, { sender: username, message: message.trim() }] };
    });
    setMessage("");
  };

  // Create new room
  const createRoom = (roomName: string) => {
    if (!roomName.trim()) return;
    socket.emit("create_room", roomName);
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
        joinRoom={joinRoom}
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
              onClick={() => joinRoom(currentRoom)}
              className="rounded-lg bg-purple-600 px-6 py-2 font-semibold hover:bg-purple-700"
            >
              Join {currentRoom} Room
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="mb-4 flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-gray-800 p-3">
              {(messages[currentRoom] || []).map((msg, idx) => (
                <MessageBubble key={idx} msg={msg} currentUser={username} colorMap={userColors} />
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
