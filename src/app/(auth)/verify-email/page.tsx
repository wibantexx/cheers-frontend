"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/api";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    api.post("/api/v1/auth/verify-email", { token })
      .then(() => { setStatus("success"); setTimeout(() => router.push("/login"), 2500); })
      .catch(() => setStatus("error"));
  }, [token, router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="font-display text-2xl text-brand font-bold mb-10">Cheers</div>
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-line border-t-brand rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">🥂</div>
            <h1 className="font-display text-2xl text-fg mb-2">Email verified!</h1>
            <p className="text-muted text-sm">Redirecting you to sign in…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">😕</div>
            <h1 className="font-display text-2xl text-fg mb-2">Link invalid</h1>
            <p className="text-muted text-sm mb-6">The link may have expired or already been used.</p>
            <Link href="/login" className="text-brand font-medium hover:underline text-sm">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
