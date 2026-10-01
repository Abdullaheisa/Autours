"use client";

import React from "react";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  className = "",
  ariaLabel = "Toggle",
}: ToggleSwitchProps) {
  const isSm = size === "sm";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
        isSm ? "h-5 w-9" : "h-6 w-11"
      } ${checked ? "bg-emerald-500" : "bg-gray-200"} ${className}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ${
          isSm ? "h-3.5 w-3.5" : "h-4 w-4"
        } ${checked ? (isSm ? "translate-x-4" : "translate-x-6") : (isSm ? "translate-x-0.5" : "translate-x-1")}`}
      />
    </button>
  );
}
