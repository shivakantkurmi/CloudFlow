import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService.js';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';

const STATUS_BADGE = {
  TODO:        'cf-badge-todo',
  IN_PROGRESS: 'cf-badge-in-progress',
  TESTING:     'cf-badge-testing',
  COMPLETED:   'cf-badge-completed',
};

const PRIORITY_BAR = {
  CRITICAL: 'bg-[#ffb4ab]',
  HIGH:     'bg-orange-400',
  MEDIUM:   'bg-amber-400',
  LOW:      'bg-cf-3',
};

/* ── Stat card ── */
const StatCard = ({ label, value, sub, accentClass = 'text-cf' }) => (
  <div className="level-1-surface p-4 flex flex-col gap-1">
    <p className="cf-section-label">{label}</p>
    <p className={`text-2xl font-geist font-semibold tracking-tight mt-1 ${accentClass}`}>
      {value ?? '—'}
    </p>
    {sub && <p className="font-technical text-[11px] text-cf-3 mt-0.5">{sub}</p>}
  </div>
);

/* ── Status progress bar ── */
const StatusSegment = ({ color, count, total, label }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return pct > 0 ? (
    <div
      className={`${color} h-full transition-all duration-700`}
      style={{ width: `${pct}%` }}
      title={`${label}: ${count}`}
    />
  ) : null;
};

export const DashboardPage = () => {
  const { user }       = useSelector(state => state.auth);
  const { currentOrg } = useSelector(state => state.orgs);
  const [stats, setStats]   = useState(null);
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

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-48 bg-cf-high rounded-sm" />
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4 bg-cf-border" style={{ borderRadius: 4 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-cf-base" />)}
          </div>
          <div className="h-16 bg-cf-base border border-cf" style={{ borderRadius: 4 }} />
          <div className="grid gap-px lg:grid-cols-2 bg-cf-border" style={{ borderRadius: 4 }}>
            <div className="h-64 bg-cf-base" />
            <div className="h-64 bg-cf-base" />
          </div>
        </div>
      </main>
    );
  }

  const totalTasks = stats?.myTaskCount || 1;
  const completionRate = stats?.myTaskCount
    ? Math.round(((stats.tasksByStatus?.COMPLETED ?? 0) / stats.myTaskCount) * 100)
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const statusSegments = [
    { key: 'TODO',        color: 'bg-cf-3/40',     label: 'To Do' },
    { key: 'IN_PROGRESS', color: 'bg-cf-teal',     label: 'In Progress' },
    { key: 'TESTING',     color: 'bg-amber-400',   label: 'Testing' },
    { key: 'COMPLETED',   color: 'bg-cf-cyan',     label: 'Done' },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="mb-7">
        <p className="cf-section-label mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cf-teal" />
          {currentOrg?.name}
        </p>
        <h1 className="font-geist text-2xl font-semibold text-cf tracking-tight">
          Good {greeting},{' '}
          <span className="text-cf-cyan">{user?.firstName}</span>
        </h1>
        <p className="mt-1 font-technical text-[12px] text-cf-3">
          Here's what's happening across your workspace.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="mb-5 grid gap-px sm:grid-cols-2 lg:grid-cols-4 bg-cf-border" style={{ borderRadius: 4, overflow: 'hidden' }}>
        <StatCard label="Active Projects"  value={stats?.projectCount}                 accentClass="text-cf" />
        <StatCard label="My Tasks"         value={stats?.myTaskCount}
          sub={`${stats?.myIncompleteTaskCount ?? 0} incomplete`}                       accentClass="text-cf-cyan" />
        <StatCard label="In Progress"      value={stats?.tasksByStatus?.IN_PROGRESS ?? 0} accentClass="text-cf-teal" />
        <StatCard label="Completion Rate"  value={`${completionRate}%`}
          sub="of assigned tasks"
          accentClass={completionRate >= 70 ? 'text-cf-teal' : 'text-amber-400'} />
      </div>

      {/* ── Status breakdown bar ── */}
      <div className="mb-5 level-1-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-technical text-xs text-cf">Task Status Breakdown</p>
          <p className="font-caps text-cf-3">{stats?.myTaskCount ?? 0} total</p>
        </div>
        {/* Progress bar */}
        <div className="flex h-1 overflow-hidden gap-px">
          {statusSegments.map(({ key, color, label }) => (
            <StatusSegment
              key={key}
              color={color}
              count={stats?.tasksByStatus?.[key] ?? 0}
              total={totalTasks}
              label={label}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
          {statusSegments.map(({ key, color, label }) => (
            <div key={key} className="flex items-center gap-1.5 font-technical text-[11px] text-cf-3">
              <span className={`h-2 w-2 ${color}`} style={{ borderRadius: 1 }} />
              {label} ({stats?.tasksByStatus?.[key] ?? 0})
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-col content ── */}
      <div className="grid gap-px lg:grid-cols-2 bg-cf-border" style={{ borderRadius: 4, overflow: 'hidden' }}>

        {/* Priority tasks */}
        <section className="level-1-surface p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cf">
            <h2 className="font-technical text-xs text-cf uppercase tracking-wider">My Priority Tasks</h2>
            <Link to="/app" className="font-caps text-cf-cyan hover:opacity-80 transition-opacity">
              All projects →
            </Link>
          </div>

          {!stats?.recentTasks?.length ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="font-technical text-sm text-cf">All caught up</p>
              <p className="font-caps text-cf-3 mt-1">No pending tasks assigned to you</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-cf">
              {stats.recentTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}?task=${task.id}`}
                  className="flex items-start gap-3 py-2.5 hover:bg-cf-hover transition-colors first:pt-0 last:pb-0"
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_BAR[task.priority] ?? 'bg-cf-3'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-cf line-clamp-1">{task.title}</p>
                      <span className={`shrink-0 ${STATUS_BADGE[task.status] ?? 'cf-badge-todo'}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-0.5 font-technical text-[11px] text-cf-cyan">{task.project.key}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section className="level-1-surface p-4">
          <div className="mb-4 pb-3 border-b border-cf">
            <h2 className="font-technical text-xs text-cf uppercase tracking-wider">Recent Activity</h2>
          </div>

          {!stats?.recentActivity?.length ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="font-technical text-sm text-cf-3">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              {/* Timeline vertical line */}
              <div className="absolute left-2.5 top-2 bottom-0 w-px bg-cf-border" />
              {stats.recentActivity.slice(0, 8).map((log, idx) => (
                <div key={log.id} className="flex gap-3 relative z-10">
                  {/* Timeline dot */}
                  <div className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${idx === 0 ? 'border-cf-teal bg-cf-elevated' : 'border-cf bg-cf-elevated'}`}>
                    <span className={`font-technical text-[8px] font-bold ${idx === 0 ? 'text-cf-teal' : 'text-cf-3'}`}>
                      {log.user.firstName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cf leading-snug">
                      <span className="font-semibold">{log.user.firstName}</span>{' '}
                      <span className="text-cf-2">{log.action.toLowerCase().replace('_', ' ')} · {log.entityType.toLowerCase()}</span>
                    </p>
                    <p className="mt-0.5 font-technical text-[10px] text-cf-3">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
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
