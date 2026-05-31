"use client";

import { useEffect, useState } from "react";
import { Check, Clock, ShieldAlert, Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { supplierApi } from "@/services/api/supplierApi";
import { authApi } from "@/services/api";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { updateUser } from "@/store/slices/authSlice";
import { normalizeAuthRole } from "@/utils/auth";
import toast from "react-hot-toast";

export default function CompanyMembershipSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const res = (await authApi.getUser()) as any;
      if (res) {
        dispatch(updateUser({
          id: res.id?.toString() || '1',
          name: res.user_name || res.name || '',
          email: res.email || '',
          role: normalizeAuthRole(res.role || 'supplier'),
          status: res.role || 'supplier',
          avatar: res.logo || res.company_logo || res.photo || res.avatar || undefined,
          logo: res.logo || res.company_logo || res.photo || res.avatar || undefined,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch user role:", err);
      toast.error("Failed to fetch membership status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await supplierApi.requestMembership();
      toast.success("Membership upgrade requested successfully!");
      await fetchRole();
    } catch (err: any) {
      console.error("Membership upgrade request failed:", err);
      toast.error(err.message || "Failed to request membership upgrade.");
    } finally {
      setRequesting(false);
    }
  };

  const role = user?.status || 'supplier';

  return (
    <SectionLayout>
      <PageHeader
        title="Membership & Account Activation"
        description="View your current supplier membership and activation status"
        showAction={false}
      />

      <div className="max-w-xl mx-auto mt-12">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
            {loading ? (
              <Loader2 className="animate-spin" size={28} />
            ) : role === "active_supplier" ? (
              <Check size={28} strokeWidth={3} className="text-emerald-600" />
            ) : role === "under_review" ? (
              <Clock size={28} className="text-amber-500 animate-pulse" />
            ) : (
              <ShieldAlert size={28} className="text-red-500" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Account Status</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {loading ? (
                "Loading your account details..."
              ) : role === "active_supplier" ? (
                "Congratulations! Your account is fully active and verified. You have full access to list your fleet and accept bookings."
              ) : role === "under_review" ? (
                "Your account is currently under review by our administration. We will notify you as soon as your account is approved."
              ) : (
                "Your account is currently inactive. You must request activation to start listing your vehicles."
              )}
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold">
                <Loader2 size={16} className="animate-spin" />
                Retrieving Status...
              </div>
            ) : role === "active_supplier" ? (
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-8 py-3.5 rounded-xl font-bold shadow-sm">
                <Check size={18} strokeWidth={3} />
                <span>You are an active supplier</span>
              </div>
            ) : role === "under_review" ? (
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-8 py-3.5 rounded-xl font-bold shadow-sm">
                <Clock size={18} />
                <span>Account Under Review</span>
              </div>
            ) : (
              <button
                onClick={handleRequest}
                disabled={requesting}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {requesting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  "Request Account Activation"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
