import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as projectService from '../services/projectService.js';

export const fetchProjects = createAsyncThunk('projects/fetchAll', projectService.getProjects);
export const createProject = createAsyncThunk('projects/create', projectService.createProject);
export const updateProject = createAsyncThunk('projects/update', projectService.updateProject);
export const deleteProject = createAsyncThunk('projects/delete', projectService.deleteProject);
export const fetchProject = createAsyncThunk('projects/fetchOne', projectService.getProject);
export const fetchMembers = createAsyncThunk('projects/fetchMembers', projectService.getMembers);
export const addProjectMember = createAsyncThunk('projects/addMember', projectService.addMember);
export const removeProjectMember = createAsyncThunk('projects/removeMember', projectService.removeMember);
const initialState = { items: [], current: null, members: [], status: 'idle', error: null };
const projectSlice = createSlice({ name: 'projects', initialState, reducers: { clearCurrentProject: (state) => { state.current = null; state.members = []; } }, extraReducers: (builder) => builder
  .addCase(fetchProjects.pending, (state) => { state.status = 'loading'; })
  .addCase(fetchProjects.fulfilled, (state, { payload }) => { state.items = payload; state.status = 'succeeded'; })
  .addCase(fetchProjects.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
  .addCase(createProject.fulfilled, (state, { payload }) => { state.items.unshift(payload); })
  .addCase(updateProject.fulfilled, (state, { payload }) => { state.current = payload; const index = state.items.findIndex((project) => project.id === payload.id); if (index >= 0) state.items[index] = payload; })
  .addCase(deleteProject.fulfilled, (state, { meta }) => { state.items = state.items.filter((project) => project.id !== meta.arg); state.current = null; })
  .addCase(fetchProject.fulfilled, (state, { payload }) => { state.current = payload; })
  .addCase(fetchMembers.fulfilled, (state, { payload }) => { state.members = payload; })
  .addCase(addProjectMember.fulfilled, (state, { payload }) => { state.members.push(payload); })
  .addCase(removeProjectMember.fulfilled, (state, { meta }) => { state.members = state.members.filter((member) => member.userId !== meta.arg.userId); }), });
export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
