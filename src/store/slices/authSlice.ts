import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { API_CONFIG } from '@/constants';
import { supplierApi } from '@/services/api/supplierApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Existing Thunks (Mocks for logic integration)
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      if (API_CONFIG.USE_MOCK) {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (credentials.email === 'admin@autours.net' && credentials.password === 'password') {
          const mockUser: User = { id: '1', name: 'Admin User', email: 'admin@autours.net', role: 'admin' };
          const mockToken = 'mock-jwt-token-admin';
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          return { user: mockUser, token: mockToken };
        }
        if (credentials.email === 'supplier@autours.net' && credentials.password === 'password') {
          const mockUser: User = { id: '2', name: 'Supplier User', email: 'supplier@autours.net', role: 'supplier' };
          const mockToken = 'mock-jwt-token-supplier';
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          return { user: mockUser, token: mockToken };
        }
        return rejectWithValue('Invalid credentials');
      } else {
        // Real API Call via supplierApi
        const response: any = await supplierApi.login(credentials);
        if (response.status) {
          const { user, token } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          return { user, token };
        } else {
          return rejectWithValue(response.message || 'Invalid credentials');
        }
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser: User = { id: '2', name: userData.fullName, email: userData.email, role: 'user' };
      const mockToken = 'mock-jwt-token-new';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { user: mockUser, token: mockToken };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Restores persisted session from localStorage on client mount.
    // Called by GlobalLoginGate in useEffect to avoid SSR issues.
    restoreAuth: (state) => {
      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      if (token && userRaw) {
        state.token = token;
        state.user = JSON.parse(userRaw);
        state.isAuthenticated = true;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
