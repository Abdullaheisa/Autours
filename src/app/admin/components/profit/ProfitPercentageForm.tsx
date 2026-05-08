"use client";

import { useState } from "react";
import { Save, Percent } from "lucide-react";

interface ProfitPercentage {
  days1_2: string;
  days3_7: string;
  days8_30: string;
  weekend: string;
}

interface ProfitPercentageFormProps {
  onSubmit: (percentages: ProfitPercentage) => void;
}

export default function ProfitPercentageForm({ onSubmit }: ProfitPercentageFormProps) {
  const [percentages, setPercentages] = useState<ProfitPercentage>({
    days1_2: "",
    days3_7: "",
    days8_30: "",
    weekend: "",
  });

  const handleChange = (field: keyof ProfitPercentage, value: string) => {
    if (value === "" || /^\d*$/.test(value)) {
      setPercentages((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    onSubmit(percentages);
  };

  const fields = [
    { label: "1-2 Day", field: "days1_2" as const, placeholder: "15" },
    { label: "3 - 7 Days", field: "days3_7" as const, placeholder: "12" },
    { label: "8-30 Days", field: "days8_30" as const, placeholder: "10" },
    { label: "Weekend", field: "weekend" as const, placeholder: "20" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Percent size={20} className="text-primary-600" />
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Profit Percentage</h3>
        <span className="text-xs text-gray-500">(Apply to all filtered vehicles)</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {fields.map((item) => (
          <div key={item.field}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{item.label}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder={item.placeholder}
                value={percentages[item.field]}
                onChange={(e) => handleChange(item.field, e.target.value)}
                className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 active:scale-95 flex items-center gap-2"
        >
          <Save size={16} />
          Submit
        </button>
      </div>
    </div>
  );
}
