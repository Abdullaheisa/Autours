import { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Target, Flag } from "lucide-react";
import Image from "next/image";
import { SupplierComparison } from "@/data/supplierAnalytics";

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierComparison | null;
  onSave: (payload: Partial<SupplierComparison>) => void;
}

const statuses = [
  { id: "interested", label: "Interested" },
  { id: "contacted", label: "Contacted" },
  { id: "negotiating", label: "Negotiating" },
  { id: "deal closed", label: "Deal Closed" },
  { id: "rejected", label: "Rejected" },
  { id: "maybe later", label: "Maybe Later" },
];

export function NegotiationModal({ isOpen, onClose, supplier, onSave }: NegotiationModalProps) {
  const [formData, setFormData] = useState<Partial<SupplierComparison>>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        negotiationStatus: supplier.negotiationStatus !== "none" ? supplier.negotiationStatus : undefined,
        notes: supplier.notes || "",
        negotiatedPrice: supplier.negotiatedPrice || undefined,
        targetPrice: supplier.targetPrice || undefined,
        priority: supplier.priority || undefined,
        followUpDate: supplier.followUpDate || "",
      });
    }
  }, [supplier]);

  if (!isOpen || !supplier) return null;

  const handleChange = (key: keyof SupplierComparison, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">CRM & Negotiation Notes</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Supplier Mini Profile */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <Image src={supplier.logo} alt={supplier.name} width={48} height={48} className="object-contain" />
            <div>
              <h4 className="font-bold text-gray-900">{supplier.name} • {supplier.carName}</h4>
              <p className="text-sm text-gray-500">Current Offer: <span className="font-semibold text-gray-900">{supplier.dailyPrice} AED</span>/day</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Notes Section - Prioritized */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Notes</label>
              <textarea
                rows={4}
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Write flexible CRM notes, call summaries, or reminders here..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Optional Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Price (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">AED</span>
                  <input 
                    type="number"
                    value={formData.targetPrice || ""}
                    onChange={(e) => handleChange("targetPrice", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Negotiated (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">AED</span>
                  <input 
                    type="number"
                    value={formData.negotiatedPrice || ""}
                    onChange={(e) => handleChange("negotiatedPrice", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Optional Status / Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status (Optional)</label>
                <select 
                  value={formData.negotiationStatus || ""}
                  onChange={(e) => handleChange("negotiationStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  <option value="">No Status</option>
                  {statuses.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Follow-up (Optional)</label>
                <input 
                  type="date"
                  value={formData.followUpDate || ""}
                  onChange={(e) => handleChange("followUpDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
