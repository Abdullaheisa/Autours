import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-red-100 text-red-700 border-red-200",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-700 border-emerald-200",
        warning: "border-transparent bg-amber-100 text-amber-700 border-amber-200",
        info: "border-transparent bg-blue-100 text-blue-700 border-blue-200",
        purple: "border-transparent bg-purple-100 text-purple-700 border-purple-200",
        gray: "border-transparent bg-gray-100 text-gray-700 border-gray-200",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const dotVariants = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-red-500",
  info: "bg-blue-500",
  purple: "bg-purple-500",
  gray: "bg-gray-500",
  default: "bg-primary-foreground",
  secondary: "bg-secondary-foreground",
  outline: "bg-foreground",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;
}

function Badge({ className, variant, size, showDot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {showDot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          dotVariants[variant as keyof typeof dotVariants] || dotVariants.default
        )} />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
