"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090B] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-transparent to-transparent" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="AdPilot AI" className="h-10 w-10 rounded-xl" />
            <span className="text-xl font-bold text-[#FAFAFA]">AdPilot AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#FAFAFA] mb-2">Welcome back</h1>
          <p className="text-[#9CA3AF]">Sign in to your account to continue</p>
        </div>

        <div className="glass rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-[#9CA3AF] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-11 px-4 bg-[#09090B] border border-white/10 rounded-xl text-[#FAFAFA] placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[#9CA3AF] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-11 px-4 pr-11 bg-[#09090B] border border-white/10 rounded-xl text-[#FAFAFA] placeholder-[#6B7280] focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Signing in...</>
              ) : (
                "Sign In"
              )}
            </button>
            <p className="text-center text-sm text-[#6B7280]">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="text-[#7C3AED] hover:text-[#6D28D9]">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
