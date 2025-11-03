import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatState } from  "../Components/context/chatProvider";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { setUser } = ChatState();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) navigate("/signup");
  };

  // ✅ Handles login request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all the fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login Successful ✅");
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data); // ✅ Added this line
        navigate("/chats");
      } else {
        alert(data.message || "Invalid Email or Password ❌");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong, please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "url('https://cdn.pixabay.com/photo/2016/11/29/02/29/blue-1869651_1280.png')",
        backgroundSize: "cover",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: 380,
          p: 4,
          borderRadius: 3,
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          TalkLoop
        </Typography>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        {tabValue === 0 && (
          <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: "#1976d2" }}
            >
              Login
            </Button>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: "#d32f2f" }}
              onClick={() => {
                setEmail("guest@example.com");
                setPassword("12345");
              }}
            >
              Get Guest User Credentials
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LoginPage;
