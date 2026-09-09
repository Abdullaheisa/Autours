"use client";

import { useState } from "react";
import { Save, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { companyApi } from "@/services/api";

interface CompanyDetailsIntegrationProps {
  company: any;
  onUpdate: (updatedCompany: any) => void;
}

export default function CompanyDetailsIntegration({ company, onUpdate }: CompanyDetailsIntegrationProps) {
  const [loading, setLoading] = useState(false);
  
  const [integration, setIntegration] = useState(company.integration === 1 || company.integration === true);
  const [integrationType, setIntegrationType] = useState(company.integration_type || "");
  const [apiKey, setApiKey] = useState(company.api_key || "");
  const [apiPassword, setApiPassword] = useState("");

  const INTEGRATION_TYPES = [
    { value: "", label: "None" },
    { value: "usave", label: "U-Save" },
    { value: "greenmotion", label: "Green Motion" },
    { value: "kolaycar", label: "Kolaycar" },
    { value: "nissa", label: "Nissa" },
    { value: "emr", label: "EMR" },
    { value: "renteon", label: "Renteon" },
    { value: "rently", label: "Rently" },
    { value: "xdrive", label: "XDrive" },
    { value: "northcar", label: "Northcar" },
    { value: "surprice", label: "Surprice" },
    { value: "wheelsys", label: "Wheelsys" },
  ];

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload: any = {
        integration: integration,
        integration_type: integrationType,
        api_key: apiKey,
      };

      if (apiPassword) {
        payload.api_password = apiPassword;
      }

      const response = await companyApi.updateIntegration(company.id, payload);
      
      toast.success("Integration settings updated successfully");
      
      // Update local company state
      onUpdate({
        ...company,
        integration: payload.integration,
        integration_type: payload.integration_type,
        api_key: payload.api_key,
      });
      
      setApiPassword(""); // clear password field after save
    } catch (error: any) {
      console.error("Error updating integration:", error);
      toast.error(error?.response?.data?.message || "Failed to update integration settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="text-lg font-bold text-gray-900">API Integration Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Manage API credentials and synchronization flags</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={integration}
                onChange={(e) => setIntegration(e.target.checked)}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${integration ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${integration ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {integration ? 'Integration Active' : 'Integration Disabled'}
            </span>
          </label>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {integration && !integrationType && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm">You have enabled integration but haven't selected an integration type. Select a provider below.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Integration Provider</label>
            <select
              value={integrationType}
              onChange={(e) => setIntegrationType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50 hover:bg-gray-100/50"
            >
              {INTEGRATION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">API Key / Username</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. USuat@2026!"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">API Password / Secret</label>
            <input
              type="password"
              value={apiPassword}
              onChange={(e) => setApiPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Only fill this if you need to update the password.</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-200 disabled:opacity-70"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Integration Settings
          </button>
        </div>
      </div>
    </div>
  );
}
