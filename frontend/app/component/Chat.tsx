"use client";

import React, { useState } from "react";
import LogoutButton from "./LogoutButton";

// Define the type for a message
interface Message {
  sender: "User" | "Assistant";
  text: string;
}

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "Assistant", text: "How can I help you today?" },
    { sender: "User", text: "Hello!" },
  ]);
  const [newMessage, setNewMessage] = useState<string>("");

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "User", text: newMessage }]);
      setNewMessage("");
    }
  };


  return (
    <div className="flex h-screen w-full mx-auto">
      {/* Sidebar for recent chats */}
      <div className="w-72 border-r bg-gray-100 border-gray-300 p-4 shadow-md flex flex-col ">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Chats
        </h2>
        <div className="space-y-2 flex-grow">
          {["Chat 1", "Chat 2", "Chat 3", "Chat 4"].map((chat, index) => (
            <div
              key={index}
              className="p-3  rounded-lg cursor-pointer hover:bg-gray-200 hover:underline transition duration-200"
            >
              {chat}
            </div>
          ))}
        </div>
        <LogoutButton />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col  p-6 w-full ">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Genarate Content
        </h2>
        <div className="flex flex-col h-full w-2/4 mx-auto">
          <div className="flex-grow bg-white rounded-lg p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  msg.sender === "User" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative p-3 rounded-lg ${
                    msg.sender === "User"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="mt-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-3 border border-gray-300 rounded-l-md bg-gray-100 focus:outline-none focus:ring focus:ring-blue-500 shadow-sm transition duration-200"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-6 rounded-r-md hover:bg-blue-700 transition duration-200 flex items-center justify-center shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
