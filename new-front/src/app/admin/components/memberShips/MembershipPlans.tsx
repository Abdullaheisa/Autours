"use client";

import { CheckCircle2, Star, Crown } from "lucide-react";

export interface MembershipPlan {
  id: number;
  name: string;
  price: number;
  period: string;
  features: string[];
  active: boolean;
  subscribers: number;
  popular?: boolean;
}

interface MembershipPlansProps {
  plans: MembershipPlan[];
  onEdit: (id: number) => void;
  onViewSubscribers: (id: number) => void;
}

export default function MembershipPlans({ plans, onEdit, onViewSubscribers }: MembershipPlansProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`group bg-white rounded-2xl border-2 shadow-sm p-6 relative transition-all duration-300 hover:shadow-lg ${
            plan.popular ? "border-primary-500" : "border-gray-200 hover:border-primary-200"
          }`}
        >
          {/* Popular Badge */}
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
              <div className="flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                Most Popular
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
              plan.popular ? "bg-primary-100" : "bg-gray-100"
            }`}>
              <Crown size={24} className={plan.popular ? "text-primary-600" : "text-gray-400"} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
              <span className="text-sm text-gray-500">/{plan.period}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{plan.subscribers} active subscribers</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  plan.popular ? "bg-primary-50" : "bg-gray-50"
                }`}>
                  <CheckCircle2 size={12} className={plan.popular ? "text-primary-600" : "text-emerald-500"} />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(plan.id)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                plan.popular
                  ? "text-primary-700 bg-primary-50 hover:bg-primary-100"
                  : "text-gray-700 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              Edit Plan
            </button>
            <button
              onClick={() => onViewSubscribers(plan.id)}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Subscribers
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
