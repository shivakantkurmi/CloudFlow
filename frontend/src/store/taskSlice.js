import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as taskService from '../services/taskService.js';
export const fetchTasks = createAsyncThunk('tasks/fetchAll', taskService.getTasks);
export const createTask = createAsyncThunk('tasks/create', taskService.createTask);
export const updateTask = createAsyncThunk('tasks/update', taskService.updateTask);
export const deleteTask = createAsyncThunk('tasks/delete', taskService.deleteTask);
export const moveTask = createAsyncThunk('tasks/move', taskService.moveTask);
const taskSlice = createSlice({ name: 'tasks', initialState: { items: [], status: 'idle' }, reducers: {
  upsertRealtimeTask: (state, { payload }) => { const index = state.items.findIndex((task) => task.id === payload.id); if (index >= 0) state.items[index] = payload; else state.items.push(payload); },
  removeRealtimeTask: (state, { payload }) => { state.items = state.items.filter((task) => task.id !== payload.id); },
}, extraReducers: (builder) => builder
  .addCase(fetchTasks.pending, (state) => { state.status = 'loading'; })
  .addCase(fetchTasks.fulfilled, (state, { payload }) => { state.items = payload; state.status = 'succeeded'; })
  .addCase(createTask.fulfilled, (state, { payload }) => { state.items.push(payload); })
  .addCase(updateTask.fulfilled, (state, { payload }) => { const index = state.items.findIndex((task) => task.id === payload.id); if (index >= 0) state.items[index] = payload; })
  .addCase(deleteTask.fulfilled, (state, { meta }) => { state.items = state.items.filter((task) => task.id !== meta.arg.id); })
  .addCase(moveTask.pending, (state, { meta }) => { const task = state.items.find((item) => item.id === meta.arg.id); if (task) { task.status = meta.arg.status; task.position = meta.arg.position; } })
  .addCase(moveTask.fulfilled, (state, { payload }) => { const index = state.items.findIndex((task) => task.id === payload.id); if (index >= 0) state.items[index] = payload; }), });
export const { removeRealtimeTask, upsertRealtimeTask } = taskSlice.actions;
export default taskSlice.reducer;
