'use client';

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  options?: SelectFieldOption[];
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOpen((p) => !p);
            setSearchQuery("");
          }}
          className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl text-sm transition-all text-left
            ${open ? "border-primary-500 ring-2 ring-primary-500/10 bg-white" : "border-gray-200"}
            ${value ? "text-gray-900 font-medium" : "text-gray-400"}
          `}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100 flex items-center gap-2">
              <Search size={14} className="text-gray-400 shrink-0 ml-1" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onChange?.("");
                  setOpen(false);
                  setSearchQuery("");
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold border-b border-gray-50 text-gray-400 hover:bg-gray-50"
              >
                Clear selection
              </button>

              {filteredOptions.length === 0 ? (
                <div className="px-4 py-4 text-center text-xs text-gray-400">
                  No results found
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange?.(opt.value);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors block truncate
                      ${
                        value === opt.value
                          ? "bg-primary-50 text-primary-700 font-bold"
                          : "text-gray-700 hover:bg-gray-50 font-medium"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectField;
