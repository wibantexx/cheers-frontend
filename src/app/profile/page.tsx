"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import AppShell from "@/components/AppShell";
import ArsenalPicker from "@/components/ArsenalPicker";
import AvatarPickerModal from "@/components/AvatarPickerModal";
import MoodPicker from "@/components/MoodPicker";
import InterestsPicker from "@/components/InterestsPicker";
import PromptsPicker from "@/components/PromptsPicker";
import ChangePasswordSection from "@/components/ChangePasswordSection";
import LocationButton from "@/components/LocationButton";
import ProfileCompleteness from "@/components/ProfileCompleteness";
import { PromptAnswer } from "@/lib/profileExtras";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const { dark, toggle: toggleTheme } = useThemeStore();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [form, setForm] = useState({
    username: user?.username ?? "",
    bio: user?.bio ?? "",
    city: user?.city ?? "",
    age: user?.age ?? 18,
  });

  const updateProfile = useMutation({
    mutationFn: (data: typeof form) => api.patch("/api/v1/users/me", data).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      setEditing(false);
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const setDefaultAvatar = useMutation({
    mutationFn: (url: string) =>
      api.patch("/api/v1/users/me", { avatar_url: url }).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      setShowAvatarPicker(false);
      toast.success("Аватар обновлён");
    },
    onError: () => toast.error("Не удалось сменить аватар"),
  });

  const resetLikes = useMutation({
    mutationFn: () => api.delete("/api/v1/matching/likes").then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      toast.success(`Сброшено ${data.reset} лайков — профили снова доступны`);
    },
    onError: () => toast.error("Не удалось сбросить"),
  });

  const saveArsenal = useMutation({
    mutationFn: (data: { arsenal_have: string[]; arsenal_want: string[] }) =>
      api.patch("/api/v1/users/me", data).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Арсенал сохранён");
    },
    onError: () => toast.error("Ошибка сохранения"),
  });

  const saveMood = useMutation({
    mutationFn: (mood: string | null) =>
      api.patch("/api/v1/users/me", { mood }).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Настроение обновлено");
    },
    onError: () => toast.error("Не удалось сохранить"),
  });

  const saveInterests = useMutation({
    mutationFn: (interests: string[]) =>
      api.patch("/api/v1/users/me", { interests }).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Интересы сохранены");
    },
    onError: () => toast.error("Не удалось сохранить"),
  });

  const savePrompts = useMutation({
    mutationFn: (prompts: PromptAnswer[]) =>
      api.patch("/api/v1/users/me", { prompts }).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Ответы сохранены");
    },
    onError: () => toast.error("Не удалось сохранить"),
  });

  const resendVerification = useMutation({
    mutationFn: () => api.post("/api/v1/auth/resend-verification").then((r) => r.data),
    onSuccess: () => toast.success("Письмо отправлено — проверьте почту"),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail
        ?? (err as { message?: string })?.message
        ?? "Не удалось отправить письмо";
      toast.error(msg);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.post("/api/v1/users/me/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data);
    },
    onSuccess: (data) => {
      setUser(data);
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Avatar updated");
    },
    onError: () => toast.error("Failed to upload avatar"),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max file size is 5 MB"); return; }
    uploadAvatar.mutate(file);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  const cancelEdit = () => {
    setForm({ username: user?.username ?? "", bio: user?.bio ?? "", city: user?.city ?? "", age: user?.age ?? 18 });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <>
    {showAvatarPicker && (
      <AvatarPickerModal
        current={user.avatar_url}
        onSelect={(url) => setDefaultAvatar.mutate(url)}
        onClose={() => setShowAvatarPicker(false)}
        saving={setDefaultAvatar.isPending}
      />
    )}
    <AppShell>
      <div className="p-8 pb-12 max-w-xl mx-auto text-fg">
        {/* Avatar */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group"
            disabled={uploadAvatar.isPending}
          >
            <div className="w-24 h-24 rounded-full bg-ink overflow-hidden ring-4 ring-bg">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-white text-4xl opacity-30">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {uploadAvatar.isPending ? "…" : "Change"}
              </span>
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="mt-2 text-xs text-brand hover:underline transition-colors"
          >
            или выбрать из готовых
          </button>
          <h1 className="font-display text-xl text-fg mt-3">{user.username}</h1>
          <p className="text-muted text-xs mt-0.5">{user.email}</p>
          {!user.is_verified && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium dark:bg-amber-500/15 dark:text-amber-300">
                Email не подтверждён
              </span>
              <button
                onClick={() => resendVerification.mutate()}
                disabled={resendVerification.isPending}
                className="text-[10px] text-brand hover:underline disabled:opacity-50 font-medium"
              >
                {resendVerification.isPending ? "Отправляем…" : "Отправить ещё раз"}
              </button>
            </div>
          )}
        </div>

        {/* Completeness */}
        <ProfileCompleteness user={user} />

        {/* Info / Edit form */}
        <div className="bg-surface border border-line rounded-2xl p-5 mb-4">
          {editing ? (
            <form onSubmit={save} className="space-y-4">
              {(
                [
                  { key: "username" as const, label: "Username", placeholder: "your_name" },
                  { key: "city" as const, label: "City", placeholder: "Where are you?" },
                ] as const
              ).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-line rounded-xl px-4 py-2.5 text-sm text-fg bg-surface-2 focus:outline-none focus:border-brand transition-colors placeholder:text-subtle"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                  Возраст
                </label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                  className="w-full border border-line rounded-xl px-4 py-2.5 text-sm text-fg bg-surface-2 focus:outline-none focus:border-brand transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell people about yourself…"
                  maxLength={500}
                  className="w-full border border-line rounded-xl px-4 py-2.5 text-sm text-fg bg-surface-2 focus:outline-none focus:border-brand transition-colors placeholder:text-subtle resize-none"
                />
                <p className="text-[10px] text-subtle text-right mt-1">
                  {form.bio.length}/500
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="flex-1 bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                  {updateProfile.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 border border-line text-muted py-2.5 rounded-xl font-semibold text-sm hover:border-subtle transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {user.city && (
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-0.5">City</p>
                  <p className="text-sm text-fg">📍 {user.city}</p>
                </div>
              )}
              {user.bio && (
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-0.5">Bio</p>
                  <p className="text-sm text-fg leading-relaxed">{user.bio}</p>
                </div>
              )}
              {!user.city && !user.bio && (
                <p className="text-sm text-subtle text-center py-2">
                  Add a bio and city to attract more matches
                </p>
              )}
              <button
                onClick={() => setEditing(true)}
                className="w-full border border-line text-fg py-2.5 rounded-xl font-semibold text-sm hover:border-brand/40 transition-colors mt-2"
              >
                Edit profile
              </button>
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="bg-surface border border-line rounded-2xl divide-y divide-line mb-4">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-muted">Age</span>
            <span className="text-sm font-medium text-fg">{user.age}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-muted">Member since</span>
            <span className="text-sm font-medium text-fg">
              {new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-muted">Тёмная тема</span>
            <button
              onClick={toggleTheme}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                dark ? "bg-brand" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  dark ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mood */}
        <MoodPicker
          current={user.mood}
          onSave={(mood) => saveMood.mutate(mood)}
          saving={saveMood.isPending}
        />

        <div className="mt-4" />

        {/* Prompts */}
        <PromptsPicker
          current={user.prompts ?? []}
          onSave={(prompts) => savePrompts.mutate(prompts)}
          saving={savePrompts.isPending}
        />

        <div className="mt-4" />

        {/* Interests */}
        <InterestsPicker
          current={user.interests ?? []}
          onSave={(interests) => saveInterests.mutate(interests)}
          saving={saveInterests.isPending}
        />

        <div className="mt-4" />

        {/* Arsenal */}
        <ArsenalPicker
          have={user.arsenal_have ?? []}
          want={user.arsenal_want ?? []}
          onSave={(have, want) => saveArsenal.mutate({ arsenal_have: have, arsenal_want: want })}
          saving={saveArsenal.isPending}
        />

        <div className="mt-4" />

        {/* Location */}
        <LocationButton hasLocation={user.latitude != null && user.longitude != null} />

        {/* Change password */}
        <ChangePasswordSection />

        {/* Reset likes */}
        <button
          onClick={() => {
            if (confirm("Сбросить все лайки и пассы? Профили появятся снова в подборе.")) {
              resetLikes.mutate();
            }
          }}
          disabled={resetLikes.isPending}
          className="w-full border border-line text-muted py-3 rounded-2xl font-semibold text-sm hover:border-subtle transition-colors disabled:opacity-60 mb-3"
        >
          {resetLikes.isPending ? "Сброс…" : "Сбросить историю подбора"}
        </button>

        {/* Sign out */}
        <button
          onClick={() => logout()}
          className="w-full border border-line text-brand py-3 rounded-2xl font-semibold text-sm hover:bg-brand/5 transition-colors"
        >
          Sign out
        </button>
      </div>
    </AppShell>
    </>
  );
}
