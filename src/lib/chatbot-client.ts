// src/lib/chatbot-client.ts

export type APIMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ?? "http://localhost:4000/api/chatbot";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function createSession(title?: string) {
  return http<{ session: { id: string; title: string } }>(`/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export async function sendMessage(sessionId: string, message: string) {
  const data = await http<{ sessionId: string; response: string }>(
    `/sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }
  );
  return {
    aiMessage: {
      id: cryptoRandomId(),
      role: "assistant",
      content: data.response,
    } as APIMsg,
  };
}

// Stub: avoid any GET /messages call to the server for now
export async function getMessages(_sessionId: string) {
  return { messages: [] as APIMsg[] };
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
