"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MatchUser {
  username: string;
  avatar_url?: string;
}

interface Props {
  me: MatchUser;
  partner: MatchUser;
  matchId: string | null;
  onClose: () => void;
}

export default function MatchModal({ me, partner, matchId, onClose }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      <div className="relative flex flex-col items-center px-8 animate-[matchIn_600ms_cubic-bezier(0.2,0.8,0.2,1)]">
        <div className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand via-gold to-brand bg-clip-text text-transparent mb-2 text-center">
          It&apos;s a match!
        </div>
        <p className="text-white/80 text-sm mb-10 text-center">
          Вы оба сказали «да». Самое время написать первым.
        </p>

        <div className="flex items-center gap-6 mb-10">
          <Avatar user={me} delay={0} />
          <div className="text-4xl animate-[pulse_1.5s_ease-in-out_infinite]">🥂</div>
          <Avatar user={partner} delay={120} />
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          {matchId && (
            <Link
              href={`/matches/${matchId}`}
              className="w-full bg-brand text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-hover transition-colors text-center shadow-lg shadow-brand/30"
            >
              Написать сообщение
            </Link>
          )}
          <button
            onClick={onClose}
            className="w-full border border-white/30 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Продолжить смотреть
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes matchIn {
          0%   { opacity: 0; transform: scale(0.8) translateY(20px); }
          60%  { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Avatar({ user, delay }: { user: MatchUser; delay: number }) {
  return (
    <div
      className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-ink overflow-hidden ring-4 ring-gold/60 shadow-2xl"
      style={{
        animation: `avatarPop 550ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms both`,
      }}
    >
      {user.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-white text-3xl font-display opacity-60">
            {user.username[0]?.toUpperCase() ?? "?"}
          </span>
        </div>
      )}
      <style jsx>{`
        @keyframes avatarPop {
          from { opacity: 0; transform: scale(0.4) rotate(-10deg); }
          to   { opacity: 1; transform: scale(1) rotate(0); }
        }
      `}</style>
    </div>
  );
}
