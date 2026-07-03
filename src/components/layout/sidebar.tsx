"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  PenTool,
  Bot,
  BarChart3,
  TrendingUp,
  Workflow,
  FileText,
  Link2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Compass,
  BookOpen,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { Avatar } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
  { label: "Analysis", href: "/dashboard/analysis", icon: BarChart3 },
  { label: "Creative Studio", href: "/dashboard/creative", icon: PenTool },
  { label: "AI Copilot", href: "/dashboard/copilot", icon: Bot },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "Automation", href: "/dashboard/automation", icon: Workflow },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
  { label: "Integrations", href: "/dashboard/integrations", icon: Link2 },
];

const bottomItems = [
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Help & Guides", href: "/dashboard/help", icon: BookOpen },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({ collapsed, onNavClick, onStartTour }: { collapsed: boolean; onNavClick?: () => void; onStartTour?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const renderLink = (item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = item.icon;
    const isActive = pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          collapsed && "justify-center px-2",
          isActive
            ? "bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/20"
            : "text-[#9CA3AF] hover:text-[#FAFAFA] hover:bg-[#1F2937]"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const adminItems = user?.role === "admin"
    ? [{ label: "Admin", href: "/dashboard/admin", icon: ShieldCheck }]
    : [];

  return (
    <>
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-[#1F2937]", collapsed && "justify-center px-2")}>
        <Image src="/logo.png" alt="AdPilot AI" width={32} height={32} className="h-8 w-8" />
        {!collapsed && (
          <span className="font-bold text-base text-[#FAFAFA]">AdPilot AI</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(renderLink)}
        {adminItems.map(renderLink)}
      </nav>

      <div className="border-t border-[#1F2937] p-3 space-y-1">
        {bottomItems.map(renderLink)}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-2 border-t border-[#1F2937]/50">
            <Avatar name={user.name} email={user.email} src={user.avatarUrl || undefined} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#FAFAFA] truncate">{user.name || user.email}</p>
              <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
            </div>
          </div>
        )}
        {collapsed && user && (
          <div className="flex justify-center px-2 py-2">
            <Avatar name={user.name} email={user.email} src={user.avatarUrl || undefined} size="sm" />
          </div>
        )}
        {!collapsed && onStartTour && (
          <button
            onClick={onStartTour}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[#6B7280] hover:text-[#A78BFA] hover:bg-[#7C3AED]/10 transition-all duration-200 mt-1"
          >
            <Compass className="h-4 w-4 shrink-0" />
            <span>Take a Tour</span>
          </button>
        )}
        {!collapsed && (
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </>
  );
}

export function Sidebar({ onStartTour }: { onStartTour?: () => void }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-[#1F2937] bg-[#111827] text-[#9CA3AF] hover:text-[#FAFAFA] transition-colors"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-[#09090B]/95 backdrop-blur-xl border-r border-[#1F2937]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#FAFAFA] hover:bg-[#1F2937]"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent collapsed={false} onNavClick={() => setMobileOpen(false)} onStartTour={onStartTour} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden lg:flex h-screen flex-col border-r border-[#1F2937] bg-[#09090B]/80 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        <SidebarContent collapsed={collapsed} onStartTour={onStartTour} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-[#1F2937] bg-[#111827] text-[#9CA3AF] hover:text-[#FAFAFA] transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  );
}
