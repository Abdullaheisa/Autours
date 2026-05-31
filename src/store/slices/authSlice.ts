import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { authApi } from '@/services/api';
import { normalizeAuthRole } from '@/utils/auth';
import { axiosClient } from '@/services/api/axiosClient';

interface UserDataResponse {
  id?: string | number;
  user_name?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthApiResponse {
  status?: boolean | string;
  data?: {
    user?: UserDataResponse;
    token?: string;
  } | UserDataResponse;
  user?: UserDataResponse;
  user_type?: string;
  token?: string;
  access_token?: string;
  message?: string | string[];
}

interface AuthError {
  errors?: Record<string, string[]>;
  message?: string;
}

interface RegisterUserData {
  supplier?: number | boolean;
  fullName?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  country?: string;
}


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

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // 1. Destroy the Old Token on the backend first if it exists
      const existingToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (existingToken) {
        try {
          await authApi.logout();
        } catch (e) {
          // Ignore pre-emptive logout failure (e.g. if already expired)
        }
      }

      // 2. Destroy the Old Token and Session completely from local storage and cookies
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear all cookies
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      }
      
      // 3. Explicitly wipe Authorization headers from global Axios and client
      const axios = require('axios').default || require('axios');
      delete axios.defaults.headers.common['Authorization'];
      delete axiosClient.defaults.headers.common['Authorization'];

      const response = await authApi.login(credentials) as AuthApiResponse;

      if (response.status === true || response.status === 'true') {
        const token = response.token;
        if (!token) {
          return rejectWithValue('No token received from server.');
        }
        localStorage.setItem('token', token);
        
        // Set header on axiosClient for future requests
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const userData: any = response.data || {};
        const user: User = {
          id: userData.id?.toString() || '1',
          name: userData.user_name || userData.name || credentials.email,
          email: userData.email || credentials.email,
          role: normalizeAuthRole(userData.role || 'supplier'),
          status: userData.role || 'supplier',
          avatar: userData.logo || userData.company_logo || userData.photo || userData.avatar || undefined,
          logo: userData.logo || userData.company_logo || userData.photo || userData.avatar || undefined,
          phone_num: userData.phone_num || undefined,
          country: userData.country || undefined,
        };
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token };
      }

      const errorMsg = Array.isArray(response.message) ? response.message[0] : (response.message || 'Invalid credentials');
      return rejectWithValue(errorMsg);
    } catch (err: unknown) {
      const error = err as AuthError;
      const msg = error.errors ? Object.values(error.errors).flat().join(', ') : (error.message || 'Login failed');
      return rejectWithValue(msg);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: RegisterUserData, { rejectWithValue }) => {
    try {
      const isSupplier = userData.supplier === 1 || userData.supplier === true;
      const response = await authApi.register({
        name: userData.fullName || userData.name || '',
        email: userData.email || '',
        password: userData.password || '',
        phone: userData.phone || '',
        country: userData.country || '',
        supplier: isSupplier ? 1 : 0,
      }) as AuthApiResponse;

      if (response.status === true || response.status === 'true') {
        // Registration successful but no token is returned. The user must login.
        return { user: null, token: null };
      }

      const errorMsg = response.message || 'Registration failed';
      return rejectWithValue(errorMsg);
    } catch (err: unknown) {
      const error = err as AuthError;
      const msg = error.errors ? Object.values(error.errors).flat().join(', ') : (error.message || 'Registration failed');
      return rejectWithValue(msg);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword({ email }) as AuthApiResponse;
      if (response.status === false) {
        return rejectWithValue(response.message || 'Failed to send reset email');
      }
      return true;
    } catch (err: unknown) {
      const error = err as AuthError;
      return rejectWithValue(error.message || 'Failed to send reset email');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreAuth: (state) => {
      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      if (token && userRaw) {
        const parsed = JSON.parse(userRaw) as User;
        state.token = token;
        state.user = { ...parsed, role: normalizeAuthRole(parsed.role), status: parsed.status || parsed.role };
        state.isAuthenticated = true;
      }
    },
    logout: (state) => {
      authApi.logout().catch(() => {});
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
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
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
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
        // User needs to login after registration, so we don't set isAuthenticated to true here.
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { restoreAuth, logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
