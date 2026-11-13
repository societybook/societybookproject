"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"platform" | "staff">("platform");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          accountType,
          societyId: societyId ? societyId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (accountType === "platform") {
        router.push("/platform");
      } else {
        router.push("/admin");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100 antialiased selection:bg-zinc-800">
      <div className="w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-zinc-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SocietyBook Master SaaS
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Sign In</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Access the Platform Administration or Society Staff Console
          </p>
        </div>

        {/* Portal Switcher */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setAccountType("platform");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-colors ${
              accountType === "platform"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Super Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountType("staff");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-colors ${
              accountType === "staff"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Society Staff
          </button>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-6 shadow-2xl space-y-4"
        >
          {error && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={accountType === "platform" ? "superadmin@societybook.internal" : "secretary@society.com"}
              className="w-full px-3 py-2 text-sm bg-zinc-950/80 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Account Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 text-sm bg-zinc-950/80 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
            />
          </div>

          {accountType === "staff" && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Society UUID (Optional)
              </label>
              <input
                type="text"
                value={societyId}
                onChange={(e) => setSocietyId(e.target.value)}
                placeholder="Leave blank for default assigned society"
                className="w-full px-3 py-2 text-xs bg-zinc-950/80 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              <>
                Continue to Console
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-zinc-500 space-y-1">
          <p>Multi-tenant isolated • Server-side Argon2id verification</p>
          <p>
            Resident flat login?{" "}
            <a href="/resident-login" className="text-zinc-400 hover:text-white underline underline-offset-4">
              Switch to Resident Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
