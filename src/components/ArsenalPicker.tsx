"use client";

import { useState } from "react";
import { DRINK_CATEGORIES } from "@/lib/drinks";

interface Props {
  have: string[];
  want: string[];
  onSave: (have: string[], want: string[]) => void;
  saving?: boolean;
}

export default function ArsenalPicker({ have, want, onSave, saving }: Props) {
  const [tab, setTab] = useState<"have" | "want">("have");
  const [localHave, setLocalHave] = useState<string[]>(have);
  const [localWant, setLocalWant] = useState<string[]>(want);

  const toggle = (item: string) => {
    if (tab === "have") {
      setLocalHave((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    } else {
      setLocalWant((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    }
  };

  const active = tab === "have" ? localHave : localWant;
  const isDirty =
    JSON.stringify(localHave.slice().sort()) !== JSON.stringify(have.slice().sort()) ||
    JSON.stringify(localWant.slice().sort()) !== JSON.stringify(want.slice().sort());

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="font-semibold text-fg text-sm mb-3">Арсенал</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("have")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "have"
                ? "bg-brand text-white"
                : "bg-surface-2 text-muted hover:text-fg"
            }`}
          >
            🍸 У меня есть{localHave.length > 0 && ` (${localHave.length})`}
          </button>
          <button
            onClick={() => setTab("want")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "want"
                ? "bg-gold text-white"
                : "bg-surface-2 text-muted hover:text-fg"
            }`}
          >
            ✨ Хочу попробовать{localWant.length > 0 && ` (${localWant.length})`}
          </button>
        </div>
      </div>

      <div className="px-5 py-4 max-h-80 overflow-y-auto space-y-4">
        {DRINK_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wide mb-2">
              {cat.emoji} {cat.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((item) => {
                const selected = active.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle(item)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                      selected
                        ? tab === "have"
                          ? "bg-brand text-white border-brand"
                          : "bg-gold text-white border-gold"
                        : "bg-surface-2 text-muted border-line hover:border-subtle hover:text-fg"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-line">
        <button
          onClick={() => onSave(localHave, localWant)}
          disabled={!isDirty || saving}
          className="w-full bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors disabled:opacity-40"
        >
          {saving ? "Сохраняю…" : "Сохранить арсенал"}
        </button>
      </div>
    </div>
  );
}
