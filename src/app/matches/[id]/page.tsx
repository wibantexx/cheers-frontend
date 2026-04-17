"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import AppShell from "@/components/AppShell";
import { REACTION_EMOJIS } from "@/lib/profileExtras";
import { OnlineDot, lastSeenLabel } from "@/components/OnlineIndicator";
import PartnerProfileModal from "@/components/PartnerProfileModal";
import toast from "react-hot-toast";

interface Reaction { emoji: string; user_id: string; }
interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  reactions?: Reaction[];
}

interface Partner { id: string; username: string; age: number; avatar_url?: string; last_seen?: string | null; }
interface Match { id: string; created_at: string; partner: Partner; }

function getDateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Сегодня";
  if (date.toDateString() === yesterday.toDateString()) return "Вчера";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export default function ChatPage() {
  const { id: matchId } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [wsReady, setWsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCount = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: () => api.get("/api/v1/matching/matches").then((r) => r.data),
    staleTime: 60_000,
  });
  const match = matches.find((m) => m.id === matchId);

  useEffect(() => {
    if (!matchId) return;
    api.get(`/api/v1/chat/${matchId}/messages`, { params: { limit: 50 } })
      .then((r) => {
        setMessages(r.data);
        qc.invalidateQueries({ queryKey: ["matches"] });
      })
      .catch(() => {});
  }, [matchId, qc]);

  const connect = useCallback(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    const wsBase = process.env.NEXT_PUBLIC_API_URL!
      .replace(/^https?/, (s) => (s === "https" ? "wss" : "ws"));
    const ws = new WebSocket(`${wsBase}/api/v1/chat/${matchId}/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsReady(true);
      reconnectCount.current = 0;
    };

    ws.onclose = () => {
      setWsReady(false);
      const delay = Math.min(1500 * 2 ** reconnectCount.current, 20000);
      reconnectCount.current++;
      reconnectRef.current = setTimeout(connect, delay);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "reaction" && data.message_id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.message_id ? { ...m, reactions: data.reactions } : m
          )
        );
        return;
      }
      if (data.type === "read" && data.user_id && data.user_id !== user?.id) {
        // Partner has read our messages — mark all our sent msgs as is_read.
        setMessages((prev) =>
          prev.map((m) => (m.sender_id === user?.id && !m.is_read ? { ...m, is_read: true } : m))
        );
        return;
      }
      // Default (new message)
      if (data.id) {
        const msg: Message = { ...data, reactions: data.reactions ?? [] };
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        qc.invalidateQueries({ queryKey: ["matches"] });
        // If the message is from the partner and tab is visible, immediately mark as read.
        if (msg.sender_id !== user?.id && typeof document !== "undefined" && document.visibilityState === "visible") {
          api.post(`/api/v1/chat/${matchId}/read`).catch(() => {});
        }
      }
    };
  }, [matchId, router, qc]);

  useEffect(() => {
    if (!matchId) return;
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [matchId, connect]);

  // On tab-refocus, mark as read so read-receipts update quickly.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && matchId) {
        api.post(`/api/v1/chat/${matchId}/read`).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(text);
    setInput("");
  }, [input]);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "reaction", message_id: messageId, emoji }));
    } else {
      api.post(`/api/v1/chat/messages/${messageId}/react`, { emoji })
        .then((r) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, reactions: r.data.reactions } : m))
          );
        })
        .catch(() => toast.error("Не удалось поставить реакцию"));
    }
    setReactionPickerFor(null);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleUnmatch = async () => {
    if (!confirm("Убрать этот матч?")) return;
    try {
      await api.delete(`/api/v1/matching/matches/${matchId}`);
      qc.invalidateQueries({ queryKey: ["matches"] });
      router.push("/matches");
    } catch {
      toast.error("Не удалось убрать матч");
    }
  };

  const handleBlock = async () => {
    if (!match || !confirm(`Заблокировать ${match.partner.username}?`)) return;
    try {
      await api.post(`/api/v1/moderation/block/${match.partner.id}`);
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Пользователь заблокирован");
      router.push("/matches");
    } catch {
      toast.error("Не удалось заблокировать");
    }
  };

  const handleReport = async () => {
    if (!match) return;
    const reason = prompt(`Причина жалобы на ${match.partner.username}:`);
    if (!reason) return;
    try {
      await api.post(`/api/v1/moderation/report/${match.partner.id}`, { reason });
      toast.success("Жалоба отправлена");
    } catch {
      toast.error("Не удалось отправить жалобу");
    }
    setMenuOpen(false);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Group messages with date separators
  const renderedMessages: Array<{ type: "date"; label: string } | { type: "msg"; msg: Message }> = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    if (!prev || new Date(msg.created_at).toDateString() !== new Date(prev.created_at).toDateString()) {
      renderedMessages.push({ type: "date", label: getDateLabel(msg.created_at) });
    }
    renderedMessages.push({ type: "msg", msg });
  });

  return (
    <AppShell fullHeight>
      {profileOpen && match && (
        <PartnerProfileModal userId={match.partner.id} onClose={() => setProfileOpen(false)} />
      )}
      <div className="flex flex-col h-full max-w-2xl w-full mx-auto">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-3 border-b border-line bg-bg flex-shrink-0">
          <Link href="/matches" className="text-muted hover:text-fg transition-colors text-xl leading-none px-1">‹</Link>

          <button
            onClick={() => match && setProfileOpen(true)}
            disabled={!match}
            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity disabled:cursor-default"
          >
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-ink overflow-hidden">
                {match?.partner.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={match.partner.avatar_url} alt={match.partner.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-white text-sm opacity-40">{match?.partner.username[0].toUpperCase() ?? "?"}</span>
                  </div>
                )}
              </div>
              <OnlineDot lastSeen={match?.partner.last_seen} className="absolute -bottom-0.5 -right-0.5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-fg text-sm leading-tight truncate">{match?.partner.username ?? "Chat"}</p>
              <p className="text-[10px] text-muted truncate">
                {wsReady ? (lastSeenLabel(match?.partner.last_seen) ?? "online") : "connecting…"}
              </p>
            </div>
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors text-muted text-lg"
            >
              ···
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-surface border border-line rounded-xl shadow-lg z-20 min-w-[160px] py-1 overflow-hidden">
                <button onClick={handleUnmatch} className="w-full text-left px-4 py-2.5 text-sm text-muted hover:bg-surface-hover transition-colors">
                  Убрать матч
                </button>
                <button onClick={handleReport} className="w-full text-left px-4 py-2.5 text-sm text-muted hover:bg-surface-hover transition-colors">
                  Пожаловаться
                </button>
                <button onClick={handleBlock} className="w-full text-left px-4 py-2.5 text-sm text-brand hover:bg-surface-hover transition-colors">
                  Заблокировать
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <main
          className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-bg"
          onClick={() => {
            setMenuOpen(false);
            setReactionPickerFor(null);
          }}
        >
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🥂</div>
              <p className="text-muted text-sm">Матч! Скажите привет.</p>
            </div>
          )}

          {renderedMessages.map((item, i) => {
            if (item.type === "date") {
              return (
                <div key={`d-${i}`} className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-line dark:bg-surface-hover" />
                  <span className="text-[10px] text-subtle font-medium px-2">{item.label}</span>
                  <div className="flex-1 h-px bg-line dark:bg-surface-hover" />
                </div>
              );
            }
            const { msg } = item;
            const mine = msg.sender_id === user?.id;
            const reactions = msg.reactions ?? [];
            // Group reactions by emoji
            const grouped: Record<string, { count: number; mine: boolean }> = {};
            for (const r of reactions) {
              if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, mine: false };
              grouped[r.emoji].count++;
              if (r.user_id === user?.id) grouped[r.emoji].mine = true;
            }
            const pickerOpen = reactionPickerFor === msg.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"} group relative`}
              >
                <div className={`flex items-center gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`relative max-w-[60%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${
                      mine
                        ? "bg-brand text-white rounded-br-sm"
                        : "bg-surface-2 border border-line text-fg rounded-bl-sm"
                    }`}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setReactionPickerFor((cur) => (cur === msg.id ? null : msg.id));
                    }}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${mine ? "text-white/60" : "text-subtle"}`}>
                      <span>{formatTime(msg.created_at)}</span>
                      {mine && (
                        <span
                          className={`leading-none font-semibold ${msg.is_read ? "text-sky-200" : "text-white/40"}`}
                          title={msg.is_read ? "Прочитано" : "Отправлено"}
                        >
                          {msg.is_read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReactionPickerFor((cur) => (cur === msg.id ? null : msg.id));
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-surface-2 border border-line text-xs flex items-center justify-center hover:border-brand/40"
                    title="Реакция"
                  >
                    😊
                  </button>
                </div>

                {/* Reactions chip row */}
                {Object.keys(grouped).length > 0 && (
                  <div className={`mt-1 flex gap-1 ${mine ? "flex-row-reverse" : ""}`}>
                    {Object.entries(grouped).map(([emoji, info]) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(msg.id, emoji)}
                        className={`px-2 py-0.5 rounded-full text-[11px] border flex items-center gap-1 transition-colors ${
                          info.mine
                            ? "bg-brand/10 border-brand/40 text-brand"
                            : "bg-surface-2 border-line text-muted hover:border-subtle"
                        }`}
                      >
                        <span>{emoji}</span>
                        {info.count > 1 && <span className="font-semibold">{info.count}</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reaction picker popup */}
                {pickerOpen && (
                  <div
                    className={`mt-1 flex gap-1 bg-surface border border-line rounded-full px-2 py-1 shadow-lg z-10`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(msg.id, emoji)}
                        className="w-8 h-8 rounded-full hover:bg-surface-hover text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <footer className="border-t border-line bg-surface px-5 py-3 flex items-end gap-3 flex-shrink-0">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Написать сообщение…"
            className="flex-1 resize-none bg-surface-2 border border-line rounded-xl px-4 py-2.5 text-sm text-fg focus:outline-none focus:border-brand transition-colors placeholder:text-subtle max-h-32"
            style={{ height: "auto" }}
            disabled={!wsReady}
          />
          <button
            onClick={send}
            disabled={!wsReady || !input.trim()}
            className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-hover active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
          >
            ›
          </button>
        </footer>
      </div>
    </AppShell>
  );
}
