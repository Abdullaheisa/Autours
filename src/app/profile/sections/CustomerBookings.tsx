"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { rentalApi, bookingApi } from "@/services/api";
import { axiosClient } from "@/services/api/axiosClient";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import { formatPrice } from "@/utils/currency";
import toast from 'react-hot-toast';
import { Download, XCircle, RotateCcw, Star, Calendar, MapPin, AlertCircle } from "lucide-react";
import ReviewModal from "../components/ReviewModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLocationDisplayLabel, getLocationPickupValue } from "@/utils/location";

export default function CustomerBookings() {
  const { user: sessionUser } = useSelector((state: RootState) => state.auth);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [reviewRentalId, setReviewRentalId] = useState<number | null>(null);
  
  // Custom Confirmation Modal States
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [fareConfirmId, setFareConfirmId] = useState<number | null>(null);

  const router = useRouter();

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res: any = await rentalApi.getAll();
      const allRentals = res?.rentals || res?.data?.rentals || [];
      // Backend returns all rentals if user is customer, so filter locally:
      const userRentals = allRentals.filter(
        (r: any) => String(r.customer_id) === String(sessionUser?.id)
      );
      setRentals(userRentals);
    } catch (error) {
      console.error("Failed to fetch rentals:", error);
      toast.error("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionUser?.id) {
      fetchRentals();
    }
  }, [sessionUser]);

  // Execute cancel operation
  const executeCancel = async (rentalId: number, fareApproval: boolean = false) => {
    try {
      setCancellingId(rentalId);
      await bookingApi.cancel({ id: rentalId, fareApproval });
      toast.success("Booking cancelled successfully.");
      setCancelConfirmId(null);
      setFareConfirmId(null);
      fetchRentals();
    } catch (error: any) {
      console.log("CANCEL 403 DATA:", error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || "Failed to cancel booking.";
      
      // If error status is 403, assume cancellation fare fee applies and open Fare Modal (without toast error)
      if (error.response?.status === 403) {
        setCancelConfirmId(null);
        setFareConfirmId(rentalId);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadInvoice = async (rentalId: number) => {
    try {
      toast("Downloading invoice...", { icon: 'ℹ️' });
      const response = await axiosClient.get(`/invoice/booking/${rentalId}`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${rentalId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download invoice.");
    }
  };

  const handleBookAgain = (rental: any) => {
    // Re-book with the same location starting from today to 3 days later
    const today = new Date();
    const startStr = today.toISOString().split('T')[0];
    const threeDaysLater = new Date(today.setDate(today.getDate() + 3));
    const endStr = threeDaysLater.toISOString().split('T')[0];
    
    const branch = rental.vehicle?.branch;
    const pickupVal = branch ? getLocationPickupValue(branch) : (rental.vehicle?.pickup_loc || "");
    const displayVal = branch ? getLocationDisplayLabel(branch) : (rental.vehicle?.pickup_loc || "");
    
    router.push(`/search?location=${encodeURIComponent(pickupVal)}&locationLabel=${encodeURIComponent(displayVal)}&start=${startStr}&end=${endStr}`);
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return "bg-yellow-100 text-yellow-800"; // PENDING
      case 2: return "bg-green-100 text-green-800"; // CONFIRMED
      case 3: return "bg-red-100 text-red-800"; // CANCELED
      case 4: return "bg-blue-100 text-blue-800"; // IN_PROGRESS
      case 5: return "bg-gray-100 text-gray-800"; // FINISHED
      case 6: return "bg-orange-100 text-orange-800"; // NO_SHOW
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading your bookings...</p>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-gray-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
        <p className="text-gray-500 mb-6">Looks like you haven't made any car rentals with us.</p>
        <Link 
          href="/" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 active:scale-95"
        >
          Book a Car Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rentals.map((rental) => {
        const v = rental.vehicle;
        const statusId = rental.order_status;
        const normalizedStatus = Number(statusId);
        const statusName = rental.status?.name_en || "Unknown";
        
        // Ensure rates exist
        const hasRated = !!rental.rate;

        // Eligibility logic: Confirmed (2) or Reconciled/Completed (7) and end_date in the past
        const isPast = rental.end_date ? new Date(rental.end_date) < new Date() : false;

        return (
          <div key={rental.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/4 h-48 md:h-auto bg-gray-100 relative">
              <img
                src={getVehicleImageUrl(v.photo)}
                alt={v.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(normalizedStatus)}`}>
                  {statusName}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{v.name} <span className="text-sm font-normal text-gray-500">or similar</span></h3>
                    <p className="text-gray-500 text-sm mt-1">Order #{rental.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      {formatPrice(rental.price, rental.currency)}
                    </p>
                    <p className="text-xs text-gray-500">Total Price</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pick-up</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {v.branch ? getLocationDisplayLabel(v.branch) : `${v.branch?.address || ''}, ${v.branch?.city || ''}`}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mt-1">{rental.start_date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Drop-off</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {v.branch ? getLocationDisplayLabel(v.branch) : `${v.branch?.address || ''}, ${v.branch?.city || ''}`}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mt-1">{rental.end_date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleDownloadInvoice(rental.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Download size={16} />
                  Invoice
                </button>
                <button
                  onClick={() => handleBookAgain(rental)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <RotateCcw size={16} />
                  Book Again
                </button>

                {/* Status 2 (Confirmed) or 7 (Reconciled/Completed) */}
                {(Number(statusId) === 2 || Number(statusId) === 7) && !hasRated && (
                  isPast ? (
                    <button
                      onClick={() => setReviewRentalId(rental.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                    >
                      <Star size={16} />
                      Leave a Review
                    </button>
                  ) : (
                    <button
                      disabled
                      title="You can leave a review after your rental period ends."
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-xl cursor-not-allowed shadow-none"
                    >
                      <Star size={16} />
                      Leave a Review
                    </button>
                  )
                )}

                {hasRated && (
                  <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-xl">
                    <Star size={16} className="fill-green-600" />
                    Reviewed ({parseFloat(rental.rate).toFixed(1)}/5)
                  </div>
                )}

                {/* Cancel button shows if status is pending (1, 4, 6) or status text contains "pending" */}
                {((normalizedStatus === 1 || normalizedStatus === 4 || normalizedStatus === 6) || 
                  String(statusName).toLowerCase().includes("pending")) && (
                  <button
                    onClick={() => setCancelConfirmId(rental.id)}
                    disabled={cancellingId === rental.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors ml-auto disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    {cancellingId === rental.id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Cancel Confirmation Modal */}
      {cancelConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 border border-gray-100">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle size={28} className="stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
                <p className="text-sm text-gray-500 px-4">
                  Are you sure you want to cancel this booking? This action will immediately terminate your reservation.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 py-3 text-xs font-black uppercase tracking-wider text-gray-700 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all rounded-xl border border-gray-200"
              >
                No, Keep It
              </button>
              <button
                onClick={() => executeCancel(cancelConfirmId, false)}
                disabled={cancellingId === cancelConfirmId}
                className="flex-1 py-3 text-xs font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all rounded-xl shadow-lg shadow-red-200 disabled:opacity-50"
              >
                {cancellingId === cancelConfirmId ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Fare Approval Modal */}
      {fareConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 border border-gray-100">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={28} className="stroke-[1.75] text-amber-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">Cancellation Fee Applies</h3>
                <p className="text-sm text-gray-500 px-4">
                  A cancellation fee applies to this booking. Do you agree to proceed?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setFareConfirmId(null)}
                className="flex-1 py-3 text-xs font-black uppercase tracking-wider text-gray-700 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all rounded-xl border border-gray-200"
              >
                No, Go Back
              </button>
              <button
                onClick={() => executeCancel(fareConfirmId, true)}
                disabled={cancellingId === fareConfirmId}
                className="flex-1 py-3 text-xs font-black uppercase tracking-wider text-white bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all rounded-xl shadow-lg shadow-primary-200 disabled:opacity-50"
              >
                Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewRentalId && (
        <ReviewModal
          rentalId={reviewRentalId}
          onClose={() => setReviewRentalId(null)}
          onSuccess={() => {
            setReviewRentalId(null);
            fetchRentals();
          }}
        />
      )}
    </div>
  );
}
