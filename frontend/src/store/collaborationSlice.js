import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as collaborationService from '../services/collaborationService.js';

export const fetchComments = createAsyncThunk('collaboration/fetchComments', async (taskId) => {
  return await collaborationService.getComments(taskId);
});

export const addComment = createAsyncThunk('collaboration/addComment', async ({ taskId, content }) => {
  return await collaborationService.addComment(taskId, content);
});

export const deleteComment = createAsyncThunk('collaboration/deleteComment', async ({ taskId, commentId }) => {
  await collaborationService.deleteComment(taskId, commentId);
  return commentId;
});

export const fetchAttachments = createAsyncThunk('collaboration/fetchAttachments', async (taskId) => {
  return await collaborationService.getAttachments(taskId);
});

export const uploadAttachment = createAsyncThunk('collaboration/uploadAttachment', async ({ taskId, file }) => {
  return await collaborationService.uploadAttachment(taskId, file);
});

export const deleteAttachment = createAsyncThunk('collaboration/deleteAttachment', async ({ taskId, attachmentId }) => {
  await collaborationService.deleteAttachment(taskId, attachmentId);
  return attachmentId;
});

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState: {
    comments: [],
    attachments: [],
    status: 'idle',
    error: null,
    currentTaskId: null,
  },
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTaskId = action.payload;
      state.comments = [];
      state.attachments = [];
      state.status = 'idle';
    },
    clearCurrentTask: (state) => {
      state.currentTaskId = null;
      state.comments = [];
      state.attachments = [];
      state.status = 'idle';
    },
    // Real-time handlers
    receiveComment: (state, action) => {
      if (state.currentTaskId === action.payload.taskId) {
        if (!state.comments.find((c) => c.id === action.payload.id)) {
          state.comments.push(action.payload);
        }
      }
    },
    removeCommentRealtime: (state, action) => {
      if (state.currentTaskId === action.payload.taskId) {
        state.comments = state.comments.filter((c) => c.id !== action.payload.id);
      }
    },
    receiveAttachment: (state, action) => {
      if (state.currentTaskId === action.payload.taskId) {
        if (!state.attachments.find((a) => a.id === action.payload.id)) {
          state.attachments.unshift(action.payload); // Prepend so newest is first
        }
      }
    },
    removeAttachmentRealtime: (state, action) => {
      if (state.currentTaskId === action.payload.taskId) {
        state.attachments = state.attachments.filter((a) => a.id !== action.payload.id);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Comments
      .addCase(fetchComments.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (!state.comments.find((c) => c.id === action.payload.id)) {
          state.comments.push(action.payload);
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c.id !== action.payload);
      })
      
      // Attachments
      .addCase(fetchAttachments.fulfilled, (state, action) => {
        state.attachments = action.payload;
      })
      .addCase(uploadAttachment.fulfilled, (state, action) => {
        if (!state.attachments.find((a) => a.id === action.payload.id)) {
          state.attachments.unshift(action.payload);
        }
      })
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        state.attachments = state.attachments.filter((a) => a.id !== action.payload);
      });
  }
});

export const { 
  setCurrentTask, 
  clearCurrentTask, 
  receiveComment, 
  removeCommentRealtime, 
  receiveAttachment, 
  removeAttachmentRealtime 
} = collaborationSlice.actions;

export default collaborationSlice.reducer;
