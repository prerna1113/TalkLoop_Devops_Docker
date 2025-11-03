import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    picture: null,
  });

  const navigate = useNavigate();

  // ✅ handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // ✅ handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword, picture } = formData;

    if (!name || !email || !password) {
      alert("Please fill all the fields!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/user/signup",
        { name, email, password, pic: picture },
        config
      );

      alert("Signup successful!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      alert(
        error.response?.data?.message || "Signup failed. Please try again!"
      );
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
        backgroundPosition: "center",
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
          Talk-A-Tive
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Sign Up
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            fullWidth
            required
            margin="normal"
            onChange={handleChange}
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            fullWidth
            required
            margin="normal"
            onChange={handleChange}
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            margin="normal"
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            required
            margin="normal"
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2, textTransform: "none" }}
          >
            Upload your Picture
            <input
              type="file"
              hidden
              name="picture"
              accept="image/*"
              onChange={handleChange}
            />
          </Button>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#145ea8" },
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignupPage;
