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
  id: string;
}

const ChatApp: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadSlug, setCurrentThreadSlug] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  const accessToken = Cookies.get("access_token");

  useEffect(() => {
    fetchThreads();

    // Check for last thread slug in localStorage
    if (typeof window !== "undefined") {
      const lastThreadSlug = localStorage.getItem("lastThreadSlug");
      if (lastThreadSlug) {
        setCurrentThreadSlug(lastThreadSlug);
      }
    }
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
    setCurrentThreadSlug(slug);
    if (typeof window !== "undefined") {
      localStorage.setItem("lastThreadSlug", slug);
    }
    setMessages([]);
  };

  const handleSend = async () => {
    if (newMessage.trim()) {
      const userMessage = { sender: "User", text: newMessage };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setNewMessage("");

      // Prepare the request body with the slug and question
      const requestBody = {
        question: newMessage,
        slug: currentThreadSlug,
      };

      if (currentThreadSlug) {
        // Existing thread: send the message to it
        try {
          const response = await axios.post(
            `http://127.0.0.1:8000/api/threads/chat/`, // Updated URL
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.status === 201) {
            const assistantMessage = {
              sender: "Assistant",
              text: response.data.response,
            };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      } else {
        // Handle the case where there is no current thread
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/threads/",
            { title: newMessage }, // Create a new thread
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const newThread = response.data;
          setThreads((prevThreads) => [newThread, ...prevThreads]);
          setCurrentThreadSlug(newThread.slug);
          setMessages([userMessage]);

          // Send the user's message to the assistant for a response
          const assistantResponse = await axios.post(
            `http://127.0.0.1:8000/api/threads/chat/`, // Updated URL
            { question: newMessage, slug: newThread.slug }, // Include new thread slug
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
          }
        } catch (error) {
          console.error("Error creating new thread:", error);
        }
      }
    } else {
      console.warn("Cannot send an empty message.");
    }
  };

  const handleNewThread = () => {
    const lastThreadSlug = localStorage.getItem("lastThreadSlug");
    if (lastThreadSlug) {
      localStorage.removeItem("lastThreadSlug");
    }
    setCurrentThreadSlug(null);
    setMessages([]);
    setNewMessage("");
  };
  return (
    <div className="flex h-screen w-full mx-auto">
      <div className="w-72 border-r bg-gray-100 border-gray-300 p-4 shadow-md flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Threads
        </h2>
        <button
          onClick={handleNewThread}
          className="mb-4 bg-zinc-800 text-white px-2 py-1 rounded hover:bg-zinc-900 transition duration-200 shadow-md"
        >
          New Thread
        </button>
        <div className="space-y-2 flex-grow overflow-y-scroll scrollbar-hidden">
          {threads.length === 0 ? (
            <div className="p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-200 text-gray-500">
              No threads available
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => selectThread(thread.slug)}
                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-200 ${
                  thread.slug === currentThreadSlug
                    ? "bg-gray-300 font-semibold"
                    : ""
                }`}
              >
                {thread.title}
              </div>
            ))
          )}
        </div>
        <LogoutButton />
      </div>

      <div className="flex flex-col p-6 w-full">
        {currentThreadSlug && (
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Chat with Assistant
          </h2>
        )}
        <div className="flex flex-col w-2/4 mx-auto overflow-hidden">
          <div className="flex-grow bg-white rounded-lg p-4 overflow-y-scroll scrollbar-hidden">
            {messages.map((msg, index) => (
              <div
                key={index} // Ideally, use a unique id for each message
                className={`mb-4 flex ${
                  msg.sender === "User" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative p-3 rounded-lg ${
                    msg.sender === "User" ? "bg-gray-300" : "text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex">
            <div className="relative flex-grow">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="w-full p-3 border border-gray-300 rounded-lg pr-12"
              />
              <button
                onClick={handleSend}
                className="absolute inset-y-0 right-0 flex items-center px-4 bg-rose-600 text-white rounded-r-md hover:bg-rose-700 transition duration-200 shadow-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
