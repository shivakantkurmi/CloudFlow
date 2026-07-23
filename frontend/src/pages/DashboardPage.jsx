import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService.js';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';

const StatusBadge = ({ status }) => {
  const colors = {
    TODO: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    TESTING: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${colors[status] || colors.TODO}`}>{status.replace('_', ' ')}</span>;
};

export const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error(getFriendlyErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <main className="p-8 text-center text-slate-500">Loading dashboard...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome back, {user?.firstName}!</h1>
        <p className="mt-2 text-lg text-slate-500">Here's a quick overview of your workspace.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 animate-slide-up">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Active Projects</h3>
          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{stats?.projectCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">My Tasks</h3>
          <p className="mt-3 text-4xl font-bold tracking-tight text-primary">{stats?.myTaskCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">To Do</h3>
          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{stats?.tasksByStatus?.TODO || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">In Progress</h3>
          <p className="mt-3 text-4xl font-bold tracking-tight text-indigo-600">{stats?.tasksByStatus?.IN_PROGRESS || 0}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">My Priority Tasks</h2>
          </div>
          {stats?.recentTasks?.length > 0 ? (
            <div className="divide-y">
              {stats.recentTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}?task=${task.id}`}
                  className="block py-3 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600">{task.project.key}</span>
                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      </div>
                      <div className="mt-1 flex gap-2">
                        <StatusBadge status={task.status} />
                        <span className="text-xs text-slate-500">{task.priority} Priority</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
              No pending tasks!
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-800">Recent Activity</h2>
          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 10).map(log => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {log.user.firstName[0]}{log.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-slate-800">
                      <span className="font-semibold">{log.user.firstName} {log.user.lastName}</span>
                      {' '}performed {log.action} on {log.entityType}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
              No recent activity.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
