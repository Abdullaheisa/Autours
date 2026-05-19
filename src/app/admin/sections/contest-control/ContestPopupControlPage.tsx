import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchContestSettings, fetchRegistrations, updateContestSettings, resetCampaign } from "@/store/slices/contestSlice";
import { ContestApi } from "@/services/contest/contest.api";
import { Gift, Trash2, Power, EyeOff, RotateCcw, Download, Search, Mail, Phone, RefreshCw } from "lucide-react";

export default function ContestPopupControlPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { enabled, campaignVersion, forceInteraction, registrations, loading } = useSelector(
    (state: RootState) => state.contest
  );

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchContestSettings());
    dispatch(fetchRegistrations());
  }, [dispatch]);

  const filteredRegistrations = registrations.filter((reg) =>
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone.includes(searchTerm)
  );

  const exportToExcel = async () => {
    try {
      await ContestApi.exportRegistrationsToExcel(filteredRegistrations, campaignVersion);
    } catch (e) {
      console.error("Failed to export", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-xl font-bold text-gray-900">{enabled ? 'Active' : 'Disabled'}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(updateContestSettings({ enabled: !enabled }))}
            disabled={loading}
            className={`p-3 rounded-xl transition-colors disabled:opacity-50 ${
              enabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Power size={20} />}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Campaign Version</p>
            <p className="text-xl font-bold text-gray-900">v{campaignVersion}</p>
          </div>
          <button
            onClick={() => {
              if(confirm("Are you sure? This will force the popup to appear again for ALL users.")) {
                dispatch(resetCampaign());
              }
            }}
            className="p-3 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-colors"
            title="Reset Campaign Version"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Total Registrations</p>
            <p className="text-xl font-bold text-gray-900">{registrations.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Gift size={20} />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Popup Behavior Settings</h3>
        <div className="flex items-center justify-between max-w-xl p-4 border border-gray-100 rounded-xl bg-gray-50/50">
          <div>
            <p className="font-semibold text-gray-900">Force Interaction</p>
            <p className="text-sm text-gray-500">If enabled, users cannot close the popup without registering.</p>
          </div>
          <button
            onClick={() => dispatch(updateContestSettings({ forceInteraction: !forceInteraction }))}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
              forceInteraction ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              forceInteraction ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-gray-900 rounded-xl text-sm font-semibold hover:bg-primary-600 shadow-md shadow-primary/20 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No registrations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {reg.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400"/> {reg.email}</span>
                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400"/> {reg.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {reg.country || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(reg.date).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
