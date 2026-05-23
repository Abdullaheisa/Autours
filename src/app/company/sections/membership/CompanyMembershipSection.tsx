"use client";

import { Check, Crown, Zap, Shield, ArrowRight, Star, Clock, CreditCard } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { membershipPlans } from "@/lib/data";

export default function CompanyMembershipSection() {
  return (
    <SectionLayout>
      <PageHeader
        title="Membership"
        description="Select Membership"
        showAction={false}
      />

    <div className="p-8">

      {/* Active Supplier Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer shadow-sm">
          <Check size={18} strokeWidth={3} />
          <span>You are an active supplier</span>
        </div>
      </div>
    </div>

     </SectionLayout>
  );
}
