import { useEffect, useState } from 'react';
import { getProjectActivities } from '../services/activityService.js';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';

const ActionIcon = ({ action }) => {
  switch (action) {
    case 'CREATED': return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">✨</div>;
    case 'UPDATED': return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm">📝</div>;
    case 'DELETED': return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm">🗑️</div>;
    case 'COMMENTED': return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow-sm">💬</div>;
    case 'INVITED': return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-sm">👋</div>;
    case 'LEFT': return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm">🚪</div>;
    default: return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm">📌</div>;
  }
};

const ActivityMessage = ({ log }) => {
  const actorName = <span className="font-semibold text-slate-900">{log.user.firstName} {log.user.lastName}</span>;
  
  if (log.entityType === 'task') {
    const taskName = <span className="font-medium text-slate-800">"{log.newValues?.title || log.oldValues?.title || 'Unknown Task'}"</span>;
    switch (log.action) {
      case 'CREATED': return <>{actorName} created task {taskName}</>;
      case 'UPDATED': 
        if (log.newValues?.status) return <>{actorName} moved task {taskName} to <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold">{log.newValues.status}</span></>;
        return <>{actorName} updated task {taskName}</>;
      case 'DELETED': return <>{actorName} deleted task {taskName}</>;
      case 'COMMENTED': return <>{actorName} commented on task {taskName}</>;
      default: return <>{actorName} performed {log.action} on a task</>;
    }
  } else if (log.entityType === 'member') {
    switch (log.action) {
      case 'INVITED': return <>{actorName} joined the project as {log.newValues?.role || 'MEMBER'}</>;
      case 'LEFT': return <>{actorName} left the project</>;
      default: return <>{actorName} modified membership</>;
    }
  }
  return <>{actorName} performed {log.action}</>;
};

export const ActivityTimeline = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getProjectActivities(projectId);
        setActivities(data);
      } catch (error) {
        toast.error(getFriendlyErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [projectId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading timeline...</div>;
  if (activities.length === 0) return <div className="rounded-xl border border-dashed p-10 text-center text-slate-500">No activity yet.</div>;

  return (
    <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold">Activity Timeline</h2>
      <div className="relative border-l border-slate-200 pl-4">
        {activities.map((log) => (
          <div key={log.id} className="mb-6 flex items-start gap-4 last:mb-0">
            <div className="absolute -left-4 rounded-full border-4 border-white bg-white">
              <ActionIcon action={log.action} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <ActivityMessage log={log} />
              </p>
              <span className="mt-1 block text-xs text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
