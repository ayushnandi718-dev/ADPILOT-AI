import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/20",
        success: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
        warning: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
        danger: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
        outline: "border border-[#1F2937] text-[#9CA3AF]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
