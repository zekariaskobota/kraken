import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../../config";
import { FaCommentDots, FaPaperPlane, FaImage, FaEdit, FaTrash, FaEllipsisV, FaTimes } from "react-icons/fa";

const socket = io(config.BACKEND_URL);

export default function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [userFirstName, setUserFirstName] = useState(null);
  const [userLastName, setUserLastName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getUserDetails = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await axios.get(`${config.BACKEND_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserFirstName(response.data.firstName);
      setUserLastName(response.data.lastName);
      setIsLoggedIn(!!response.data.firstName);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      }
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const response = await axios.get(`${config.BACKEND_URL}/api/message/conversation/${userId}`);
        let sortedMessages = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (sortedMessages.length === 0) {
          const welcomeMessage = {
            sender: "admin",
            message: "Welcome to our chat support! How can we assist you today?",
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        } else {
          setMessages(sortedMessages);
        }
      } catch (error) {
        // Error handling without console.log
      }
    };

    fetchMessages();

    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      socket.emit('joinRoom', userId);

      socket.on("receiveMessage", (messageData) => {
        if (messageData) {
          setMessages(prev => [...prev, messageData]);
          
          if (messageData.sender === 'admin' && !open) {
            setUnreadCount(prev => prev + 1);
            
            toast.info('New message from customer service!', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "dark"
            });
          }
        }
      });
    }

    return () => {
      socket.off("receiveMessage");
      socket.emit('leaveRoom');
    };
  }, [open]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const response = await axios.get(`${config.BACKEND_URL}/api/message/unread-count/${userId}`);
        setUnreadCount(response.data.count);
      } catch (error) {
        // Error handling without console.log
      }
    };

    fetchUnreadCount();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result;
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        try {
          const response = await axios.post(`${config.BACKEND_URL}/api/message/user-message`, {
            userId,
            message: '',
            image: base64String
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.data.success) {
            const savedMessage = response.data.data;
            setMessages(prev => [...prev, savedMessage]);
            socket.emit("sendMessage", savedMessage);
          }
        } catch (error) {
          alert("Failed to send image. Please try again.");
        }
      };

      reader.readAsDataURL(selectedFile);
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userId = decoded.id;

    if (input.trim()) {
      try {
        const response = await axios.post(`${config.BACKEND_URL}/api/message/user-message`, {
          userId,
          message: input.trim(),
          image: null
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          const savedMessage = response.data.data;
          setMessages(prev => [...prev, savedMessage]);
          socket.emit("sendMessage", savedMessage);
        }

        setInput("");
      } catch (error) {
        alert("Failed to send message. Please try again.");
      }
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      // Set loading state
      setIsLoading(true);
      
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      
      await axios.delete(`${config.BACKEND_URL}/api/message/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { userId }
      });

      setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
      setActiveMenu(null);
      
      toast.success("Message deleted successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Failed to delete message. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  const startEditing = (message) => {
    if (message.sender === "user") {
      setEditingMessageId(message._id);
      setEditText(message.message);
      setActiveMenu(null);
    }
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      
      const response = await axios.put(`${config.BACKEND_URL}/api/message/${editingMessageId}`, {
        message: editText.trim(),
        userId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === editingMessageId 
              ? { ...msg, message: editText.trim() } 
              : msg
        ));
        
        setEditingMessageId(null);
        setEditText("");
        
        toast.success("Message updated successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("Failed to update message. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const toggleMenu = (messageId, event) => {
    event.stopPropagation();
    setActiveMenu(activeMenu === messageId ? null : messageId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && !event.target.closest('.message-menu-container')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeMenu]);

  const handleChatOpen = async () => {
    setOpen(!open);
    if (!open) {
      try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        await axios.put(`${config.BACKEND_URL}/api/message/mark-messages-read/${userId}`);
        setUnreadCount(0);
      } catch (error) {
        // Error handling without console.log
      }
    }
  };

  const messagesEndRef = useRef(null);
  const chatPopupRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatPopupRef.current && !chatPopupRef.current.contains(event.target) && 
          !event.target.closest('.chat-icon-button')) {
        // Don't close on outside click - let user control it
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* Floating Chat Icon with Animation */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        <button
          onClick={handleChatOpen}
          className="chat-icon-button relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center text-white text-xl md:text-2xl hover:scale-110 transition-all duration-300 hover:shadow-teal-500/50 animate-bounce hover:animate-none group"
        >
          <FaCommentDots className="relative z-10" />
          
          {/* Pulse Animation Ring */}
          <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-75"></div>
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse border-2 border-[#0b0e14]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-teal-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Chat Popup */}
      {open && (
        <div
          ref={chatPopupRef}
          className="fixed bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 lg:w-[400px] h-[600px] md:h-[650px] bg-[rgba(26,29,41,0.95)] backdrop-blur-xl border border-[#2a2d3a] rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden animate-slide-up"
          style={{
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-4 flex items-center gap-3 border-b border-teal-500/30">
            <div className="relative">
              <img 
                src="profile.png" 
                alt="Customer Service" 
                className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[rgba(26,29,41,0.95)]"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">XYZ Customer Service</h3>
              <p className="text-teal-100 text-xs">Online • Usually replies instantly</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 animate-fade-in ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.sender === "user" ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold border-2 border-teal-400/30">
                      {userFirstName ? userFirstName.charAt(0).toUpperCase() : "U"}
                    </div>
                  ) : (
                    <img 
                      src="profile.png" 
                      alt="Customer Service" 
                      className="w-10 h-10 rounded-full border-2 border-teal-400/30 object-cover"
                    />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col gap-1 max-w-[75%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`relative px-4 py-2.5 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-tr-sm"
                        : "bg-[rgba(11,14,20,0.6)] text-gray-200 border border-[#2a2d3a] rounded-tl-sm"
                    } shadow-lg`}
                  >
                    {editingMessageId === msg._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          placeholder="Edit your message..."
                          className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none"
                          rows="3"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-lg transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.message && (
                          <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                        )}
                        {msg.image && (
                          <div className="relative mt-2 group">
                            <img 
                              src={msg.image} 
                              alt="Message attachment" 
                              className="max-w-[200px] rounded-lg shadow-md"
                            />
                            {msg.sender === "user" && (
                              <button 
                                onClick={() => deleteMessage(msg._id)}
                                disabled={isLoading}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg transition-all hover:scale-110"
                              >
                                {isLoading ? "⏳" : <FaTimes />}
                              </button>
                            )}
                          </div>
                        )}
                        <span
                          className={`text-xs mt-1 block ${
                            msg.sender === "user" ? "text-teal-100" : "text-gray-400"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message Menu */}
                  {msg.sender === "user" && !msg.image && editingMessageId !== msg._id && (
                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(msg._id, e)}
                        className="text-gray-400 hover:text-gray-200 p-1 rounded transition-colors"
                      >
                        <FaEllipsisV className="text-xs" />
                      </button>
                      {activeMenu === msg._id && (
                        <div className="absolute right-0 top-6 bg-[rgba(11,14,20,0.95)] border border-[#2a2d3a] rounded-lg shadow-xl py-1 min-w-[120px] z-50 animate-fade-in">
                          <button
                            onClick={() => startEditing(msg)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-teal-500/20 hover:text-teal-400 transition-colors flex items-center gap-2"
                          >
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button
                            onClick={() => deleteMessage(msg._id)}
                            disabled={isLoading}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                          >
                            <FaTrash className="text-xs" /> {isLoading ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filePreview && (
              <div className="flex justify-end animate-fade-in">
                <div className="max-w-[200px] rounded-lg overflow-hidden opacity-70">
                  <img src={filePreview} alt="Upload preview" className="w-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-4 border-t border-[#2a2d3a] bg-[rgba(11,14,20,0.6)]">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-teal-500 transition-colors max-h-32"
                rows="1"
              />
              <label
                htmlFor="file-upload"
                className="w-10 h-10 flex items-center justify-center bg-[rgba(26,29,41,0.6)] border border-[#2a2d3a] rounded-xl text-gray-400 hover:text-teal-400 hover:border-teal-500/50 cursor-pointer transition-all hover:scale-110"
              >
                <FaImage className="text-lg" />
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out both;
        }
      `}</style>
    </>
  );
}