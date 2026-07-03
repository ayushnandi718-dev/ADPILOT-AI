"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getAvatarGradientIndex, getInitials, avatarGradients } from "@/lib/avatar-utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  name?: string | null;
  email?: string;
  gradientIndex?: number;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-16 w-16 text-2xl",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, name, email, gradientIndex, size = "md", ...props }, ref) => {
  const [error, setError] = React.useState(false);

  const gradientIdx = React.useMemo(() => {
    if (gradientIndex !== undefined) return gradientIndex;
    if (src?.startsWith("gradient:")) {
      const idx = parseInt(src.split(":")[1], 10);
      if (!isNaN(idx) && idx >= 0 && idx < avatarGradients.length) return idx;
    }
    return getAvatarGradientIndex(name, email);
  }, [gradientIndex, src, name, email]);

  const gradient = avatarGradients[gradientIdx];
  const initials = fallback || getInitials(name, email);
  const isGradientAvatar = src?.startsWith("gradient:");

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full select-none",
        sizeMap[size],
        className
      )}
      {...props}
    >
      {src && !error && !isGradientAvatar ? (
        <Image
          src={src}
          alt={alt || ""}
          width={64}
          height={64}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
          <div
            className="flex h-full w-full items-center justify-center font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            }}
          >
            {initials}
          </div>
        )}
        <div className="absolute inset-0 rounded-full ring-1 ring-white/10 ring-inset" />
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar, avatarGradients };
