import { CountryPageData } from '@/data/countryPages';
import { CheckCircle2, ChevronRight, HelpCircle, FileText } from 'lucide-react';

interface Props {
  steps: CountryPageData['steps'];
  documents: CountryPageData['documents'];
}

export default function StepsDocsSection({ steps, documents }: Props) {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Steps Card */}
          <div className="lg:col-span-6 bg-primary rounded-3xl p-8 md:p-10 shadow-xl shadow-primary/10 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 border border-black/5 text-black text-xs font-black uppercase tracking-wider mb-4">
                <HelpCircle className="w-3.5 h-3.5" />
                How It Works
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase italic font-title mb-8">
                Book in 3 Easy Steps
              </h2>
              
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-4 items-start bg-white/70 backdrop-blur-md border border-black/5 rounded-2xl p-4 md:p-5 hover:bg-white transition-all duration-300 shadow-sm"
                  >
                    <div className="min-w-10 h-10 rounded-full bg-black text-primary flex items-center justify-center font-black text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-black uppercase tracking-wide text-[15px] font-title">
                        {step.title}
                      </h3>
                      <p className="text-black/80 text-sm font-semibold leading-relaxed mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary bg-black text-primary shadow-none hover:bg-black/90 mt-8 w-fit flex items-center gap-2 group-hover:scale-105 transition-all py-3.5 px-6">
              Compare Car Deals Now
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Documents Card */}
          <div className="lg:col-span-6 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40 flex flex-col">
            {/* Header Image */}
            <div className="h-48 md:h-56 relative overflow-hidden">
              <img 
                src={documents.image} 
                alt="Required Documents" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            </div>

            {/* Document Content */}
            <div className="p-8 md:p-10 flex-grow flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-black text-xs font-black uppercase tracking-wider mb-4">
                  <FileText className="w-3.5 h-3.5" />
                  Required Documents
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic font-title mb-6">
                  What to Bring When Picking Up
                </h2>
                
                <div className="grid grid-cols-1 gap-3">
                  {documents.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 bg-amber-50/40 border border-amber-100/50 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-amber-50 hover:border-amber-100 transition-colors"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" strokeWidth={3} />
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
