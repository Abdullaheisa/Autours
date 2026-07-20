import Image from 'next/image';

interface WhyBookSectionProps {
  brandName: string;
  brandLogo: string;
  description: string;
}

export default function WhyBookSection({
  brandName,
  brandLogo,
  description,
}: WhyBookSectionProps) {
  const descriptionParagraphs = description
    .split('\n\n')
    .filter((p) => p.trim());

  return (
    <section className="py-10 md:py-14 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Header: Title & Logo */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-2xl md:text-[28px] font-black text-gray-900 tracking-tight">
              Why book your car rental with {brandName}?
            </h3>
            {/* Logo in styled box — matches hero */}
            <div className="relative shrink-0 self-start md:self-center bg-white rounded-2xl border-2 border-[var(--primary)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-3 w-[140px] h-[70px] flex items-center justify-center">
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary border-2 border-white z-10 shadow-sm" />
              <Image
                src={brandLogo}
                alt={`${brandName} logo`}
                width={130}
                height={60}
                className="object-contain w-full h-full select-none"
                unoptimized
              />
            </div>
          </div>

          {/* Description paragraphs */}
          <div className="space-y-6">
            {descriptionParagraphs.map((para: string, i: number) => (
              <p key={i} className="text-base md:text-[17px] text-gray-700 leading-[1.8] font-normal">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
