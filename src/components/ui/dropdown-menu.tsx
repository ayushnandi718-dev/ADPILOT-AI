"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(DropdownMenuContext);
  return (
    <div onClick={() => context?.setOpen(!context?.open)} className="inline-block">
      {children}
    </div>
  );
}

function DropdownMenuContent({ children, className, align = "start" }: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context?.open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
      <div
        className={cn(
          "absolute z-50 min-w-[12rem] rounded-lg border border-[#1F2937] bg-[#111827] p-1 shadow-xl",
          align === "end" ? "right-0" : "left-0",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

function DropdownMenuItem({ children, onClick, className, variant }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "destructive";
}) {
  const context = React.useContext(DropdownMenuContext);
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#9CA3AF] hover:text-[#FAFAFA] hover:bg-[#1F2937] transition-colors duration-150",
        variant === "destructive" && "text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10",
        className
      )}
      onClick={() => { onClick?.(); context?.setOpen(false); }}
    >
      {children}
    </button>
  );
}

function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-[#1F2937]" />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
