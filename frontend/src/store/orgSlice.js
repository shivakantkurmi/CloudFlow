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
      state.currentOrg = state.items.find(org => org.id === action.payload) || null;
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
        if (!state.currentOrg && state.items.length > 0) {
          state.currentOrg = state.items[0];
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.currentOrg = action.payload; // Auto switch to newly created org
      });
  },
});

export const { setCurrentOrg } = orgSlice.actions;
export default orgSlice.reducer;
