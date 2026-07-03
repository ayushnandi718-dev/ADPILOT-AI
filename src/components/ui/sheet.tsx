"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function Sheet({ children, open, onOpenChange }: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <SheetContext.Provider value={{ open: isOpen, onOpenChange: setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(SheetContext);
  return <div onClick={() => context?.onOpenChange(true)}>{children}</div>;
}

const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: 'left' | 'right' }>(
  ({ className, children, side = 'right', ...props }, ref) => {
    const context = React.useContext(SheetContext);
    if (!context?.open) return null;

    const sideClasses = side === 'left' ? 'left-0' : 'right-0';

    return (
      <div className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => context.onOpenChange(false)} />
        <div
          ref={ref}
          className={cn(
            "fixed top-0 bottom-0 z-50 w-full max-w-md border-l border-[#1F2937] bg-[#111827] p-6 shadow-2xl",
            sideClasses,
            "animate-in slide-in-from-right duration-300",
            className
          )}
          {...props}
        >
          <button
            onClick={() => context.onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 text-[#9CA3AF] hover:text-[#FAFAFA]"
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      </div>
    );
  }
);
SheetContent.displayName = "SheetContent";

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 mb-6", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-[#FAFAFA]", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle };
