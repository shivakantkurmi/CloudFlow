import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as notificationService from '../services/notificationService.js';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', notificationService.getNotifications);
export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id) => {
  await notificationService.markAsRead(id);
  return id;
});
export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', notificationService.markAllAsRead);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    status: 'idle'
  },
  reducers: {
    receiveNotification: (state, action) => {
      state.items.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.items.find(n => n.id === action.payload);
        if (notif) notif.read = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach(n => { n.read = true; });
      });
  }
});

export const { receiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
