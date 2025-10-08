import React from "react";

interface Message {
  sender: string;
  message: string;
}

interface MessageBubbleProps {
  msg: Message;
  currentUser: string;
  colorMap: Record<string, string>;
}

export default function MessageBubble({ msg, currentUser, colorMap }: MessageBubbleProps) {
  const isSelf = msg.sender === currentUser;
  const isSystem = msg.sender === "system";
  const bgColor = isSystem
    ? "bg-yellow-500 text-gray-900"
    : isSelf
    ? "bg-purple-600 text-white"
    : colorMap[msg.sender] || "bg-gray-600 text-white";

  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg break-words ${bgColor} animate-fade`}>
        {!isSystem && <span className="block text-xs font-semibold opacity-80">{msg.sender}</span>}
        {msg.message}
      </div>
    </div>
  );
}
