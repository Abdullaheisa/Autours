"use client";

import { useState, useEffect } from "react";
import { rateApi } from "@/services/api";
import toast from 'react-hot-toast';
import { X, Star } from "lucide-react";

interface ReviewModalProps {
  rentalId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ rentalId, onClose, onSuccess }: ReviewModalProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [rates, setRates] = useState<number[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res: any = await rateApi.getQuestions(rentalId);
        const questionsList = res?.data?.questions || res?.questions;
        if (questionsList && Array.isArray(questionsList)) {
          setQuestions(questionsList);
          setRates(new Array(questionsList.length).fill(0));
        } else {
          console.warn("No questions array found in response:", res);
        }
      } catch (error) {
        toast.error("Failed to load rating questions.");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [rentalId, onClose]);

  const handleRate = (index: number, rating: number) => {
    const newRates = [...rates];
    newRates[index] = rating;
    setRates(newRates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rates.includes(0)) {
      toast.error("Please provide a rating for all questions.");
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment && trimmedComment.length < 10) {
      toast.error("Comments must be at least 10 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      await rateApi.submit({
        id: rentalId,
        rates,
        comment: trimmedComment || undefined,
      });
      toast.success("Thank you for your review!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <form id="review-form" onSubmit={handleSubmit} className="space-y-6">
              {questions.map((q, index) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {q.question || q.question_en}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRate(index, star)}
                        className={`p-1 transition-transform hover:scale-110 focus:outline-none`}
                      >
                        <Star
                          size={28}
                          className={`${
                            rates[index] >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  rows={4}
                  placeholder="Tell us more about your experience..."
                />
              </div>
            </form>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="review-form"
            disabled={loading || submitting}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
