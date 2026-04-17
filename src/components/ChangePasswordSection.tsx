"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

function validateNewPassword(pw: string): string | null {
  if (pw.length < 8) return "Пароль минимум 8 символов";
  if (!/[A-Z]/.test(pw)) return "Пароль должен содержать заглавную букву";
  if (!/\d/.test(pw)) return "Пароль должен содержать цифру";
  return null;
}

export default function ChangePasswordSection() {
  const setUser = useAuthStore((s) => s.setUser);
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const reset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const mutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      api.post("/api/v1/auth/change-password", data).then((r) => r.data),
    onSuccess: () => {
      toast.success("Пароль изменён. Войдите заново.");
      reset();
      setOpen(false);
      // token_version bumped on the server — existing tokens are now invalid.
      // Don't call /auth/logout (it would 401 with the stale access_token);
      // just clear local state and redirect.
      localStorage.removeItem("access_token");
      setUser(null);
      window.location.href = "/login";
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } }; message?: string })
          ?.response?.data?.detail ??
        (err as { message?: string })?.message ??
        "Не удалось сменить пароль";
      toast.error(typeof msg === "string" ? msg : "Не удалось сменить пароль");
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) return toast.error("Введите текущий пароль");
    const err = validateNewPassword(newPassword);
    if (err) return toast.error(err);
    if (newPassword !== confirmPassword) return toast.error("Пароли не совпадают");
    if (newPassword === oldPassword) return toast.error("Новый пароль должен отличаться");
    mutation.mutate({ old_password: oldPassword, new_password: newPassword });
  };

  return (
    <div className="bg-surface border border-line rounded-2xl mb-4 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors"
      >
        <span className="text-sm text-fg font-medium">Сменить пароль</span>
        <span className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <form onSubmit={submit} className="px-5 py-4 border-t border-line space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1.5">
              Текущий пароль
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border border-line rounded-xl px-4 py-2.5 text-sm text-fg bg-surface-2 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1.5">
              Новый пароль
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="8+ символов, заглавная и цифра"
              className="w-full border border-line rounded-xl px-4 py-2.5 text-sm text-fg bg-surface-2 focus:outline-none focus:border-brand transition-colors placeholder:text-subtle"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1.5">
              Повторите новый пароль
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full border border-line rounded-xl px-4 py-2.5 text-sm text-fg bg-surface-2 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <p className="text-[11px] text-subtle">
            После смены пароля все активные сессии будут закрыты.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? "Сохраняем…" : "Сменить пароль"}
            </button>
            <button
              type="button"
              onClick={() => { reset(); setOpen(false); }}
              className="flex-1 border border-line text-muted py-2.5 rounded-xl font-semibold text-sm hover:border-subtle transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
