import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService.js';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';

const STATUS_BADGE = {
  TODO: 'cf-badge-todo',
  IN_PROGRESS: 'cf-badge-in-progress',
  TESTING: 'cf-badge-testing',
  COMPLETED: 'cf-badge-completed',
};

const PRIORITY_DOT = {
  CRITICAL: 'bg-rose-500',
  HIGH: 'bg-orange-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-slate-400 dark:bg-slate-600',
};

const StatCard = ({ label, value, sub, accent }) => (
  <div className="cf-surface rounded-2xl p-5 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
    <p className="cf-section-label">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${accent ?? 'text-cf'}`}>{value ?? '—'}</p>
    {sub && <p className="mt-1 text-xs text-cf-3">{sub}</p>}
  </div>
);

export const DashboardPage = () => {
  const { user } = useSelector(state => state.auth);
  const { currentOrg } = useSelector(state => state.orgs);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentOrg) return;
      setLoading(true);
      try { setStats(await getDashboardStats(currentOrg.id)); }
      catch (error) { toast.error(getFriendlyErrorMessage(error)); }
      finally { setLoading(false); }
    };
    load();
  }, [currentOrg]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-xl bg-cf-elevated" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-cf-elevated" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 rounded-2xl bg-cf-elevated" />
            <div className="h-64 rounded-2xl bg-cf-elevated" />
          </div>
        </div>
      </main>
    );
  }

  const completionRate = stats?.myTaskCount
    ? Math.round(((stats.tasksByStatus?.COMPLETED ?? 0) / stats.myTaskCount) * 100)
    : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="cf-section-label mb-1">{currentOrg?.name}</p>
        <h1 className="text-2xl font-bold text-cf">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.firstName}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-cf-2">Here's what's happening across your workspace.</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={stats?.projectCount} accent="text-cf" />
        <StatCard label="My Tasks" value={stats?.myTaskCount} sub={`${stats?.myIncompleteTaskCount ?? 0} incomplete`} accent="text-primary-DEFAULT dark:text-primary-dark" />
        <StatCard label="In Progress" value={stats?.tasksByStatus?.IN_PROGRESS ?? 0} accent="text-blue-500" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} sub="of assigned tasks" accent={completionRate >= 70 ? 'text-emerald-500' : 'text-amber-500'} />
      </div>

      {/* Progress bar */}
      <div className="mb-8 cf-surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-cf">Task Status Breakdown</p>
          <p className="text-xs text-cf-3">{stats?.myTaskCount ?? 0} total tasks</p>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          {[
            { key: 'TODO', color: 'bg-slate-300 dark:bg-slate-700' },
            { key: 'IN_PROGRESS', color: 'bg-blue-500' },
            { key: 'TESTING', color: 'bg-amber-400' },
            { key: 'COMPLETED', color: 'bg-emerald-500' },
          ].map(({ key, color }) => {
            const count = stats?.tasksByStatus?.[key] ?? 0;
            const total = stats?.myTaskCount || 1;
            const pct = (count / total) * 100;
            return pct > 0 ? (
              <div key={key} className={`${color} transition-all duration-500`} style={{ width: `${pct}%` }} title={`${key}: ${count}`} />
            ) : null;
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
          {[
            { key: 'TODO', label: 'To Do', color: 'bg-slate-300 dark:bg-slate-700' },
            { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
            { key: 'TESTING', label: 'Testing', color: 'bg-amber-400' },
            { key: 'COMPLETED', label: 'Done', color: 'bg-emerald-500' },
          ].map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-cf-3">
              <span className={`h-2 w-2 rounded-full ${color}`} />
              {label} ({stats?.tasksByStatus?.[key] ?? 0})
            </div>
          ))}
        </div>
      </div>

      {/* Two-col content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priority tasks */}
        <section className="cf-surface rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-cf">My Priority Tasks</h2>
            <Link to="/" className="text-xs font-medium text-primary-DEFAULT dark:text-primary-dark hover:opacity-80">
              All projects →
            </Link>
          </div>

          {!stats?.recentTasks?.length ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-3xl mb-2">🎉</span>
              <p className="text-sm font-medium text-cf">All caught up!</p>
              <p className="text-xs text-cf-3 mt-1">No pending tasks assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}?task=${task.id}`}
                  className="flex items-start gap-3 rounded-xl p-3 hover:bg-cf-elevated transition-colors"
                >
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[task.priority] ?? 'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-cf line-clamp-1">{task.title}</p>
                      <span className={`shrink-0 text-[10px] ${STATUS_BADGE[task.status] ?? 'cf-badge-todo'}`}>{task.status.replace('_', ' ')}</span>
                    </div>
                    <p className="mt-0.5 text-xs font-bold text-primary-DEFAULT dark:text-primary-dark">{task.project.key}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section className="cf-surface rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-cf mb-5">Recent Activity</h2>

          {!stats?.recentActivity?.length ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-3xl mb-2">📭</span>
              <p className="text-sm text-cf-3">No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 8).map(log => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-[9px] font-bold text-white">
                    {log.user.firstName[0]}{log.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-xs text-cf leading-snug">
                      <span className="font-semibold">{log.user.firstName}</span>{' '}
                      <span className="text-cf-2">{log.action.toLowerCase().replace('_', ' ')} · {log.entityType.toLowerCase()}</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-cf-3">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
