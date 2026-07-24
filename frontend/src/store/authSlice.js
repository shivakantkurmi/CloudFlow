import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as authService from '../services/authService.js';

const stored = JSON.parse(localStorage.getItem('cloudflow.auth') ?? 'null');
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', authService.getMe);
const persist = (state) => localStorage.setItem('cloudflow.auth', JSON.stringify({ accessToken: state.accessToken, refreshToken: state.refreshToken, user: state.user }));
const initialState = {
  accessToken: stored?.accessToken ?? null,
  refreshToken: stored?.refreshToken ?? null,
  user: stored?.user ?? null,
  isLoading: false,
  // initialized = true when there's no stored token (nothing to verify)
  // initialized = false when there's a stored token (ProtectedRoute will verify it)
  initialized: !stored?.accessToken,
};
const authSlice = createSlice({ name: 'auth', initialState, reducers: {
  setSession: (state, { payload }) => { state.accessToken = payload.accessToken; state.refreshToken = payload.refreshToken; state.user = payload.user; persist(state); },
  setTokens: (state, { payload }) => { state.accessToken = payload.accessToken; state.refreshToken = payload.refreshToken; state.user = payload.user; persist(state); },
  clearSession: (state) => { state.accessToken = null; state.refreshToken = null; state.user = null; localStorage.removeItem('cloudflow.auth'); },
}, extraReducers: (builder) => builder
  .addCase(fetchCurrentUser.pending, (state) => { state.isLoading = true; })
  .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => { state.user = payload; state.initialized = true; state.isLoading = false; persist(state); })
  .addCase(fetchCurrentUser.rejected, (state) => { state.initialized = true; state.isLoading = false; }), });
export const { clearSession, setSession, setTokens } = authSlice.actions;
export default authSlice.reducer;

