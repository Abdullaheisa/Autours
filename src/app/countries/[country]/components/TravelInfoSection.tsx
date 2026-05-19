import { CountryPageData } from '@/data/countryPages';
import { Award, ShieldCheck, HeartHandshake } from 'lucide-react';

interface Props {
  travelInfo: CountryPageData['travelInfo'];
}

export default function TravelInfoSection({ travelInfo }: Props) {
  // Map icons dynamically
  const icons = [
    <Award className="w-6 h-6 text-primary" key={0} />,
    <ShieldCheck className="w-6 h-6 text-primary" key={1} />,
    <HeartHandshake className="w-6 h-6 text-primary" key={2} />
  ];

  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Feature Image Wrapper */}
          <div className="lg:col-span-5 h-[480px] lg:h-[580px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
            <img 
              src={travelInfo.image} 
              alt={travelInfo.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Feature Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-wider mb-4 w-fit">
              Why Autours
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic font-title text-white mb-6">
              {travelInfo.title}
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed font-medium mb-10">
              {travelInfo.subtitle}
            </p>

            {/* Dynamic Benefit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {travelInfo.benefits.map((benefit, idx) => (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/10 group-hover:scale-105 transition-transform">
                    {icons[idx] || <Award className="w-6 h-6 text-primary" />}
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wide text-primary mb-2 font-title">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed font-medium">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
