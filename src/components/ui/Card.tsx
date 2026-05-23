import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className, onClick, hover = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300",
        hover && "hover:shadow-lg hover:border-primary-200 hover:-translate-y-1",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
