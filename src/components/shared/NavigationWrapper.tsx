"use client";

import { ReactNode } from "react";

interface NavigationWrapperProps {
  children: ReactNode;
}

// This component can be used to wrap navigation logic
// Currently serves as a placeholder for future navigation enhancements
export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  return <>{children}</>;
}
