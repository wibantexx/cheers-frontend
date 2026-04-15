"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import AppShell from "@/components/AppShell";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username ?? "",
    bio: user?.bio ?? "",
    city: user?.city ?? "",
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
    setForm({ username: user?.username ?? "", bio: user?.bio ?? "", city: user?.city ?? "" });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <AppShell>
      <div className="p-4 pb-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group"
            disabled={uploadAvatar.isPending}
          >
            <div className="w-24 h-24 rounded-full bg-[#1C1917] overflow-hidden ring-4 ring-[#FAF5EF]">
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
          <h1 className="font-display text-xl text-[#1C1917] mt-3">{user.username}</h1>
          <p className="text-[#78716C] text-xs mt-0.5">{user.email}</p>
          {!user.is_verified && (
            <span className="mt-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Email not verified
            </span>
          )}
        </div>

        {/* Info / Edit form */}
        <div className="bg-white border border-[#E8E0D8] rounded-2xl p-5 mb-4">
          {editing ? (
            <form onSubmit={save} className="space-y-4">
              {(
                [
                  { key: "username" as const, label: "Username", placeholder: "your_name" },
                  { key: "city" as const, label: "City", placeholder: "Where are you?" },
                ] as const
              ).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wide block mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-[#E8E0D8] rounded-xl px-4 py-2.5 text-sm text-[#1C1917] bg-[#FAF5EF] focus:outline-none focus:border-[#8B1A2E] transition-colors placeholder:text-[#C4BAB2]"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wide block mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell people about yourself…"
                  maxLength={500}
                  className="w-full border border-[#E8E0D8] rounded-xl px-4 py-2.5 text-sm text-[#1C1917] bg-[#FAF5EF] focus:outline-none focus:border-[#8B1A2E] transition-colors placeholder:text-[#C4BAB2] resize-none"
                />
                <p className="text-[10px] text-[#C4BAB2] text-right mt-1">
                  {form.bio.length}/500
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="flex-1 bg-[#8B1A2E] text-[#FAF5EF] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#5C1020] transition-colors disabled:opacity-60"
                >
                  {updateProfile.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 border border-[#E8E0D8] text-[#78716C] py-2.5 rounded-xl font-semibold text-sm hover:border-[#C4BAB2] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {user.city && (
                <div>
                  <p className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wide mb-0.5">City</p>
                  <p className="text-sm text-[#1C1917]">📍 {user.city}</p>
                </div>
              )}
              {user.bio && (
                <div>
                  <p className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wide mb-0.5">Bio</p>
                  <p className="text-sm text-[#1C1917] leading-relaxed">{user.bio}</p>
                </div>
              )}
              {!user.city && !user.bio && (
                <p className="text-sm text-[#C4BAB2] text-center py-2">
                  Add a bio and city to attract more matches
                </p>
              )}
              <button
                onClick={() => setEditing(true)}
                className="w-full border border-[#E8E0D8] text-[#1C1917] py-2.5 rounded-xl font-semibold text-sm hover:border-[#8B1A2E]/40 transition-colors mt-2"
              >
                Edit profile
              </button>
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="bg-white border border-[#E8E0D8] rounded-2xl divide-y divide-[#E8E0D8] mb-4">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-[#78716C]">Age</span>
            <span className="text-sm font-medium text-[#1C1917]">{user.age}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-[#78716C]">Member since</span>
            <span className="text-sm font-medium text-[#1C1917]">
              {new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => logout()}
          className="w-full border border-[#E8E0D8] text-[#8B1A2E] py-3 rounded-2xl font-semibold text-sm hover:bg-[#8B1A2E]/5 transition-colors"
        >
          Sign out
        </button>
      </div>
    </AppShell>
  );
}
