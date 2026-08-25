import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../services/apiClient.js';

export const fetchOrganizations = createAsyncThunk('orgs/fetchAll', async () => {
  const { data } = await apiClient.get('/orgs');
  return data.data; // our standard response format { success, data, message }
});

export const createOrganization = createAsyncThunk('orgs/create', async (payload) => {
  const { data } = await apiClient.post('/orgs', payload);
  return data.data;
});

export const getOrganization = createAsyncThunk('orgs/get', async (id) => {
  const { data } = await apiClient.get(`/orgs/${id}`);
  return data.data;
});

export const deleteOrganization = createAsyncThunk('orgs/delete', async (id) => {
  const { data } = await apiClient.delete(`/orgs/${id}`);
  return data.data; // { id }
});

const orgSlice = createSlice({
  name: 'orgs',
  initialState: {
    items: [],
    currentOrg: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setCurrentOrg: (state, action) => {
      const payload = action.payload;
      if (typeof payload === 'string') {
        state.currentOrg = state.items.find(org => org.id === payload) || null;
      } else if (payload && payload.id) {
        const fullOrg = state.items.find(org => org.id === payload.id);
        state.currentOrg = fullOrg || payload;
      }
      if (state.currentOrg) {
        localStorage.setItem('cf_current_org', state.currentOrg.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        const savedOrgId = state.currentOrg?.id || localStorage.getItem('cf_current_org');
        const savedOrg = savedOrgId ? state.items.find(org => org.id === savedOrgId) : null;
        state.currentOrg = savedOrg || state.items[0] || null;
        if (state.currentOrg) {
          localStorage.setItem('cf_current_org', state.currentOrg.id);
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.currentOrg = action.payload;
        localStorage.setItem('cf_current_org', action.payload.id);
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.items = state.items.filter(org => org.id !== action.payload.id);
        if (state.currentOrg?.id === action.payload.id) {
          state.currentOrg = state.items[0] || null;
          if (state.currentOrg) {
            localStorage.setItem('cf_current_org', state.currentOrg.id);
          } else {
            localStorage.removeItem('cf_current_org');
          }
        }
      });
  },
});

export const { setCurrentOrg } = orgSlice.actions;
export default orgSlice.reducer;
