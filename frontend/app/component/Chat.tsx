"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import LogoutButton from "./LogoutButton";

interface Message {
  sender: "User" | "Assistant";
  text: string;
}

interface Thread {
  slug: string;
  title: string;
}

const ChatApp: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadSlug, setCurrentThreadSlug] = useState<string | null>(
    localStorage.getItem("lastThreadSlug") || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [newThreadTitle, setNewThreadTitle] = useState<string>("");

  const accessToken = Cookies.get("access_token");

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (currentThreadSlug) {
      fetchMessages(currentThreadSlug);
    }
  }, [currentThreadSlug]);

  const fetchThreads = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/threads/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setThreads(response.data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const fetchMessages = async (threadSlug: string) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/threads/${threadSlug}/messages/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMessages(
        response.data.flatMap((msg: any) => [
          { sender: "User", text: msg.message },
          { sender: "Assistant", text: msg.response },
        ])
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const selectThread = (slug: string) => {
    if (slug !== currentThreadSlug) {
      setCurrentThreadSlug(slug);
      localStorage.setItem("lastThreadSlug", slug);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim()) {
      if (currentThreadSlug) {
        const userMessage = { sender: "User", text: newMessage };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setNewMessage("");

        try {
          const response = await axios.post(
            `http://127.0.0.1:8000/api/threads/${currentThreadSlug}/chat/`,
            { question: newMessage },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.status === 201 ) {
            const assistantMessage = {
              sender: "Assistant",
              text: response.data.response,
            };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          } else {
            console.error(
              "Failed to get a valid response from the server:",
              response.data.error || "No response data"
            );
          }
        } catch (error) {
          console.error(
            "Error sending message:",
            error.response ? error.response.data : error.message
          );
        }
      } else {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/threads/",
            { title: newMessage },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const newThread = response.data;
          setThreads((prevThreads) => [newThread, ...prevThreads]);
          setCurrentThreadSlug(newThread.slug);
          setMessages([]);
          const userMessage = { sender: "User", text: newMessage };
          setMessages((prevMessages) => [...prevMessages, userMessage]);
          setNewMessage("");

          const assistantResponse = await axios.post(
            `http://127.0.0.1:8000/api/threads/${newThread.slug}/chat/`,
            { question: newMessage },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (assistantResponse.status === 201) {
            const assistantMessage = {
              sender: "Assistant",
              text: assistantResponse.data.response,
            };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          } else {
            console.error(
              "Failed to get a valid response from the server:",
              assistantResponse.data.error || "No response data"
            );
          }
        } catch (error) {
          console.error("Error creating new thread:", error);
        }
      }
    } else {
      console.warn("Cannot send an empty message.");
    }
  };

  const handleNewThread = async () => {
    if (newThreadTitle.trim()) {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/threads/",
          { title: newThreadTitle },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const newThread = response.data;
        setThreads((prevThreads) => [newThread, ...prevThreads]);
        setCurrentThreadSlug(newThread.slug);
        setMessages([]);
        setNewThreadTitle("");
      } catch (error) {
        console.error("Error creating new thread:", error);
      }
    }
  };

  return (
    <div className="flex h-screen w-full mx-auto">
      <div className="w-72 border-r bg-gray-100 border-gray-300 p-4 shadow-md flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Threads
        </h2>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            placeholder="Start a new chat..."
            className="p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring focus:ring-blue-500"
          />
          <button
            onClick={handleNewThread}
            className="ml-2 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition duration-200 shadow-md"
          >
            +
          </button>
        </div>
        <div className="space-y-2 flex-grow overflow-y-auto">
          {threads.map((thread) => (
            <div
              key={thread.slug}
              onClick={() => selectThread(thread.slug)}
              className={`p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-200 ${
                thread.slug === currentThreadSlug
                  ? "bg-gray-300 font-semibold"
                  : ""
              }`}
            >
              {thread.title}
            </div>
          ))}
        </div>
        <LogoutButton />
      </div>

      <div className="flex flex-col p-6 w-full">
        {currentThreadSlug && (
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Generated Content
          </h2>
        )}
        <div className="flex flex-col  w-2/4 mx-auto overflow-hidden ">
          <div className="flex-grow bg-white rounded-lg p-4 overflow-y-auto ">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  msg.sender === "User" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative p-3 rounded-lg ${
                    msg.sender === "User" ? "bg-gray-300" : "text-gray-800 "
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

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
