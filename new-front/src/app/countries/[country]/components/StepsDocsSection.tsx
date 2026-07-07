import { CountryPageData } from '@/data/countryPages';
import { CheckCircle2, ChevronRight, HelpCircle, FileText } from 'lucide-react';

interface Props {
  steps: CountryPageData['steps'];
  documents: CountryPageData['documents'];
}

export default function StepsDocsSection({ steps, documents }: Props) {
  return (
    <section className="py-12 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Steps Card */}
          <div className="lg:col-span-6 bg-primary rounded-3xl p-7 md:p-9 shadow-xl shadow-primary/10 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 border border-black/5 text-black text-xs font-black uppercase tracking-wider mb-3.5">
                <HelpCircle className="w-3.5 h-3.5" />
                How It Works
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight uppercase italic font-title mb-7">
                Book in 3 Easy Steps
              </h2>
              
              <div className="space-y-3.5">
                {steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-3.5 items-start bg-white/70 backdrop-blur-md border border-black/5 rounded-2xl p-3.5 md:p-4 hover:bg-white transition-all duration-300 shadow-sm"
                  >
                    <div className="min-w-9 h-9 rounded-full bg-black text-primary flex items-center justify-center font-black text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-black uppercase tracking-wide text-[14px] font-title">
                        {step.title}
                      </h3>
                      <p className="text-black/80 text-xs md:text-[13px] font-semibold leading-relaxed mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary bg-black text-primary shadow-none hover:bg-black/90 mt-6 w-fit flex items-center gap-2 group-hover:scale-105 transition-all py-3 px-5 text-sm rounded-xl">
              Compare Car Deals Now
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Documents Card */}
          <div className="lg:col-span-6 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40 flex flex-col">
            {/* Header Image */}
            <div className="h-40 md:h-[216px] relative overflow-hidden">
              <img 
                src={documents.image} 
                alt="Required Documents" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            </div>

            {/* Document Content */}
            <div className="p-7 md:p-9 flex-grow flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-black text-xs font-black uppercase tracking-wider mb-3.5">
                  <FileText className="w-3.5 h-3.5" />
                  Required Documents
                </span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase italic font-title mb-5">
                  What to Bring When Picking Up
                </h2>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {documents.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 bg-amber-50/40 border border-amber-100/50 rounded-xl px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-amber-50 hover:border-amber-100 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
