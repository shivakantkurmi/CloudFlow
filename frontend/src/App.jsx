import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { ProjectsPage } from './pages/ProjectsPage.jsx';
import { ProjectDetailPage } from './pages/ProjectDetailPage.jsx';
import { connectSocket, disconnectSocket } from './services/socketClient.js';
import { removeRealtimeTask, upsertRealtimeTask } from './store/taskSlice.js';
import { receiveComment, removeCommentRealtime, receiveAttachment, removeAttachmentRealtime } from './store/collaborationSlice.js';
import { fetchNotifications, receiveNotification } from './store/notificationSlice.js';

export const App = () => {
  const dispatch = useDispatch();
  const { accessToken, initialized } = useSelector((state) => state.auth);

  // Fetch notifications once authenticated
  useEffect(() => {
    if (accessToken && initialized) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, accessToken, initialized]);

  // Real-time socket connection
  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return undefined;
    }
    const socket = connectSocket(accessToken);
    const upsert = (task) => dispatch(upsertRealtimeTask(task));
    const remove = (task) => dispatch(removeRealtimeTask(task));
    const onCommentAdded = (comment) => dispatch(receiveComment(comment));
    const onCommentDeleted = (comment) => dispatch(removeCommentRealtime(comment));
    const onAttachmentAdded = (attachment) => dispatch(receiveAttachment(attachment));
    const onAttachmentDeleted = (attachment) => dispatch(removeAttachmentRealtime(attachment));
    const onNotification = (notif) => dispatch(receiveNotification(notif));

    socket.on('task:created', upsert);
    socket.on('task:updated', upsert);
    socket.on('task:deleted', remove);
    socket.on('comment:added', onCommentAdded);
    socket.on('comment:deleted', onCommentDeleted);
    socket.on('attachment:added', onAttachmentAdded);
    socket.on('attachment:deleted', onAttachmentDeleted);
    socket.on('notification:new', onNotification);

    return () => {
      socket.off('task:created', upsert);
      socket.off('task:updated', upsert);
      socket.off('task:deleted', remove);
      socket.off('comment:added', onCommentAdded);
      socket.off('comment:deleted', onCommentDeleted);
      socket.off('attachment:added', onAttachmentAdded);
      socket.off('attachment:deleted', onAttachmentDeleted);
      socket.off('notification:new', onNotification);
    };
  }, [dispatch, accessToken]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage isRegister />} />

      {/* Protected routes — ProtectedRoute handles auth + org bootstrap */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Catch-all → home (ProtectedRoute will redirect to /login if not authed) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
