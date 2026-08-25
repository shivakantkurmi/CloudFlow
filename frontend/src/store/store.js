import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { injectStore } from './injectStore.js';
import authReducer from './authSlice.js';
import projectReducer from './projectSlice.js';
import taskReducer from './taskSlice.js';
import collaborationReducer from './collaborationSlice.js';
import notificationReducer from './notificationSlice.js';
import orgReducer from './orgSlice.js';

const appReducer = combineReducers({
  auth: authReducer,
  projects: projectReducer,
  tasks: taskReducer,
  collaboration: collaborationReducer,
  notifications: notificationReducer,
  orgs: orgReducer
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout/fulfilled' || action.type === 'auth/clearSession') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });
injectStore(store);
