import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

const variants: Record<string, string> = {
  primary: "bg-primary text-gray-900 hover:bg-primary-600 shadow-lg shadow-primary/20",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100",
  success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100",
  warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-100",
  outline: "border border-gray-200 text-gray-700 hover:bg-gray-50",
  ghost: "text-gray-500 hover:bg-gray-100",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-3.5 text-base rounded-2xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = [
    "inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95",
    "disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  ].join(" ");

  return (
    <button className={baseClasses} disabled={loading} {...props}>
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 18} />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 18} />}
    </button>
  );
}
