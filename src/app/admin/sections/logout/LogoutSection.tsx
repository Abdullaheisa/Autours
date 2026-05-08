"use client";

import { LogOut, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";

export default function LogoutSection() {
  return (
    <SectionLayout>
      <PageHeader title="Sign Out" description="Are you sure you want to sign out?" showAction={false} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-amber-600" size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Sign Out Confirmation</h3>
        <p className="text-sm text-gray-500 mt-2">You will be logged out of your admin account. Any unsaved changes will be lost.</p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-200 inline-flex items-center justify-center gap-2">
            <LogOut size={18} />
            Yes, Sign Out
          </button>
          <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </SectionLayout>
  );
}
