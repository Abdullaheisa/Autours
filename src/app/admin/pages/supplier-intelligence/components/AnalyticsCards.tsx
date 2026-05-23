import { TrendingDown, TrendingUp, DollarSign, Building2, Car } from "lucide-react";

interface AnalyticsCardsProps {
  stats: any;
}

export function AnalyticsCards({ stats }: AnalyticsCardsProps) {
  if (!stats) return null;

  const cards = [
    {
      title: "Average Market Price",
      value: `${stats.averagePrice} AED/day`,
      subtitle: "Across all suppliers",
      icon: DollarSign,
      trend: "up",
      color: "blue"
    },
    {
      title: "Lowest Available Price",
      value: `${stats.lowestPrice} AED/day`,
      subtitle: `By ${stats.cheapestSupplier}`,
      icon: TrendingDown,
      trend: "down",
      color: "green"
    },
    {
      title: "Highest Market Price",
      value: `${stats.highestPrice} AED/day`,
      subtitle: `By ${stats.expensiveSupplier}`,
      icon: TrendingUp,
      trend: "up",
      color: "red"
    },
    {
      title: "Market Coverage",
      value: stats.totalSuppliers,
      subtitle: `${stats.totalCars} cars compared`,
      icon: Building2,
      trend: "neutral",
      color: "purple"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-${card.color}-50 text-${card.color}-600 shrink-0`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
              <h4 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h4>
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
