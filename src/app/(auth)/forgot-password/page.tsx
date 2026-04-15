"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/v1/auth/forgot-password", { email });
      setSent(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-[#8B1A2E] font-bold block text-center mb-10">
          Cheers
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E8E0D8] p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h1 className="font-display text-xl text-[#1C1917] mb-2">Check your inbox</h1>
              <p className="text-[#78716C] text-sm">
                If that email exists, a reset link has been sent.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-[#1C1917] mb-1">Reset password</h1>
              <p className="text-[#78716C] text-sm mb-8">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wide block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm text-[#1C1917] bg-[#FAF5EF] focus:outline-none focus:border-[#8B1A2E] transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8B1A2E] text-[#FAF5EF] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#5C1020] transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#78716C] mt-6">
          <Link href="/login" className="text-[#8B1A2E] font-medium hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
