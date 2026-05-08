'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/data/categories';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

export default function Fleet() {
  const { currentLanguage } = useSelector((state: RootState) => state.ui);
  const isRTL = currentLanguage === 'ar';
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const swiperRef = useRef<any>(null);

  const filteredCategories = activeCategory === 'ALL' 
    ? categories 
    : categories.filter((cat) => cat.id === activeCategory);

  const categoryIds = ['ALL', ...categories.map((cat) => cat.id)];

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  }, [activeCategory]);

  return (
    <section id="fleet" className="relative bg-white overflow-hidden py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-black tracking-tighter uppercase">
            {isRTL ? 'أسطولنا' : 'OUR FLEET'}
          </h2>
        </div>



        {/* Swiper Slider - 3 visible at once */}
        <div className="relative px-2 md:px-16">
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
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
            loop={filteredCategories.length > 3}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="!pb-14"
          >
            {filteredCategories.map((cat) => (
              <SwiperSlide key={cat.id}>
                <div className="group h-full">
                  {/* Card - Image Only */}
                  <div className="relative bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 hover:border-primary/30 transition-all duration-500 shadow-xl hover:shadow-2xl">

                    {/* Image - Bigger size, no text */}
                    <div className="relative h-[350px] sm:h-[400px] flex items-center justify-center overflow-hidden">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
                    </div>

                  </div>
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