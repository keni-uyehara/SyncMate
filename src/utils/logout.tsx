import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Clears the backend session cookie (if any) and signs out from Firebase.
 * Finally, sends user to /login in a library-agnostic way.
 */
export async function doLogout() {
  try {
    await fetch(`${API_BASE}/sessionLogout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore network/backend hiccups — Firebase signOut will still run
  }
  try {
    await signOut(auth);
  } finally {
    window.location.href = "/login";
  }
}
