import { useState } from "react";

interface SidebarProps {
  rooms: string[];
  currentRoom: string;
  setCurrentRoom: (room: string) => void;
  activeUsers: string[];
  createRoom: (roomName: string) => void;
}

export default function Sidebar({
  rooms,
  currentRoom,
  setCurrentRoom,
  activeUsers,
  createRoom,
}: SidebarProps) {
  const [newRoom, setNewRoom] = useState<string>("");

  const handleCreateRoom = () => {
    console.log("testing");
    if (!newRoom.trim()) return;
    
    createRoom(newRoom.trim());
    setNewRoom("");
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 p-4 text-white shadow-lg">
      {/* Create Room */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="New room name"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          className="flex-1 rounded-lg bg-gray-800 p-2 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        <button
          onClick={handleCreateRoom}
          className="rounded-lg bg-purple-600 px-4 font-semibold transition hover:bg-purple-700"
        >
          Create
        </button>
      </div>

      {/* Room List */}
      <h2 className="mb-2 text-xl font-bold">Rooms</h2>
      <ul className="mb-6 flex max-h-48 flex-col gap-2 overflow-y-auto">
        {rooms.map((room) => (
          <li
            key={room}
            className={`cursor-pointer rounded p-2 transition ${
              room === currentRoom
                ? "bg-purple-600 font-semibold text-white"
                : "hover:bg-gray-800"
            }`}
            onClick={() => setCurrentRoom(room)}
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-400"></span>
            {room}
          </li>
        ))}
      </ul>

      {/* Active Users */}
      <h2 className="mb-2 text-lg font-semibold">Active Users</h2>
      <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {activeUsers.map((user) => (
          <li
            key={user}
            className="flex items-center gap-2 rounded bg-gray-800 p-1 transition hover:bg-gray-700"
          >
            <span className="h-4 w-4 rounded-full bg-green-400"></span>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}
