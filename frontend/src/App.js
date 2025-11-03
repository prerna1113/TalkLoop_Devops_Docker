
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/SignupPage";
import ChatsPage from "./pages/ChatsPage";

function App() {
  return (
    <Router>
      <Routes>
<Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chats" element={<ChatsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
