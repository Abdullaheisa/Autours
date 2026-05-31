"use client";

import { useState, useEffect } from "react";
import { Plus, X, Check, Settings2, ChevronDown, XCircle } from "lucide-react";
import { Specification } from "./SpecificationsTable";

const availableIcons = [
  { value: "Gauge", label: "Gauge" },
  { value: "Fuel", label: "Fuel" },
  { value: "Users", label: "Users" },
  { value: "Briefcase", label: "Briefcase" },
  { value: "Settings2", label: "Settings" },
  { value: "Car", label: "Car" },
  { value: "Wind", label: "Air Condition" },
  { value: "DoorOpen", label: "Doors" },
  { value: "Luggage", label: "Suitcase" },
  { value: "Armchair", label: "Seats" },
];

const iconNameMap: Record<string, string> = {
  "🎨": "Palette",
  "⚙️": "Cog",
  "🚪": "DoorOpen",
  "👥": "Users",
  "⛽": "Fuel",
  "🆕": "Sparkles",
  "Color": "Palette",
  "Gearbox": "Cog",
  "Doors": "DoorOpen",
  "Seats": "Users",
  "Fuel": "Fuel",
  "Fuel Type": "Fuel",
  "Condition": "Sparkles",
  "Air Conditioner": "Wind",
  "Suitcase": "Luggage",
  "Transmission": "Settings2",
};

interface SpecificationFormProps {
  onSubmit: (id: number | null, name: string, options: string[], icon: string) => void;
  initialData?: Specification | null;
  onCancel?: () => void;
}

export default function SpecificationForm({ onSubmit, initialData, onCancel }: SpecificationFormProps) {
  const [name, setName] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setOptions(initialData.options || []);
      const rawIcon = initialData.icon || "";
      const normalizedIcon = iconNameMap[rawIcon] || rawIcon;
      setSelectedIcon(normalizedIcon);
    } else {
      setName("");
      setOptions([]);
      setSelectedIcon("");
    }
  }, [initialData]);

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions((prev) => [...prev, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleSubmit = () => {
    if (name.trim() && options.length > 0 && selectedIcon) {
      onSubmit(initialData ? initialData.id : null, name.trim(), options, selectedIcon);
      if (!initialData) {
        setName("");
        setOptions([]);
        setSelectedIcon("");
      }
    }
  };

  const isValid = name.trim() && options.length > 0 && selectedIcon;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 lg:p-6 mb-6">
      {initialData && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-900">Edit Specification</h3>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Specification Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specification Name
          </label>
          <input
            type="text"
            placeholder="e.g. Air Conditioner"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Specification Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specification Options
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="+ New Option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleAddOption}
              disabled={!newOption.trim()}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {/* Options Tags */}
          {options.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {options.map((opt, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium"
                >
                  {opt}
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="hover:text-primary-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Select Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Icon
          </label>
          <div className="relative">
            <select
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
              className="appearance-none w-full px-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Select</option>
              {availableIcons.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-5 flex justify-end gap-3">
        {initialData && onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200 flex items-center gap-2"
        >
          <Check size={16} />
          {initialData ? "Update" : "Submit"}
        </button>
      </div>
    </div>
  );
}
