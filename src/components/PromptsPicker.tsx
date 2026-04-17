"use client";

import { useState } from "react";
import { PROMPTS, PromptAnswer } from "@/lib/profileExtras";

interface Props {
  current: PromptAnswer[];
  onSave: (prompts: PromptAnswer[]) => void;
  saving?: boolean;
}

const MAX_PROMPTS = 3;
const MAX_ANSWER_LEN = 120;

export default function PromptsPicker({ current, onSave, saving }: Props) {
  const [local, setLocal] = useState<PromptAnswer[]>(current);
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const chosenQuestions = new Set(local.map((p) => p.q));
  const availablePrompts = PROMPTS.filter((p) => !chosenQuestions.has(p));

  const removePrompt = (q: string) => setLocal((prev) => prev.filter((p) => p.q !== q));

  const addPrompt = () => {
    if (!newQ || !newA.trim()) return;
    if (local.length >= MAX_PROMPTS) return;
    setLocal((prev) => [...prev, { q: newQ, a: newA.trim() }]);
    setNewQ("");
    setNewA("");
    setAdding(false);
  };

  const isDirty = JSON.stringify(local) !== JSON.stringify(current);

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-fg text-sm">Ответы на вопросы</h2>
          <p className="text-[10px] text-subtle mt-0.5">
            Помогут начать разговор после матча
          </p>
        </div>
        <span className="text-[10px] text-subtle">
          {local.length}/{MAX_PROMPTS}
        </span>
      </div>

      <div className="px-5 py-4 space-y-3">
        {local.length === 0 && !adding && (
          <p className="text-sm text-subtle text-center py-2">
            Пока ничего не выбрано
          </p>
        )}

        {local.map((p) => (
          <div
            key={p.q}
            className="bg-surface-2 rounded-xl px-4 py-3 relative"
          >
            <p className="text-[10px] font-semibold text-brand uppercase tracking-wide mb-1 pr-6">
              {p.q}
            </p>
            <p className="text-sm text-fg leading-snug">
              {p.a}
            </p>
            <button
              onClick={() => removePrompt(p.q)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full text-subtle hover:text-brand text-sm"
            >
              ✕
            </button>
          </div>
        ))}

        {adding ? (
          <div className="bg-surface-2 rounded-xl p-3 space-y-2">
            <select
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-xs text-fg"
            >
              <option value="">Выберите вопрос…</option>
              {availablePrompts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <textarea
              value={newA}
              onChange={(e) => setNewA(e.target.value.slice(0, MAX_ANSWER_LEN))}
              rows={2}
              placeholder="Ваш ответ…"
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-fg resize-none placeholder:text-subtle"
            />
            <div className="flex gap-2">
              <button
                onClick={addPrompt}
                disabled={!newQ || !newA.trim()}
                className="flex-1 bg-brand text-white py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
              >
                Добавить
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewQ("");
                  setNewA("");
                }}
                className="flex-1 border border-line text-muted py-1.5 rounded-lg text-xs font-semibold"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          local.length < MAX_PROMPTS &&
          availablePrompts.length > 0 && (
            <button
              onClick={() => setAdding(true)}
              className="w-full border border-dashed border-line text-muted py-2.5 rounded-xl text-xs font-semibold hover:border-brand/40 hover:text-brand transition-colors"
            >
              + Добавить вопрос
            </button>
          )
        )}
      </div>

      <div className="px-5 py-4 border-t border-line">
        <button
          onClick={() => onSave(local)}
          disabled={!isDirty || saving}
          className="w-full bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors disabled:opacity-40"
        >
          {saving ? "Сохраняю…" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
