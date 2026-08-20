'use client';

import React from "react";
import {
  Car, DoorOpen, Fuel, Users, Luggage, Settings2, Settings,
  Gauge, Cog, Palette, Sparkles, Briefcase
} from "lucide-react";

export const CarSeat = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <span
    className={`inline-block bg-current ${className}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      maskImage: "url('/img/icons/chair.svg')",
      maskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskImage: "url('/img/icons/chair.svg')",
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      verticalAlign: "middle"
    }}
  />
);

export const AirConditionIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <span
    className={`inline-block bg-current ${className}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      maskImage: "url('/img/icons/air.png')",
      maskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskImage: "url('/img/icons/air.png')",
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      verticalAlign: "middle"
    }}
  />
);

export const SpecIcon = ({ name }: { name: string }) => {
  if (name === "Armchair") return <CarSeat size={14} />;
  if (name === "Wind") return <AirConditionIcon size={14} />;
  const icons: Record<string, any> = {
    DoorOpen, Fuel, Users, Luggage, Settings2, Gauge, Cog, Palette, Sparkles, Briefcase, Car
  };
  const Icon = icons[name] || Settings;
  return <Icon size={14} />;
};

export default SpecIcon;
