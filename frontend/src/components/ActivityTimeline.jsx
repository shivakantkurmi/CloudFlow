import { useEffect, useState } from 'react';
import { getProjectActivities } from '../services/activityService.js';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';

/* Action → dot color */
const ACTION_DOT = {
  CREATED:   'border-cf-teal bg-cf-elevated',
  UPDATED:   'border-cf-cyan bg-cf-elevated',
  DELETED:   'border-[#ffb4ab] bg-cf-elevated',
  COMMENTED: 'border-cf-border bg-cf-elevated',
  INVITED:   'border-cf-teal bg-cf-elevated',
  LEFT:      'border-cf-border bg-cf-elevated',
  DEFAULT:   'border-cf-border bg-cf-elevated',
};
const ACTION_ICON_COLOR = {
  CREATED:   'text-cf-teal',
  UPDATED:   'text-cf-cyan',
  DELETED:   'text-[#ffb4ab]',
  COMMENTED: 'text-cf-3',
  INVITED:   'text-cf-teal',
  LEFT:      'text-cf-3',
  DEFAULT:   'text-cf-3',
};

/* Activity message formatter */
const ActivityMessage = ({ log }) => {
  const actor = <span className="font-medium text-cf">{log.user.firstName} {log.user.lastName}</span>;

  if (log.entityType === 'task') {
    const title   = log.newValues?.title || log.oldValues?.title || 'a task';
    const taskRef = <span className="font-technical text-cf-2">"{title}"</span>;
    if (log.action === 'CREATED')   return <>{actor} created task {taskRef}</>;
    if (log.action === 'UPDATED') {
      if (log.newValues?.status) return (
        <>{actor} moved {taskRef} to <span className="cf-badge-todo">{log.newValues.status.replace('_', ' ')}</span></>
      );
      return <>{actor} updated {taskRef}</>;
    }
    if (log.action === 'DELETED')   return <>{actor} deleted task {taskRef}</>;
    if (log.action === 'COMMENTED') return <>{actor} commented on {taskRef}</>;
  }
  if (log.entityType === 'member') {
    if (log.action === 'INVITED') return <>{actor} joined as <span className="font-technical text-cf-teal">{log.newValues?.role ?? 'member'}</span></>;
    if (log.action === 'LEFT')    return <>{actor} left the project</>;
  }
  return <>{actor} <span className="text-cf-3">{log.action.toLowerCase()}</span></>;
};

export const ActivityTimeline = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);

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
      <div className="space-y-4 relative pl-10 animate-pulse">
        <div className="absolute left-4 top-2 bottom-0 w-px bg-cf-border" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-cf-high w-3/4" style={{ borderRadius: 2 }} />
              <div className="h-2 bg-cf-elevated w-1/3" style={{ borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center border border-dashed border-cf" style={{ borderRadius: 4 }}>
        <p className="font-technical text-sm text-cf">No activity yet</p>
        <p className="font-caps text-cf-3 mt-1">Actions on this project will appear here</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Stitch vertical timeline line — 1px border-subtle */}
      <div className="absolute left-2.5 top-3 bottom-3 w-px bg-cf-border" />

      <div className="space-y-0 divide-y divide-cf">
        {activities.map((log, idx) => {
          const dotClass  = ACTION_DOT[log.action]  ?? ACTION_DOT.DEFAULT;
          const iconColor = ACTION_ICON_COLOR[log.action] ?? ACTION_ICON_COLOR.DEFAULT;
          return (
            <div key={log.id} className="flex items-start gap-4 py-3 hover:bg-cf-hover transition-colors pl-0">
              {/* Timeline dot — Stitch circle style */}
              <div className={`relative z-10 shrink-0 w-5 h-5 rounded-full border ${dotClass} flex items-center justify-center mt-0.5`}>
                <span className={`font-technical text-[8px] font-bold ${iconColor}`}>
                  {log.user.firstName[0]}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-cf-2 leading-snug">
                  <ActivityMessage log={log} />
                </p>
                <p className="mt-0.5 font-technical text-[10px] text-cf-3">
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
