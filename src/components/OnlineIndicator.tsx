"use client";

const ONLINE_MS = 2 * 60 * 1000;

export function isOnline(lastSeenIso?: string | null): boolean {
  if (!lastSeenIso) return false;
  return Date.now() - new Date(lastSeenIso).getTime() < ONLINE_MS;
}

export function lastSeenLabel(lastSeenIso?: string | null): string | null {
  if (!lastSeenIso) return null;
  const diff = Date.now() - new Date(lastSeenIso).getTime();
  if (diff < ONLINE_MS) return "онлайн";
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `был ${min} мин назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `был ${hr} ч назад`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `был ${days} дн. назад`;
  return "был давно";
}

interface DotProps {
  lastSeen?: string | null;
  className?: string;
}

export function OnlineDot({ lastSeen, className = "" }: DotProps) {
  if (!isOnline(lastSeen)) return null;
  return (
    <span
      className={`block w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-surface ${className}`}
      aria-label="онлайн"
    />
  );
}
