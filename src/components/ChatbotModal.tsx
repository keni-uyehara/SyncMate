"use client";

import * as React from "react";
import { Bot, Send, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatbotModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", text: "Hi! Ask me about compliance issues, workflows, or glossary terms." }
  ]);
  const [draft, setDraft] = React.useState("");

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");

    // TODO: Replace this with your real backend call
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Thanks! (This is a stubbed reply. Wire me to your API.)" }
      ]);
    }, 300);
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
              placeholder="Type your question…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button onClick={send}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
