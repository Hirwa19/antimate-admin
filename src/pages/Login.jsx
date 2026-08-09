import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    console.clear();

    console.log("========== LOGIN START ==========");
    console.log("Email:", email);
    console.log("Password:", password);

    try {
      console.log("Sending request...");

      const res = await api.post("/admin-auth/login", {
        email,
        password,
      });

      console.log("========== SUCCESS ==========");
      console.log("Status:", res.status);
      console.log("Response:", res.data);
      console.log(
"LOGIN RESPONSE:",
res.data
);
      login(
  res.data.admin,
  res.data.token
);

console.log("Saved admin:", res.data.admin);

      console.log("Saved user:", res.data.user);
      console.log("Saved token:", res.data.token);

      navigate("/dashboard");
    } catch (error) {
      console.log("========== LOGIN FAILED ==========");

      console.log("Error object:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Response:", error.response.data);
      } else {
        console.log("No response from server");
      }

      alert(
        error.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-slate-950
    "
    >
      <div
        className="
        bg-white/10
        backdrop-blur-xl
        border
        border-white/20
        p-8
        rounded-2xl
        w-96
      "
      >
        <h1
          className="
          text-3xl
          font-bold
          mb-6
          text-center
        "
        >
          ANTIMATE ADMIN
        </h1>

        <input
          className="
          w-full
          p-3
          mb-4
          rounded-lg
          bg-slate-800
          outline-none
        "
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="
          w-full
          p-3
          mb-6
          rounded-lg
          bg-slate-800
          outline-none
        "
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="
          w-full
          bg-blue-500
          hover:bg-blue-600
          p-3
          rounded-lg
          font-semibold
        "
        >
          Login
        </button>
      </div>
    </div>
  );
}