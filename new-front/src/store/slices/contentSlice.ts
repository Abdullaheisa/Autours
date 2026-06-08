import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SeoSettings {
  homeTitle: string;
  homeDescription: string;
  blogTitle: string;
  blogDescription: string;
}

interface ContentState {
  logo: string;
  heroBackground: string;
  beSupplierBanner: string;
  cinemaBanner: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  seo: SeoSettings;
}

const initialState: ContentState = {
  logo: '', // Empty means use fallback in components
  heroBackground: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80',
  beSupplierBanner: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1920&q=80',
  cinemaBanner: 'https://images.unsplash.com/photo-1517604412417-af920252538b?w=1920&q=80',
  contactInfo: {
    email: 'info@autours.net',
    phone: '361-688-5824',
    address: '4826 White Avenue, Corpus Christi, Texas',
  },
  seo: {
    homeTitle: 'Autours | Premium Car Rental Aggregator',
    homeDescription: 'The leading car rental aggregator in the Middle East. Compare prices from top suppliers like AVIS, Hertz, and Sixt.',
    blogTitle: 'Autours | Car Rental Blog',
    blogDescription: 'Latest news, tips, and guides for car rentals in the Middle East.',
  }
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    updateLogo: (state, action: PayloadAction<string>) => {
      state.logo = action.payload;
    },
    updateHeroBackground: (state, action: PayloadAction<string>) => {
      state.heroBackground = action.payload;
    },
    updateBanners: (state, action: PayloadAction<Partial<{ beSupplier: string; cinema: string }>>) => {
      if (action.payload.beSupplier) state.beSupplierBanner = action.payload.beSupplier;
      if (action.payload.cinema) state.cinemaBanner = action.payload.cinema;
    },
    updateContactInfo: (state, action: PayloadAction<Partial<ContentState['contactInfo']>>) => {
      state.contactInfo = { ...state.contactInfo, ...action.payload };
    },
    updateSeo: (state, action: PayloadAction<Partial<SeoSettings>>) => {
      state.seo = { ...state.seo, ...action.payload };
    },
  },
});

export const { updateLogo, updateHeroBackground, updateBanners, updateContactInfo, updateSeo } = contentSlice.actions;
export default contentSlice.reducer;
