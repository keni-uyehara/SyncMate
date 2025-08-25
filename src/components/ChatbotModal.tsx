// /src/components/ChatbotModal.tsx
"use client";

import * as React from "react";
import { Bot, Send, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createSession, getMessages, sendMessage } from "@/lib/chatbot-client";

type ChatbotModalProps = { isOpen: boolean; onClose: () => void };
type Msg = { role: "user" | "assistant"; text: string };

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", text: "Hi! Ask me about compliance issues, workflows, or glossary terms." },
  ]);
  const [draft, setDraft] = React.useState("");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Create a session the first time it opens
  React.useEffect(() => {
    if (!isOpen) return;
    let active = true;
    (async () => {
      try {
        const { session } = await createSession("SyncMate Chat");
        if (!active) return;
        setSessionId(session.id);
        const { messages } = await getMessages(session.id);
        if (!active) return;
        if (messages?.length) {
          setMessages([
            { role: "assistant", text: "Session restored. How can I help?" },
            ...messages.map(m => ({ role: m.role, text: m.content }) as Msg),
          ]);
        }
      } catch (e) {
        // keep silent; show initial greeting
      }
    })();
    return () => { active = false; };
  }, [isOpen]);

  async function send() {
  const text = draft.trim();
  if (!text || !sessionId || busy) return;

  setMessages(m => [...m, { role: "user", text }]);
  setDraft("");
  setBusy(true);

  try {
    // ⬇️ This line changed: we now read aiMessage instead of response
    const { aiMessage } = await sendMessage(sessionId, text);

    // ⬇️ And we render aiMessage.content
    setMessages(m => [...m, { role: "assistant", text: aiMessage.content }]);
  } catch (e: any) {
    setMessages(m => [...m, { role: "assistant", text: `Error: ${e?.message || e}` }]);
  } finally {
    setBusy(false);
  }
}


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            SyncMate AI Assistant
          </DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-4">
          <ScrollArea className="h-56 rounded border p-3">
            <div className="space-y-3 text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-lg bg-blue-600 text-white px-3 py-2"
                      : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2"
                  }
                >
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-3 flex items-center gap-2">
            <Input
              placeholder={busy ? "Thinking…" : "Type your question…"}
              disabled={busy}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button onClick={send} disabled={busy || !draft.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
