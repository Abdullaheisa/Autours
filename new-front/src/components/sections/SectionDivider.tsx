'use client';

interface SectionDividerProps {
  height?: number; // pixels
  color?: string;
  className?: string;
}

export default function SectionDivider({
  height = 10,
  color = '#0f172a', // dark navy/slate-900
  className = '',
}: SectionDividerProps) {
  return (
    <div
      className={`w-full h-[3px] sm:h-[6px] md:h-[10px] ${className}`}
      style={{
        backgroundColor: color,
      }}
    />
  );
}