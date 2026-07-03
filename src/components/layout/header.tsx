"use client";

import * as React from "react";
import { Search, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Avatar } from "@/components/ui/avatar";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#1F2937] bg-[#09090B]/80 backdrop-blur-xl px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-9" />
        {title && (
          <h1 className="text-lg font-semibold text-[#FAFAFA]">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <input
            placeholder="Search campaigns, reports..."
            className="h-9 w-48 lg:w-64 rounded-lg border border-[#1F2937] bg-[#111827] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
          />
        </div>

        <Link
          href="/dashboard/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#1F2937] bg-[#111827] text-[#9CA3AF] hover:text-[#FAFAFA] transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-medium text-white">
            3
          </span>
        </Link>

        <Link
          href="/dashboard/settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1F2937] bg-[#111827] text-[#9CA3AF] hover:text-[#FAFAFA] transition-colors"
        >
          <Settings className="h-4 w-4" />
        </Link>

        <Avatar name={user?.name} email={user?.email} src={user?.avatarUrl || undefined} size="md" />
      </div>
    </header>
  );
}
