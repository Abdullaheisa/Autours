import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MarketChartsProps {
  data: any[];
}

export function MarketCharts({ data }: MarketChartsProps) {
  if (!data || data.length === 0) return null;

  // Format data for Recharts
  const chartData = data.map(offer => ({
    name: `${offer.name} — ${offer.carName}`,
    supplier: offer.name,
    car: offer.carName,
    category: offer.category,
    Daily: offer.dailyPrice,
    Weekly: Math.round(offer.weeklyPrice / 7),
    Monthly: Math.round(offer.monthlyPrice / 30)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-sm">
          <p className="font-bold text-gray-900 mb-1">{data.supplier}</p>
          <p className="text-gray-600 mb-2">{data.car} ({data.category})</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 text-xs">
              <span className="text-gray-500" style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-semibold text-gray-900">{entry.value} AED</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Market Price Comparison (Daily Avg)</h3>
        <p className="text-xs text-gray-500">Compare daily equivalents across different rental periods</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6B7280' }} 
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: '#F3F4F6' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Daily" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Weekly" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Monthly" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
