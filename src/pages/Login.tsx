import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import login from "../assets/login.png";

const Login = () => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const handleGoogleSignIn = () => {
        console.log("Google sign-in clicked (no backend connected)");
      };

  return (
    <div className="flex h-screen w-screen">
      {/* Left panel */}
      <div className="w-1/2 bg-[#313131] flex flex-col items-center justify-center px-12 text-center">
        <img src={login} alt="Illustration" className="max-w-xs mb-8" />
        <p className="text-white text-lg leading-relaxed">
          Unifying enterprise systems, compliance protocols, and performance
          insights into a single strategic AI hub
        </p>
      </div>

      {/* Right panel */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center">
        <div className="w-full max-w-sm px-6">
          <h2 className="text-xl font-medium text-center mb-6">
            Welcome back to <span className="font-bold">SyncMate!</span>
          </h2>

          {/* Email input */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Password input with toggle */}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-xl" />
              ) : (
                <AiOutlineEye className="text-xl" />
              )}
            </button>
          </div>

          {/* Log in button */}
          <button className="w-full bg-[#313131] text-white rounded-md py-2 mb-4 hover:bg-gray-800 transition">
            Log In
          </button>

          {/* Google sign in */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition"
          >
            <FcGoogle className="text-xl mr-2" />
            <span className="text-sm font-medium">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
