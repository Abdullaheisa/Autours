'use client';

export default function CarCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-300/50 overflow-hidden w-full animate-pulse">
      <div className="flex flex-col md:flex-row">
        {/* Left: Image Column */}
        <div className="w-full md:w-[240px] shrink-0 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/30 flex flex-col items-center">
          <div className="p-4 w-full flex flex-col items-center flex-1">
             <div className="w-full aspect-[16/10] bg-gray-200 rounded-xl mb-4" />
             <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
          <div className="w-full px-4 pb-3 border-t border-gray-100 pt-2 space-y-1 text-center">
             <div className="h-2 w-16 bg-gray-200 rounded mx-auto" />
             <div className="h-6 w-24 bg-gray-200 rounded mx-auto" />
          </div>
          <div className="w-full px-4 pb-4">
             <div className="w-full h-10 bg-gray-200 rounded-xl" />
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex-1 p-5 flex flex-col space-y-4">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-gray-200 rounded-lg" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-lg" />
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 bg-gray-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded" />
          </div>

          <div className="space-y-3">
             <div className="h-3 w-28 bg-gray-200 rounded" />
             <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
