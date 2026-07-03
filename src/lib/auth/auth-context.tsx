"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  emailVerified: boolean;
  plan: string;
}

interface AuthContext {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string }) => Promise<{ error?: string }>;
  deleteAccount: (password: string) => Promise<{ error?: string }>;
  sendVerificationEmail: () => Promise<{ error?: string }>;
  upgradePlan: (plan: string) => Promise<{ error?: string }>;
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  isLoading: true,
  isSignedIn: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  updateProfile: async () => ({}),
  deleteAccount: async () => ({}),
  sendVerificationEmail: async () => ({}),
  upgradePlan: async () => ({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => { if (mounted) setUser(data.user); })
      .catch(() => { if (mounted) setUser(null); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const isAuthRoute = pathname.startsWith("/auth/");
    if (isAuthRoute && user) {
      router.replace(user.role === "admin" ? "/dashboard/admin" : "/dashboard");
      return;
    }
    if (!isAuthRoute && !user && pathname !== "/" && !pathname.startsWith("/api/")) {
      router.replace("/auth/sign-in");
    }
  }, [user, isLoading, pathname, router]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Login failed" };
    setUser(data.user);
    router.push(data.user.role === "admin" ? "/dashboard/admin" : "/dashboard");
    return {};
  }, [router]);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Registration failed" };
    setUser(data.user);
    router.push("/dashboard");
    return {};
  }, [router]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }, [router]);

  const updateProfile = useCallback(async (data: { name?: string; email?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || "Update failed" };
    setUser(json.user);
    return {};
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || "Delete failed" };
    setUser(null);
    router.push("/");
    return {};
  }, [router]);

  const sendVerificationEmail = useCallback(async () => {
    const res = await fetch("/api/auth/send-verification", { method: "POST" });
    const json = await res.json();
    if (!res.ok) return { error: json.error || "Failed to send verification" };
    return {};
  }, []);

  const upgradePlan = useCallback(async (plan: string) => {
    const res = await fetch("/api/account/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || "Upgrade failed" };
    setUser((prev) => prev ? { ...prev, plan } : null);
    return {};
  }, []);

  return (
    <AuthCtx.Provider value={{ user, isLoading, isSignedIn: !!user, signIn, signUp, signOut, updateProfile, deleteAccount, sendVerificationEmail, upgradePlan }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7C3AED]/20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
          </div>
        </div>
      ) : (
        children
      )}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
