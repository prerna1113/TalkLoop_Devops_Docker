import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Divider,
  List,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
  ListItemButton,
  Badge,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import io from "socket.io-client";
import axios from "axios";

const ENDPOINT = "http://localhost:5000"; // backend base URL
let socket;

const ChatsPage = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const [notifications, setNotifications] = useState([]); // 🔔 Notification list

  // ✅ Search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // 1️⃣ Socket setup
  useEffect(() => {
    if (!userInfo) {
      navigate("/");
      return;
    }

    socket = io(ENDPOINT, { transports: ["websocket"] });
    socket.emit("setup", userInfo);
    socket.on("connected", () => setSocketConnected(true));

    // 🟢 Handle incoming message notifications
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChat || // if no chat is open
        selectedChat._id !== newMessageReceived.chat._id // or different chat
      ) {
        // Add to notifications if not already there
        if (!notifications.find((n) => n._id === newMessageReceived._id)) {
          setNotifications((prev) => [newMessageReceived, ...prev]);
        }
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [navigate, userInfo?._id, selectedChat, notifications]);

  // 2️⃣ Fetch all chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get(`${ENDPOINT}/api/chat`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [userInfo?.token]);

  // 3️⃣ Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        setMessages([]);
        const { data } = await axios.get(
          `${ENDPOINT}/api/message/${selectedChat._id}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        setMessages(data);
        socket.emit("join chat", selectedChat._id);

        // Remove notifications for this chat
        setNotifications((prev) =>
          prev.filter((n) => n.chat._id !== selectedChat._id)
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    return () => {
      socket.emit("leave chat", selectedChat._id);
    };
  }, [selectedChat?._id, userInfo?.token]);

  // 4️⃣ Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?._id) return;
    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/message`,
        { content: newMessage, chatId: selectedChat._id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // 5️⃣ Search users
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const { data } = await axios.get(
        `${ENDPOINT}/api/user?search=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // 6️⃣ Create or access chat
  const handleAccessChat = async (userId) => {
    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/chat`,
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setSearchResults([]);
      setSearchTerm("");
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    alert("Logged out successfully!");
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* LEFT SIDEBAR */}
      <Box
        sx={{
          width: 320,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            TalkLoop
          </Typography>

          {/* 🔔 Notification icon */}
          <IconButton color="primary">
            <Badge
              badgeContent={notifications.length}
              color="error"
              invisible={notifications.length === 0}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleLogout}
          >
            LOGOUT
          </Button>
        </Box>

        {/* User Info */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
          <Avatar src={userInfo?.pic} sx={{ width: 50, height: 50, mr: 2 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {userInfo?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userInfo?.email}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Search users */}
        <Box sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search user to chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton color="primary" onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          </Box>

          {/* Search Results */}
          {searchResults.map((user) => (
            <ListItemButton key={user._id} onClick={() => handleAccessChat(user._id)}>
              <ListItemAvatar>
                <Avatar src={user.pic} />
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={user.email} />
            </ListItemButton>
          ))}
        </Box>

        {/* Chat List */}
        <List sx={{ flexGrow: 1, overflowY: "auto" }}>
          {chats.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
              No chats yet. Start one!
            </Typography>
          ) : (
            chats.map((chat) => {
              const chatName = chat.isGroupChat
                ? chat.chatName
                : chat.users.find((u) => u._id !== userInfo._id)?.name;
              const chatAvatar = chat.isGroupChat
                ? "https://cdn-icons-png.flaticon.com/512/1946/1946433.png"
                : chat.users.find((u) => u._id !== userInfo._id)?.pic;

              const isUnread = notifications.some(
                (n) => n.chat._id === chat._id
              );

              return (
                <ListItemButton
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  selected={selectedChat?._id === chat._id}
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={!isUnread}
                      overlap="circular"
                    >
                      <Avatar src={chatAvatar} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={chatName}
                    secondary={chat.latestMessage?.content || "No messages yet"}
                  />
                </ListItemButton>
              );
            })
          )}
        </List>
      </Box>

      {/* RIGHT CHAT AREA */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#e5ddd5",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #ccc",
          }}
        >
          <Avatar
            src={
              selectedChat
                ? selectedChat.isGroupChat
                  ? "https://cdn-icons-png.flaticon.com/512/1946/1946433.png"
                  : selectedChat.users.find((u) => u._id !== userInfo._id)?.pic
                : ""
            }
            sx={{ mr: 2 }}
          />
          <Typography variant="h6">
            {selectedChat
              ? selectedChat.isGroupChat
                ? selectedChat.chatName
                : selectedChat.users.find((u) => u._id !== userInfo._id)?.name
              : "Select a chat"}
          </Typography>
        </Paper>

        {/* Messages */}
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {messages.length === 0 ? (
            <Typography color="text.secondary" textAlign="center">
              No messages yet. Start chatting!
            </Typography>
          ) : (
            messages.map((msg, index) => (
              <Paper
                key={index}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  alignSelf:
                    msg.sender._id === userInfo._id ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.sender._id === userInfo._id ? "#dcf8c6" : "#ffffff",
                  maxWidth: "70%",
                }}
              >
                <Typography>{msg.content}</Typography>
              </Paper>
            ))
          )}
        </Box>

        {selectedChat && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              backgroundColor: "#ffffff",
              borderTop: "1px solid #ccc",
            }}
          >
            <TextField
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <IconButton color="primary" sx={{ ml: 1 }} onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatsPage;
