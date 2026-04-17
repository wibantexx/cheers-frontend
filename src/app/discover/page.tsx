"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import AppShell from "@/components/AppShell";
import MatchModal from "@/components/MatchModal";
import { isOnline } from "@/components/OnlineIndicator";
import DiscoverFilters, { EMPTY_FILTERS, Filters, filtersToParams } from "@/components/DiscoverFilters";
import { formatDistance } from "@/lib/distance";

interface PromptAnswer { q: string; a: string; }

interface Candidate {
  id: string;
  username: string;
  age: number;
  bio?: string;
  avatar_url?: string;
  city?: string;
  arsenal_have?: string[];
  arsenal_want?: string[];
  mood?: string | null;
  interests?: string[];
  prompts?: PromptAnswer[];
  last_seen?: string | null;
  distance_km?: number | null;
}

export default function DiscoverPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [current, setCurrent] = useState(0);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [matched, setMatched] = useState<{ partner: Candidate; matchId: string | null } | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [dragDx, setDragDx] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["candidates", filters],
    queryFn: () => api.get("/api/v1/matching/candidates", { params: filtersToParams(filters) }).then((r) => r.data),
  });

  const like = useMutation({
    mutationFn: async (c: Candidate) => {
      const res = await api.post(`/api/v1/matching/like/${c.id}`);
      return { candidate: c, data: res.data };
    },
    onSuccess: ({ candidate, data }) => {
      if (data.match) {
        setMatched({ partner: candidate, matchId: data.match_id ?? null });
        qc.invalidateQueries({ queryKey: ["matches"] });
      }
      setCurrent((c) => c + 1);
    },
    onError: () => setCurrent((c) => c + 1),
  });

  const pass = useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/matching/pass/${id}`),
    onSuccess: () => setCurrent((c) => c + 1),
    onError: () => setCurrent((c) => c + 1),
  });

  const animate = useCallback((dir: "left" | "right", c: Candidate) => {
    if (swipeDir) return;
    setSwipeDir(dir);
    setTimeout(() => {
      setSwipeDir(null);
      setDragDx(0);
      if (dir === "right") like.mutate(c);
      else pass.mutate(c.id);
    }, 320);
  }, [swipeDir, like, pass]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipeDir) return;
    dragStartX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null || swipeDir) return;
    setDragDx(e.clientX - dragStartX.current);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>, c: Candidate | undefined) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    const THRESHOLD = 80;
    if (c && dx > THRESHOLD) animate("right", c);
    else if (c && dx < -THRESHOLD) animate("left", c);
    else setDragDx(0);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full py-32">
          <div className="w-10 h-10 border-4 border-line border-t-brand rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const card = candidates[current];

  // Mutual arsenal
  const mutualHave = card && user
    ? (card.arsenal_have ?? []).filter(d => (user.arsenal_want ?? []).includes(d))
    : [];
  const mutualWant = card && user
    ? (card.arsenal_want ?? []).filter(d => (user.arsenal_have ?? []).includes(d))
    : [];
  const mutualInterests = card && user
    ? (card.interests ?? []).filter(i => (user.interests ?? []).includes(i))
    : [];
  const hasMutual = mutualHave.length > 0 || mutualWant.length > 0 || mutualInterests.length > 0;

  if (!card) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
          <div className="text-5xl mb-4">🥂</div>
          <h2 className="font-display text-2xl text-fg mb-2">
            Вы всех просмотрели
          </h2>
          <p className="text-muted text-sm mb-6">
            Новые люди появляются каждый день
          </p>
          <button
            onClick={() => {
              setCurrent(0);
              qc.invalidateQueries({ queryKey: ["candidates"] });
            }}
            className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-hover transition-colors"
          >
            Обновить
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {matched && user && (
        <MatchModal
          me={{ username: user.username, avatar_url: user.avatar_url }}
          partner={{ username: matched.partner.username, avatar_url: matched.partner.avatar_url }}
          matchId={matched.matchId}
          onClose={() => setMatched(null)}
        />
      )}
      <div className="p-8 flex flex-col items-center gap-4">
        <DiscoverFilters value={filters} onChange={(f) => { setFilters(f); setCurrent(0); }} />

        {/* Card */}
        <div className="w-full max-w-sm">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => onPointerUp(e, card)}
            onPointerCancel={(e) => onPointerUp(e, card)}
            style={
              swipeDir
                ? undefined
                : dragDx !== 0
                ? {
                    transform: `translateX(${dragDx}px) rotate(${dragDx * 0.05}deg)`,
                    transition: "none",
                    touchAction: "pan-y",
                  }
                : { touchAction: "pan-y" }
            }
            className={`relative bg-ink rounded-3xl overflow-hidden aspect-[3/4] shadow-xl select-none cursor-grab active:cursor-grabbing ${
              swipeDir === "right"
                ? "translate-x-[120%] rotate-12 opacity-0 transition-all duration-300"
                : swipeDir === "left"
                ? "-translate-x-[120%] -rotate-12 opacity-0 transition-all duration-300"
                : dragDx === 0
                ? "translate-x-0 rotate-0 opacity-100 transition-all duration-300"
                : ""
            }`}
          >
            {card.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.avatar_url} alt={card.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl opacity-20 font-display text-white">
                  {card.username[0].toUpperCase()}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

            {/* Mutual badge */}
            {hasMutual && (
              <div className="absolute top-4 left-4 bg-gold text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                🎯 Совпадение!
              </div>
            )}

            {/* Counter */}
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white/80 text-xs px-3 py-1 rounded-full">
              {candidates.length - current} left
            </div>

            {/* Online badge */}
            {isOnline(card.last_seen) && (
              <div className="absolute top-14 right-4 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                онлайн
              </div>
            )}

            {/* Mood pill */}
            {card.mood && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md text-fg text-xs font-medium px-3 py-1.5 rounded-full shadow-md max-w-[85%] text-center truncate">
                {card.mood}
              </div>
            )}

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end gap-2 mb-1">
                <h2 className="font-display text-2xl text-white font-bold">{card.username}</h2>
                <span className="text-white/70 text-lg mb-0.5">{card.age}</span>
              </div>
              {(card.city || card.distance_km != null) && (
                <p className="text-white/60 text-xs mb-1">
                  {card.city && <>📍 {card.city}</>}
                  {card.city && card.distance_km != null && " · "}
                  {card.distance_km != null && formatDistance(card.distance_km)}
                </p>
              )}
              {card.bio && (
                <p className="text-white/80 text-sm leading-snug line-clamp-2 mb-2">{card.bio}</p>
              )}

              {/* Arsenal */}
              {(card.arsenal_have?.length ?? 0) > 0 && (
                <div className="flex flex-wrap items-center gap-1 mb-1">
                  <span className="text-white/50 text-[10px]">🍸</span>
                  {card.arsenal_have!.slice(0, 3).map((d) => (
                    <span
                      key={d}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        mutualHave.includes(d)
                          ? "bg-gold text-white font-semibold"
                          : "bg-white/20 backdrop-blur-sm text-white"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                  {card.arsenal_have!.length > 3 && (
                    <span className="text-white/40 text-[10px]">+{card.arsenal_have!.length - 3}</span>
                  )}
                </div>
              )}
              {(card.arsenal_want?.length ?? 0) > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-white/50 text-[10px]">✨</span>
                  {card.arsenal_want!.slice(0, 3).map((d) => (
                    <span
                      key={d}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        mutualWant.includes(d)
                          ? "bg-gold text-white font-semibold"
                          : "bg-gold/40 backdrop-blur-sm text-white"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                  {card.arsenal_want!.length > 3 && (
                    <span className="text-white/40 text-[10px]">+{card.arsenal_want!.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Prompts + interests panel */}
          {((card.prompts?.length ?? 0) > 0 || (card.interests?.length ?? 0) > 0) && (
            <div
              className={`mt-3 space-y-3 transition-all duration-300 ${
                swipeDir ? "opacity-0" : "opacity-100"
              }`}
            >
              {card.prompts?.slice(0, 2).map((p) => (
                <div
                  key={p.q}
                  className="bg-surface border border-line rounded-2xl px-4 py-3"
                >
                  <p className="text-[10px] font-semibold text-brand uppercase tracking-wide mb-1">
                    {p.q}
                  </p>
                  <p className="text-sm text-fg leading-snug">
                    {p.a}
                  </p>
                </div>
              ))}

              {(card.interests?.length ?? 0) > 0 && (
                <div className="bg-surface border border-line rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">
                    Интересы{mutualInterests.length > 0 && ` · ${mutualInterests.length} совпадений`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.interests!.map((i) => {
                      const match = mutualInterests.includes(i);
                      return (
                        <span
                          key={i}
                          className={`text-[11px] px-2.5 py-1 rounded-full border ${
                            match
                              ? "bg-gold text-white border-gold font-semibold"
                              : "bg-surface-2 text-muted border-line"
                          }`}
                        >
                          {i}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => animate("left", card)}
            disabled={!!swipeDir}
            className="w-16 h-16 rounded-full border-2 border-line bg-surface flex items-center justify-center text-2xl hover:border-muted hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          >
            ✕
          </button>
          <button
            onClick={() => animate("right", card)}
            disabled={!!swipeDir}
            className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-3xl hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-brand/30"
          >
            ♥
          </button>
          <div className="w-16 h-16" />
        </div>
      </div>
    </AppShell>
  );
}
