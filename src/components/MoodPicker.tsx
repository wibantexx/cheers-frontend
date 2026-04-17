"use client";

import { useState } from "react";
import { MOODS } from "@/lib/profileExtras";

interface Props {
  current?: string | null;
  onSave: (mood: string | null) => void;
  saving?: boolean;
}

export default function MoodPicker({ current, onSave, saving }: Props) {
  const [open, setOpen] = useState(false);

  const choose = (mood: string | null) => {
    onSave(mood);
    setOpen(false);
  };

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">
            Сейчас
          </p>
          {current ? (
            <p className="text-sm text-fg truncate">{current}</p>
          ) : (
            <p className="text-sm text-subtle">Добавьте настроение — оно будет видно в карточке</p>
          )}
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          disabled={saving}
          className="ml-3 text-xs font-semibold text-brand hover:underline disabled:opacity-60 flex-shrink-0"
        >
          {open ? "Скрыть" : current ? "Изменить" : "Выбрать"}
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-5 py-4 space-y-1.5">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => choose(m)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                current === m
                  ? "bg-brand text-white"
                  : "hover:bg-surface-2 text-fg"
              }`}
            >
              {m}
            </button>
          ))}
          {current && (
            <button
              onClick={() => choose(null)}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted hover:text-brand transition-colors"
            >
              Убрать настроение
            </button>
          )}
        </div>
      )}
    </div>
  );
}
