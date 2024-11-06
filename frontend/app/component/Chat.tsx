"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import LogoutButton from "./LogoutButton";

interface Message {
  sender: "User" | "Assistant";
  text: string;
}

interface Thread {
  id: string;
  title: string;
}

const ChatApp: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [newThreadTitle, setNewThreadTitle] = useState<string>("");

  // Retrieve the access token from cookies
  const accessToken = Cookies.get("access_token");

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (currentThreadId) {
      fetchMessages(currentThreadId);
    }
  }, [currentThreadId]);

  const fetchThreads = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/threads", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setThreads(response.data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/threads/${threadId}/messages/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMessages(
        response.data.map((msg: any) => ({
          sender: msg.user === null ? "Assistant" : "User",
          text: msg.message || msg.response,
        }))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim() && currentThreadId) {
      const userMessage = { sender: "User", text: newMessage };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setNewMessage("");

      try {
        const response = await axios.post(
          `/api/threads/${currentThreadId}/chat/`,
          { question: newMessage },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Add Authorization header
            },
          }
        );
        const assistantMessage = {
          sender: "Assistant",
          text: response.data.response,
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleNewThread = async () => {
    if (newThreadTitle.trim()) {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/threads",
          {
            title: newThreadTitle,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Add Authorization header
            },
          }
        );
        const newThread = response.data;
        setThreads((prevThreads) => [newThread, ...prevThreads]);
        setCurrentThreadId(newThread.id);
        setMessages([]);
        setNewThreadTitle("");
      } catch (error) {
        console.error("Error creating new thread:", error);
      }
    }
  };

  return (
    <div className="flex h-screen w-full mx-auto">
      {/* Sidebar for recent threads */}
      <div className="w-72 border-r bg-gray-100 border-gray-300 p-4 shadow-md flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Threads
        </h2>
        <input
          type="text"
          value={newThreadTitle}
          onChange={(e) => setNewThreadTitle(e.target.value)}
          placeholder="New thread title"
          className="p-2 border border-gray-300 rounded mb-4 w-full focus:outline-none focus:ring focus:ring-blue-500"
        />
        <button
          onClick={handleNewThread}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 shadow-md w-full mb-4"
        >
          Create New Thread
        </button>
        <div className="space-y-2 flex-grow overflow-y-auto">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setCurrentThreadId(thread.id)}
              className={`p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-200 ${
                thread.id === currentThreadId ? "bg-gray-300 font-semibold" : ""
              }`}
            >
              {thread.title}
            </div>
          ))}
        </div>
        <LogoutButton />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col p-6 w-full">
        {currentThreadId && (
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {threads.find((thread) => thread.id === currentThreadId)?.title ||
              "Chat"}
          </h2>
        )}
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
