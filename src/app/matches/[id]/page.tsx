"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Partner {
  id: string;
  username: string;
  age: number;
  avatar_url?: string;
}

interface Match {
  id: string;
  created_at: string;
  partner: Partner;
}

export default function ChatPage() {
  const { id: matchId } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load match info (for partner name/avatar in header)
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: () => api.get("/api/v1/matching/matches").then((r) => r.data),
    staleTime: 60_000,
  });
  const match = matches.find((m) => m.id === matchId);

  // Load message history
  useEffect(() => {
    if (!matchId) return;
    api
      .get(`/api/v1/chat/${matchId}/messages`, { params: { limit: 50 } })
      .then((r) => setMessages(r.data))
      .catch(() => {});
  }, [matchId]);

  // WebSocket connection
  useEffect(() => {
    if (!matchId) return;
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    const wsBase = process.env.NEXT_PUBLIC_API_URL!
      .replace(/^https?/, (s) => (s === "https" ? "wss" : "ws"));
    const ws = new WebSocket(`${wsBase}/api/v1/chat/${matchId}/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setWsReady(true);
    ws.onclose = () => setWsReady(false);
    ws.onmessage = (e) => {
      const msg: Message = JSON.parse(e.data);
      if (msg.id) {
        setMessages((prev) => {
          // avoid duplicates (optimistic vs server echo)
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    return () => ws.close();
  }, [matchId, router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(text);
    setInput("");
  }, [input]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-[#FAF5EF] flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E0D8] bg-[#FAF5EF] sticky top-0 z-10">
        <Link href="/matches" className="text-[#78716C] hover:text-[#1C1917] transition-colors p-1">
          ‹
        </Link>

        <div className="w-9 h-9 rounded-full bg-[#1C1917] overflow-hidden flex-shrink-0">
          {match?.partner.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={match.partner.avatar_url}
              alt={match.partner.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-white text-sm opacity-40">
                {match?.partner.username[0].toUpperCase() ?? "?"}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="font-semibold text-[#1C1917] text-sm leading-tight">
            {match?.partner.username ?? "Chat"}
          </p>
          <p className="text-[10px] text-[#78716C]">
            {wsReady ? "online" : "connecting…"}
          </p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🥂</div>
            <p className="text-[#78716C] text-sm">You matched! Say hello.</p>
          </div>
        )}

        {messages.map((msg) => {
          const mine = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${
                  mine
                    ? "bg-[#8B1A2E] text-[#FAF5EF] rounded-br-sm"
                    : "bg-white border border-[#E8E0D8] text-[#1C1917] rounded-bl-sm"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${
                    mine ? "text-white/50" : "text-[#C4BAB2]"
                  }`}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="border-t border-[#E8E0D8] bg-white px-4 py-3 flex items-end gap-3">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a message…"
          className="flex-1 resize-none bg-[#FAF5EF] border border-[#E8E0D8] rounded-xl px-4 py-2.5 text-sm text-[#1C1917] focus:outline-none focus:border-[#8B1A2E] transition-colors placeholder:text-[#C4BAB2] max-h-32"
          style={{ height: "auto" }}
          disabled={!wsReady}
        />
        <button
          onClick={send}
          disabled={!wsReady || !input.trim()}
          className="w-10 h-10 rounded-full bg-[#8B1A2E] text-white flex items-center justify-center hover:bg-[#5C1020] active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
        >
          ›
        </button>
      </footer>
    </div>
  );
}
