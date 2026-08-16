import { Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { getImageUrl } from '@/utils/getImageUrl';

export interface LocationTravelInfo {
  title: string;
  subtitle: string;
  benefits: { title: string; description: string }[];
  image: string;
}

interface Props {
  travelInfo: LocationTravelInfo;
}

const ICONS = [
  <Award className="w-5 h-5 text-gray-900" key={0} />,
  <ShieldCheck className="w-5 h-5 text-gray-900" key={1} />,
  <HeartHandshake className="w-5 h-5 text-gray-900" key={2} />,
];

export default function TravelInfoSection({ travelInfo }: Props) {
  return (
    <section className="py-14 bg-gradient-to-br from-white via-gray-50/50 to-white text-gray-900 relative overflow-hidden">
      <div className="absolute top-1/4 -right-12 w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-12 w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* Feature Image */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-[2.6rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-500" />
            <div className="relative h-[380px] lg:h-[480px] w-full rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl group-hover:shadow-2xl transition duration-500">
              <img
                src={getImageUrl(travelInfo.image)}
                alt={travelInfo.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>

          {/* Feature Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-gray-900 text-[10px] font-black uppercase tracking-wider mb-3 w-fit shadow-sm">
              Why Autours
            </span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight uppercase mb-3 leading-tight font-title text-gray-900">
              Why <span className="text-primary italic font-black">Autours</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed font-semibold mb-6">
              {travelInfo.subtitle}
            </p>

            <div className="flex flex-col gap-3.5">
              {travelInfo.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 px-5 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(234,179,8,0.1)] hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(234,179,8,0.2)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    {ICONS[idx] || <Award className="w-4 h-4 text-gray-900" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-0.5 uppercase tracking-wide">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
