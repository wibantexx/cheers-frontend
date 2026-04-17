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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-brand font-bold block text-center mb-10">
          Cheers
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-line p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h1 className="font-display text-xl text-fg mb-2">Check your inbox</h1>
              <p className="text-muted text-sm">
                If that email exists, a reset link has been sent.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-fg mb-1">Reset password</h1>
              <p className="text-muted text-sm mb-8">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm text-fg bg-bg focus:outline-none focus:border-brand transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted mt-6">
          <Link href="/login" className="text-brand font-medium hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
