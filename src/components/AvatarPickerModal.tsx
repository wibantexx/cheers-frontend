"use client";

import { DEFAULT_AVATARS } from "@/lib/avatars";

interface Props {
  current?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  saving?: boolean;
}

export default function AvatarPickerModal({ current, onSelect, onClose, saving }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-fg text-sm">
            Выбрать аватар
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-fg text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 grid grid-cols-5 gap-3 max-h-80 overflow-y-auto">
          {DEFAULT_AVATARS.map((av) => {
            const selected = current === av.url;
            return (
              <button
                key={av.id}
                onClick={() => onSelect(av.url)}
                disabled={saving}
                className={`relative rounded-xl overflow-hidden aspect-square transition-all hover:scale-105 active:scale-95 ${
                  selected
                    ? "ring-3 ring-brand ring-offset-2 dark:ring-offset-surface"
                    : "ring-1 ring-line hover:ring-brand/50"
                } disabled:opacity-50`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                {selected && (
                  <div className="absolute inset-0 bg-brand/20 flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-4 pt-1">
          <p className="text-[10px] text-subtle text-center">
            Нажмите на аватар чтобы выбрать, или загрузите своё фото выше
          </p>
        </div>
      </div>
    </div>
  );
}
