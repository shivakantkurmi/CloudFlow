import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as authService from '../services/authService.js';

const stored = JSON.parse(localStorage.getItem('cloudflow.auth') ?? 'null');
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', authService.getMe);
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const persist = (state) => localStorage.setItem('cloudflow.auth', JSON.stringify({ user: state.user }));
const initialState = {
  user: stored?.user ?? null,
  isLoading: false,
  // initialized = false when there's a stored user (ProtectedRoute will verify it)
  initialized: !stored?.user,
};

const authSlice = createSlice({ name: 'auth', initialState, reducers: {
  setSession: (state, { payload }) => { state.user = payload; persist(state); },
  setTokens: (state, { payload }) => { state.user = payload; persist(state); },
  clearSession: (state) => { state.user = null; localStorage.removeItem('cloudflow.auth'); localStorage.removeItem('cf_current_org'); },
}, extraReducers: (builder) => builder
  .addCase(fetchCurrentUser.pending, (state) => { state.isLoading = true; })
  .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => { state.user = payload; state.initialized = true; state.isLoading = false; persist(state); })
  .addCase(fetchCurrentUser.rejected, (state) => { state.user = null; state.initialized = true; state.isLoading = false; persist(state); })
  .addCase(logout.fulfilled, (state) => { state.user = null; localStorage.removeItem('cloudflow.auth'); localStorage.removeItem('cf_current_org'); }), });
export const { clearSession, setSession, setTokens } = authSlice.actions;
export default authSlice.reducer;

