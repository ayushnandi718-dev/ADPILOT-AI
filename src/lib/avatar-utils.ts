export const avatarGradients = [
  { from: "#7C3AED", to: "#A78BFA" },
  { from: "#EC4899", to: "#F472B6" },
  { from: "#3B82F6", to: "#60A5FA" },
  { from: "#10B981", to: "#34D399" },
  { from: "#F59E0B", to: "#FBBF24" },
  { from: "#EF4444", to: "#F87171" },
  { from: "#8B5CF6", to: "#C084FC" },
  { from: "#06B6D4", to: "#22D3EE" },
  { from: "#F97316", to: "#FB923C" },
  { from: "#84CC16", to: "#A3E635" },
  { from: "#14B8A6", to: "#2DD4BF" },
  { from: "#E11D48", to: "#FB7185" },
];

export function getAvatarGradientIndex(name: string | null | undefined, email?: string): number {
  const str = name || email || "user";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % avatarGradients.length;
}

export function getAvatarGradient(name: string | null | undefined, email?: string) {
  return avatarGradients[getAvatarGradientIndex(name, email)];
}

export function getInitials(name: string | null | undefined, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.map(n => n[0]).join("").slice(0, 2).toUpperCase();
  }
  return email?.charAt(0).toUpperCase() || "U";
}

export function getNextGradientIndex(currentIndex: number): number {
  return (currentIndex + 1) % avatarGradients.length;
}
