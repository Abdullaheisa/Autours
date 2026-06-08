import { CountryPageData } from '@/data/countryPages';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  gallery: CountryPageData['gallery'];
}

export default function FleetGallerySection({ gallery }: Props) {
  return (
    <section className="py-24 bg-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-black text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Our Fleet
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase italic font-title">
              Our Rental Fleet
            </h2>
          </div>
          <a 
            className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-black/80 hover:text-black transition-colors border-b-2 border-primary pb-1" 
            href="#"
          >
            View all cars
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Stack */}
          <div className="lg:col-span-2 relative h-[360px] md:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-primary/20 group">
            <img 
              src={gallery.big} 
              alt="Luxury SUV"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            {/* Dark bottom overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            
            {/* Label Badge */}
            <div className="absolute left-8 bottom-8 bg-black text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md">
              {gallery.label}
            </div>
          </div>

          {/* Small Stack Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <div className="relative h-[170px] md:h-[198px] rounded-3xl overflow-hidden shadow-lg border border-primary/20 group">
              <img 
                src={gallery.small1} 
                alt="Sports Car"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors duration-300" />
            </div>
            
            <div className="relative h-[170px] md:h-[198px] rounded-3xl overflow-hidden shadow-lg border border-primary/20 group">
              <img 
                src={gallery.small2} 
                alt="Sedan"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors duration-300" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
