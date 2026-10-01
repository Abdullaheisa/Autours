"use client";

import React, { useMemo } from "react";
import CustomSelect, { CustomSelectOption } from "./CustomSelect";
import { CURRENCIES, getCurrencyItem } from "@/constants/currencies";

export interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function CurrencySelect({
  value,
  onChange,
  className = "",
  placeholder = "Select Currency",
}: CurrencySelectProps) {
  const options: CustomSelectOption[] = useMemo(
    () =>
      CURRENCIES.map((c) => ({
        value: c.code,
        label: `${c.code} (${c.symbol})`,
        sublabel: c.name,
        flag: c.flag,
      })),
    []
  );

  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchable
      className={className}
    />
  );
}
