import { useEffect, useState } from 'react';
import { getProjectActivities } from '../services/activityService.js';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';

const ACTION_CONFIG = {
  CREATED: { color: 'bg-emerald-500/15 text-emerald-500', dot: 'bg-emerald-500', emoji: '✨' },
  UPDATED: { color: 'bg-blue-500/15 text-blue-500', dot: 'bg-blue-500', emoji: '✏️' },
  DELETED: { color: 'bg-rose-500/15 text-rose-500', dot: 'bg-rose-500', emoji: '🗑️' },
  COMMENTED: { color: 'bg-violet-500/15 text-violet-500', dot: 'bg-violet-500', emoji: '💬' },
  INVITED: { color: 'bg-primary-DEFAULT/15 text-primary-DEFAULT', dot: 'bg-primary-DEFAULT', emoji: '👋' },
  LEFT: { color: 'bg-slate-400/15 text-cf-3', dot: 'bg-slate-400', emoji: '🚪' },
  DEFAULT: { color: 'bg-slate-400/15 text-cf-3', dot: 'bg-slate-500', emoji: '📌' },
};

const ActivityMessage = ({ log }) => {
  const actor = <span className="font-semibold text-cf">{log.user.firstName} {log.user.lastName}</span>;

  if (log.entityType === 'task') {
    const title = log.newValues?.title || log.oldValues?.title || 'a task';
    const taskRef = <span className="font-medium text-cf-2">"{title}"</span>;
    if (log.action === 'CREATED') return <>{actor} created task {taskRef}</>;
    if (log.action === 'UPDATED') {
      if (log.newValues?.status) return <>{actor} moved {taskRef} to <span className="inline-flex items-center rounded-md bg-cf-elevated px-1.5 py-0.5 text-[11px] font-semibold text-cf">{log.newValues.status.replace('_', ' ')}</span></>;
      return <>{actor} updated task {taskRef}</>;
    }
    if (log.action === 'DELETED') return <>{actor} deleted task {taskRef}</>;
    if (log.action === 'COMMENTED') return <>{actor} commented on {taskRef}</>;
  }
  if (log.entityType === 'member') {
    if (log.action === 'INVITED') return <>{actor} joined as <span className="font-semibold">{log.newValues?.role ?? 'member'}</span></>;
    if (log.action === 'LEFT') return <>{actor} left the project</>;
  }
  return <>{actor} performed {log.action}</>;
};

export const ActivityTimeline = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { setActivities(await getProjectActivities(projectId)); }
      catch (error) { toast.error(getFriendlyErrorMessage(error)); }
      finally { setLoading(false); }
    };
    fetch();
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-cf-elevated shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 rounded-md bg-cf-elevated w-3/4" />
              <div className="h-3 rounded-md bg-cf-elevated w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center rounded-2xl border border-dashed border-cf-strong">
        <span className="text-4xl mb-3">📋</span>
        <p className="text-sm font-medium text-cf">No activity yet</p>
        <p className="text-xs text-cf-3 mt-1">Actions on this project will appear here.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-4 bottom-4 w-px bg-cf-elevated" />

      <div className="space-y-1">
        {activities.map((log) => {
          const config = ACTION_CONFIG[log.action] ?? ACTION_CONFIG.DEFAULT;
          return (
            <div key={log.id} className="flex items-start gap-4 pl-0 py-2 hover:bg-cf-elevated rounded-xl px-3 transition-colors">
              {/* Dot */}
              <div className="relative z-10 shrink-0">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${config.color}`}>
                  {config.emoji}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cf-2 leading-snug">
                  <ActivityMessage log={log} />
                </p>
                <p className="mt-0.5 text-[10px] text-cf-3">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
