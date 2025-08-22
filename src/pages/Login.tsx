import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { supabase } from "../supabaseClient";
import { updateLastLogin } from "../utils/userUtils";

// UI helpers you already used
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import login from "../assets/login.png";

// Change this if you prefer setting it in .env as VITE_API_BASE_URL
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:4000";

const Login: React.FC = () => {
  const nav = useNavigate();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If already authenticated on the client, skip login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) nav("/", { replace: true }); // ✅ go to root for role-based redirect
    });
    return () => unsub();
  }, [nav]);

  const toHumanMessage = (code: string) => {
    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/popup-closed-by-user":
        return "The Google sign-in popup was closed.";
      case "auth/cancelled-popup-request":
        return "Another sign-in is already in progress.";
      default:
        return "Sign-in failed. Please try again.";
    }
  };

  // Exchange Firebase ID token for a secure httpOnly cookie on your backend
  const createSession = async () => {
    const current = auth.currentUser;
    if (!current) throw new Error("No user after sign-in");
    
    try {
      const idToken = await current.getIdToken();
      const res = await fetch(`${API_BASE}/sessionLogin`, {
        method: "POST",
        credentials: "include", // <-- IMPORTANT: save cookie in browser
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to create session");
      }
    } catch (error) {
      console.warn("Backend session creation failed, continuing without backend:", error);
      // Continue without backend session - role will be determined by Firebase claims or email
    }
  };

  // Check if user exists in Supabase and sync if they do
  const checkAndSyncUser = async () => {
    const current = auth.currentUser;
    if (!current?.email) return false;

    try {
      // Check if user exists in Supabase
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', current.email)
        .single();

      if (error || !existingUser) {
        console.log('User not found in database:', current.email);
        return false;
      }

      // If user has a temporary firebase_uid, update it with the real one
      if (existingUser.firebase_uid.startsWith('temp_')) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            firebase_uid: current.uid,
            email_verified: current.emailVerified,
            last_login_at: new Date().toISOString()
          })
          .eq('email', current.email);

        if (updateError) {
          console.error('Error updating firebase_uid:', updateError);
        }
      } else {
        // Update last login time
        await updateLastLogin();
      }

      return true;
    } catch (error) {
      console.error('Error checking user in Supabase:', error);
      return false;
    }
  };

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await createSession();
      
      // Check if user exists in database
      const userExists = await checkAndSyncUser();
      if (!userExists) {
        // Sign out the user since they're not authorized
        await auth.signOut();
        setErr("Access denied. Please contact your administrator to be added to the system.");
        return;
      }
      
      nav("/", { replace: true }); // ✅ go to root for role-based redirect
    } catch (error: any) {
      const msg = error?.code ? toHumanMessage(error.code) : error?.message;
      setErr(msg || "Sign-in failed.");
      console.error("Email/password sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErr(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await createSession();
      
      // Check if user exists in database
      const userExists = await checkAndSyncUser();
      if (!userExists) {
        // Sign out the user since they're not authorized
        await auth.signOut();
        setErr("Access denied. Please contact your administrator to be added to the system.");
        return;
      }
      
      nav("/", { replace: true }); // ✅ go to root for role-based redirect
    } catch (error: any) {
      const msg = error?.code ? toHumanMessage(error.code) : error?.message;
      setErr(msg || "Google sign-in failed.");
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
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

          <form onSubmit={handleEmailPasswordSignIn}>
            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Password with toggle */}
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="text-xl" />
                ) : (
                  <AiOutlineEye className="text-xl" />
                )}
              </button>
            </div>

            {/* Error */}
            {err && (
              <p className="text-red-600 text-sm mb-3" role="alert">
                {err}
              </p>
            )}

            {/* Log in */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#313131] text-white rounded-md py-2 mb-4 hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Log In"}
            </button>
          </form>

          {/* Google sign in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
