'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assets } from '@/config/assets';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// الصور الجاهزة من assets
const swiperImages = [
  { id: 'swiper1', src: assets.swiper.swiper1, alt: 'Swiper 1' },
  { id: 'swiper2', src: assets.swiper.swiper2, alt: 'Swiper 2' },
  { id: 'swiper3', src: assets.swiper.swiper3, alt: 'Swiper 3' },
  { id: 'swiper4', src: assets.swiper.swiper4, alt: 'Swiper 4' },
  { id: 'swiper5', src: assets.swiper.swiper5, alt: 'Swiper 5' },
  { id: 'swiper6', src: assets.swiper.swiper6, alt: 'Swiper 6' },
  { id: 'swiper7', src: assets.swiper.swiper7, alt: 'Swiper 7' },
];

export default function Fleet() {
  const { currentLanguage } = useSelector((state: RootState) => state.ui);
  const isRTL = currentLanguage === 'ar';
  const swiperRef = useRef<any>(null);

  return (
    <section id="fleet" className="relative overflow-hidden py-8">
      {/* خلفية مش أبيض */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa] via-[#f0f1f3] to-[#f8f9fa]" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-black tracking-tighter uppercase">
            {isRTL ? 'أسطولنا' : 'OUR FLEET'}
          </h2>
        </div>

        {/* Swiper Slider */}
        <div className="relative px-2 md:px-16">
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            modules={[Navigation, Pagination, Autoplay]}
            grabCursor={true}
            slidesPerView={3}
            spaceBetween={24}
            navigation={false}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={swiperImages.length > 3}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="!pb-14"
          >
            {swiperImages.map((img) => (
              <SwiperSlide key={img.id}>
                <div className="group relative rounded-[1.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                  {/* الصورة الجاهزة — تظهر كاملة بحجمها الأصلي */}
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <button 
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-black transition-all duration-300 shadow-lg"
          >
            <ChevronLeft size={22} className={isRTL ? 'rotate-180' : ''} />
          </button>

          <button 
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-black transition-all duration-300 shadow-lg"
          >
            <ChevronRight size={22} className={isRTL ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>
    </section>
  );
}