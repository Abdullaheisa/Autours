import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export default function Input({
  label,
  error,
  icon: Icon,
  helperText,
  className = "",
  ...props
}: InputProps) {
  const inputClass = [
    "w-full px-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
    Icon ? "pl-11" : "",
    error ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 hover:border-gray-300",
    className,
  ].join(" ");

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
          />
        )}
        <input className={inputClass} {...props} />
      </div>
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[10px] text-gray-400 font-medium">{helperText}</p>}
    </div>
  );
}
