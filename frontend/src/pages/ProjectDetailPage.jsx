import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { addProjectMember, deleteProject, fetchMembers, fetchProject, removeProjectMember, updateProject } from '../store/projectSlice.js';
import { TaskManager } from '../components/TaskManager.jsx';
import { KanbanBoard } from '../components/KanbanBoard.jsx';
import { TaskDetailsModal } from '../components/TaskDetailsModal.jsx';
import { ActivityTimeline } from '../components/ActivityTimeline.jsx';
import { joinProjectRoom, leaveProjectRoom } from '../services/socketClient.js';

const ROLE_COLOR = {
  PROJECT_MANAGER: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  DEVELOPER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  TESTER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  VIEWER: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const TAB_VIEWS = [
  { id: 'board', label: 'Board', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/></svg> },
  { id: 'list', label: 'Tasks', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  { id: 'activity', label: 'Activity', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
  { id: 'members', label: 'Members', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, members } = useSelector(state => state.projects);
  const [editing, setEditing] = useState(false);
  const [taskView, setTaskView] = useState('board');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { role: 'DEVELOPER' } });
  const editForm = useForm();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('task');
    if (taskId) { setSelectedTaskId(taskId); navigate(`/projects/${id}`, { replace: true }); }
  }, [location.search, navigate, id]);

  useEffect(() => {
    dispatch(fetchProject(id))
      .unwrap()
      .catch((err) => {
        toast.error(getFriendlyErrorMessage(err));
        navigate('/');
      });
    dispatch(fetchMembers(id))
      .unwrap()
      .catch(() => {});
  }, [dispatch, id, navigate]);
  useEffect(() => { joinProjectRoom(id); return () => leaveProjectRoom(id); }, [id]);
  useEffect(() => {
    if (current) editForm.reset({ name: current.name, description: current.description ?? '', visibility: current.visibility, status: current.status });
  }, [current, editForm]);

  const invite = async (values) => {
    try { await dispatch(addProjectMember({ id, ...values })).unwrap(); reset(); toast.success('Member added.'); }
    catch (error) { toast.error(getFriendlyErrorMessage(error)); }
  };
  const remove = async (userId) => {
    try { await dispatch(removeProjectMember({ id, userId })).unwrap(); toast.success('Member removed.'); }
    catch (error) { toast.error(getFriendlyErrorMessage(error)); }
  };
  const saveProject = async (values) => {
    try { await dispatch(updateProject({ id, ...values })).unwrap(); setEditing(false); toast.success('Project updated.'); }
    catch (error) { toast.error(getFriendlyErrorMessage(error)); }
  };
  const removeProject = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try { await dispatch(deleteProject(id)).unwrap(); toast.success('Project deleted.'); navigate('/'); }
    catch (error) { toast.error(getFriendlyErrorMessage(error)); }
  };

  if (!current) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-24 rounded-lg bg-cf-elevated" />
          <div className="h-10 w-2/3 rounded-xl bg-cf-elevated" />
          <div className="h-4 w-full rounded-lg bg-cf-elevated" />
        </div>
      </main>
    );
  }

  const isManager = current.userRole === 'PROJECT_MANAGER';

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 animate-fade-in">
      {/* Breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-cf-2 hover:text-cf transition-colors mb-6">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {current.organization?.name ?? 'Projects'}
      </Link>

      {/* Project header */}
      <div className="cf-surface rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="inline-flex items-center rounded-lg bg-primary-light dark:bg-primary-DEFAULT/15 px-2.5 py-1 text-xs font-bold text-primary-DEFAULT dark:text-primary-dark font-mono">
                {current.key}
              </span>
              {current.organization?.name && (
                <span className="text-xs text-cf-3 font-medium">{current.organization.name}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-cf sm:text-3xl">{current.name}</h1>
            <p className="mt-2 text-sm text-cf-2 max-w-2xl leading-relaxed">
              {current.description || 'No project description.'}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-cf-3">
              <span>{current.taskCount ?? 0} tasks</span>
              <span>·</span>
              <span>{current.memberCount ?? members.length} members</span>
              {!isManager && (
                <span className="ml-1 cf-badge text-cf-3 bg-cf-elevated">View Only</span>
              )}
            </div>
          </div>

          {isManager && (
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => setEditing(!editing)} className="cf-btn-secondary text-xs">
                {editing ? 'Cancel' : 'Edit'}
              </button>
              <button onClick={removeProject} className="cf-btn-danger text-xs">Delete</button>
            </div>
          )}
        </div>

        {/* Inline edit form */}
        {editing && isManager && (
          <form onSubmit={editForm.handleSubmit(saveProject)} className="mt-6 pt-6 border-t border-cf grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="cf-section-label mb-1.5 block">Name</span>
              <input className="cf-input" {...editForm.register('name', { required: true })} />
            </label>
            <label className="block">
              <span className="cf-section-label mb-1.5 block">Visibility</span>
              <select className="cf-input" {...editForm.register('visibility')}>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </label>
            <label className="block">
              <span className="cf-section-label mb-1.5 block">Status</span>
              <select className="cf-input" {...editForm.register('status')}>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="cf-section-label mb-1.5 block">Description</span>
              <textarea rows="2" className="cf-input" {...editForm.register('description')} />
            </label>
            <div>
              <button type="submit" className="cf-btn-primary text-sm">Save changes</button>
            </div>
          </form>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-none">
        {TAB_VIEWS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTaskView(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              taskView === tab.id
                ? 'bg-primary-DEFAULT/10 text-primary-DEFAULT dark:text-primary-dark border border-primary-DEFAULT/20'
                : 'text-cf-2 hover:text-cf hover:bg-cf-elevated'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {taskView === 'board' && <KanbanBoard projectId={id} onTaskSelect={setSelectedTaskId} />}
      {taskView === 'list' && <TaskManager projectId={id} members={members} onTaskSelect={setSelectedTaskId} />}
      {taskView === 'activity' && <ActivityTimeline projectId={id} />}

      {taskView === 'members' && (
        <div className="cf-surface rounded-2xl p-6 sm:p-8">
          <h2 className="text-base font-semibold text-cf mb-6">Team Members</h2>

          {/* Invite form */}
          <form onSubmit={handleSubmit(invite)} className={`flex flex-col sm:flex-row gap-3 mb-8 pb-8 border-b border-cf ${!isManager ? 'opacity-40 pointer-events-none select-none' : ''}`}>
            <input
              disabled={!isManager}
              className="cf-input flex-1"
              placeholder="Invite by email address…"
              type="email"
              {...register('email', { required: true })}
            />
            <select disabled={!isManager} className="cf-input sm:w-44" {...register('role')}>
              <option value="DEVELOPER">Developer</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="TESTER">Tester</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button disabled={!isManager} type="submit" className="cf-btn-primary shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite
            </button>
          </form>

          {/* Member list */}
          <div className="space-y-2">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between rounded-xl p-3 hover:bg-cf-elevated transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-xs font-bold text-white">
                    {member.user.firstName[0]}{member.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cf">{member.user.firstName} {member.user.lastName}</p>
                    <p className="text-xs text-cf-3">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`cf-badge text-xs font-semibold ${ROLE_COLOR[member.role] ?? ''}`}>
                    {member.role.replace('_', ' ')}
                  </span>
                  {isManager && (
                    <button onClick={() => remove(member.userId)} className="cf-btn-ghost text-rose-500 hover:text-rose-600 p-1.5 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTaskId && <TaskDetailsModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
    </main>
  );
};
