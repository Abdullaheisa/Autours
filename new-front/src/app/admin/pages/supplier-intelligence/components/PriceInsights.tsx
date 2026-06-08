import { Lightbulb } from "lucide-react";

interface PriceInsightsProps {
  insights: string[];
}

export function PriceInsights({ insights }: PriceInsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-sm border border-primary-100 h-full p-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Lightbulb size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Smart Insights</h3>
          <p className="text-xs text-gray-500">AI-driven pricing analysis</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
