"use client";

import * as React from "react";
import { Search, Command, FileText, Megaphone, MessageSquare } from "lucide-react";

const searchResults = [
  { type: "campaign", label: "Summer Sale 2026", icon: Megaphone, href: "/campaigns/camp-001" },
  { type: "report", label: "Weekly Performance Report", icon: FileText, href: "/reports" },
  { type: "message", label: "Campaign Performance Analysis", icon: MessageSquare, href: "/copilot" },
];

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[#1F2937] bg-[#111827] px-3 py-2 text-sm text-[#6B7280] hover:text-[#9CA3AF] transition-colors w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto flex items-center gap-1 rounded border border-[#1F2937] px-1.5 py-0.5 text-xs text-[#6B7280]">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-[#1F2937] bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center border-b border-[#1F2937] px-4">
              <Search className="h-5 w-5 text-[#6B7280]" />
              <input
                autoFocus
                placeholder="Search campaigns, reports, users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-12 bg-transparent px-3 text-sm text-[#FAFAFA] placeholder:text-[#6B7280] focus:outline-none"
              />
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {searchResults.map((result, i) => {
                const Icon = result.icon;
                return (
                  <button
                    key={i}
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#9CA3AF] hover:text-[#FAFAFA] hover:bg-[#1F2937] transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{result.label}</span>
                    <span className="ml-auto text-xs text-[#6B7280] capitalize">{result.type}</span>
                  </button>
                );
              })}
              {query && (
                <p className="px-3 py-4 text-center text-sm text-[#6B7280]">
                  No results found for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
