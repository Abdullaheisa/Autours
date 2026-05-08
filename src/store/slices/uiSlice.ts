import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoginModalOpen: boolean;
  isMobileMenuOpen: boolean;
  currentLanguage: 'en' | 'ar';
}

const initialState: UIState = {
  isLoginModalOpen: false,
  isMobileMenuOpen: false,
  currentLanguage: 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleLoginModal: (state) => {
      state.isLoginModalOpen = !state.isLoginModalOpen;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'ar'>) => {
      state.currentLanguage = action.payload;
    },
  },
});

export const { toggleLoginModal, toggleMobileMenu, closeMobileMenu, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
