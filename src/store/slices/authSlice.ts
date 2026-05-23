import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { authApi } from '@/services/api';

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
      const response: any = await authApi.login(credentials);

      if (response.status === true || response.status === 'true') {
        const userData = response.data || response.user || {};
        const user: User = {
          id: userData.id?.toString() || '1',
          name: userData.name || credentials.email,
          email: userData.email || credentials.email,
          role: response.user_type || userData.role || 'customer',
        };
        const token = response.token || 'session-auth';
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token };
      }

      const errorMsg = Array.isArray(response.message) ? response.message[0] : (response.message || 'Invalid credentials');
      return rejectWithValue(errorMsg);
    } catch (error: any) {
      const msg = error.errors ? Object.values(error.errors).flat().join(', ') : (error.message || 'Login failed');
      return rejectWithValue(msg);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response: any = await authApi.register({
        name: userData.fullName || userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        country: userData.country || '',
      });

      if (response.status === true || response.status === 'true') {
        const user: User = {
          id: response.data?.id?.toString() || '1',
          name: userData.fullName || userData.name,
          email: userData.email,
          role: 'customer',
        };
        const token = response.token || 'session-auth';
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token };
      }

      const errorMsg = response.message || 'Registration failed';
      return rejectWithValue(errorMsg);
    } catch (error: any) {
      const msg = error.errors ? Object.values(error.errors).flat().join(', ') : (error.message || 'Registration failed');
      return rejectWithValue(msg);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response: any = await authApi.forgotPassword({ email });
      if (response.status === false) {
        return rejectWithValue(response.message || 'Failed to send reset email');
      }
      return true;
    } catch (error: any) {
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
      authApi.logout().catch(() => {});
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

export const { restoreAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
