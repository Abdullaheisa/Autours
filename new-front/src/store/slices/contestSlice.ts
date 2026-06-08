import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ContestApi } from '@/services/contest/contest.api';
import { ContestRegistrationDTO, RegisterUserPayload } from '@/services/contest/contest.types';

export interface ContestState {
  enabled: boolean;
  campaignVersion: number;
  forceInteraction: boolean;
  registrations: ContestRegistrationDTO[];
  loading: boolean;
  error: string | null;
}

const initialState: ContestState = {
  enabled: true,
  campaignVersion: 1,
  forceInteraction: false,
  registrations: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchContestSettings = createAsyncThunk('contest/fetchSettings', async () => {
  return await ContestApi.fetchSettings();
});

export const updateContestSettings = createAsyncThunk('contest/updateSettings', async (settings: Partial<{ enabled: boolean; forceInteraction: boolean }>) => {
  return await ContestApi.updateSettings(settings);
});

export const resetCampaign = createAsyncThunk('contest/resetCampaign', async () => {
  return await ContestApi.resetCampaign();
});

export const registerContestUser = createAsyncThunk('contest/registerUser', async (payload: RegisterUserPayload) => {
  return await ContestApi.registerUser(payload);
});

export const fetchRegistrations = createAsyncThunk('contest/fetchRegistrations', async () => {
  return await ContestApi.fetchRegistrations();
});

const contestSlice = createSlice({
  name: 'contest',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Settings
    builder.addCase(fetchContestSettings.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchContestSettings.fulfilled, (state, action) => {
      state.loading = false;
      state.enabled = action.payload.enabled;
      state.campaignVersion = action.payload.campaignVersion;
      state.forceInteraction = action.payload.forceInteraction;
    });
    builder.addCase(fetchContestSettings.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed'; });

    // Update Settings
    builder.addCase(updateContestSettings.pending, (state) => { state.loading = true; });
    builder.addCase(updateContestSettings.fulfilled, (state, action) => {
      state.loading = false;
      state.enabled = action.payload.enabled;
      state.forceInteraction = action.payload.forceInteraction;
    });

    // Reset Campaign
    builder.addCase(resetCampaign.fulfilled, (state, action) => {
      state.campaignVersion = action.payload.campaignVersion;
    });

    // Register User
    builder.addCase(registerContestUser.pending, (state) => { state.loading = true; });
    builder.addCase(registerContestUser.fulfilled, (state, action) => {
      state.loading = false;
      state.registrations.push(action.payload);
    });

    // Fetch Registrations
    builder.addCase(fetchRegistrations.fulfilled, (state, action) => {
      state.registrations = action.payload;
    });
  },
});

export default contestSlice.reducer;
