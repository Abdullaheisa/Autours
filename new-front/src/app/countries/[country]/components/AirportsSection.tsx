import { CountryPageData } from '@/data/countryPages';
import { MapPin, Plane, ArrowRight } from 'lucide-react';

interface Props {
  name: string;
  airports: CountryPageData['airports'];
}

export default function AirportsSection({ name, airports }: Props) {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50/50" id="airports">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-black text-xs font-black uppercase tracking-wider mb-3">
              <Plane className="w-3.5 h-3.5" />
              Browse by Airport
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase italic font-title">
              Popular {name} Airport Pickup Locations
            </h2>
          </div>
          <a 
            className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black/80 hover:text-black transition-colors border-b-2 border-primary pb-1" 
            href="#"
          >
            Search all {name} airports
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Airport Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {airports.map((airport, idx) => (
            <article 
              key={idx} 
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/40 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full"
            >
              {/* Thumbnail Container */}
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={airport.image} 
                  alt={airport.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Black Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Airport Code Badge */}
                <div className="absolute left-6 top-6 z-10 bg-primary text-black px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md">
                  {airport.code}
                </div>

                {/* Meta details over overlay */}
                <div className="absolute left-6 bottom-6 right-6 z-10 text-white">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
                    <MapPin className="w-3 h-3" />
                    {airport.location}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-tight uppercase italic font-title mt-1.5">
                    {airport.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                  {airport.description}
                </p>
                
                {/* Footer block */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Starting From</span>
                    <span className="text-base font-extrabold text-gray-800">AED {airport.minPrice}/day</span>
                  </div>
                  <button className="btn-primary px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-black flex items-center gap-2 group-hover:scale-105 transition-all">
                    View Cars
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
