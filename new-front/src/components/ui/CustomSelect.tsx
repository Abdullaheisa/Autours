"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  flag?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  allowClear?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  searchable = false,
  className = "",
  allowClear = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, searchable]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(q)) ||
        o.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all text-left cursor-pointer ${
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : isOpen
            ? "bg-white border-primary ring-2 ring-primary/20 shadow-sm"
            : "bg-white border-gray-200 hover:border-gray-300 text-gray-800 hover:bg-gray-50/50"
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.flag && (
            <img
              src={`https://flagcdn.com/w40/${selectedOption.flag.toLowerCase()}.png`}
              alt=""
              className="w-4 h-3 object-cover rounded shadow-xs shrink-0"
            />
          )}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          {selectedOption ? (
            <span className="font-bold text-gray-900">{selectedOption.label}</span>
          ) : (
            <span className="text-gray-400 font-normal">{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {allowClear && selectedOption && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {searchable && (
            <div className="p-2 border-b border-gray-100 bg-gray-50/60">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-primary text-gray-800"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-gray-50 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400 font-medium">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                      isSelected
                        ? "bg-primary/15 text-gray-900 font-black"
                        : "text-gray-700 hover:bg-gray-100/70"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.flag && (
                        <img
                          src={`https://flagcdn.com/w40/${opt.flag.toLowerCase()}.png`}
                          alt=""
                          className="w-4 h-3 object-cover rounded shadow-xs shrink-0"
                        />
                      )}
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-gray-400 font-normal">({opt.sublabel})</span>
                      )}
                    </span>
                    {isSelected && <Check size={13} className="text-gray-900 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
