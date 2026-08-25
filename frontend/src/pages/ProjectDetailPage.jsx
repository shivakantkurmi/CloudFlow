import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { addProjectMember, deleteProject, fetchMembers, fetchProject, removeProjectMember, updateProject } from '../store/projectSlice.js';
import { fetchTasks } from '../store/taskSlice.js';
import { setCurrentOrg } from '../store/orgSlice.js';
import { TaskManager } from '../components/TaskManager.jsx';
import { KanbanBoard } from '../components/KanbanBoard.jsx';
import { TaskDetailsModal } from '../components/TaskDetailsModal.jsx';
import { ActivityTimeline } from '../components/ActivityTimeline.jsx';
import { joinProjectRoom, leaveProjectRoom } from '../services/socketClient.js';

/* Role → badge class mapping */
const ROLE_BADGE = {
  PROJECT_MANAGER: 'cf-badge-role-manager',
  DEVELOPER:       'cf-badge-role-developer',
  TESTER:          'cf-badge-role-tester',
  VIEWER:          'cf-badge-role-viewer',
};

/* Tab definitions */
const TAB_VIEWS = [
  {
    id: 'board', label: 'Board',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/></svg>,
  },
  {
    id: 'list', label: 'Tasks',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  },
  {
    id: 'activity', label: 'Activity',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    id: 'members', label: 'Members',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
];

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, members } = useSelector(state => state.projects);
  const [editing, setEditing]           = useState(false);
  const [taskView, setTaskView]         = useState('board');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { register, handleSubmit, reset }   = useForm({ defaultValues: { role: 'DEVELOPER' } });
  const editForm = useForm();

  /* Open task modal from URL param */
  useEffect(() => {
    const params  = new URLSearchParams(location.search);
    const taskId  = params.get('task');
    if (taskId) { setSelectedTaskId(taskId); navigate(`/projects/${id}`, { replace: true }); }
  }, [location.search, navigate, id]);

  useEffect(() => {
    dispatch(fetchProject(id)).unwrap().then(project => {
      if (project && project.organizationId) {
        // Sync the workspace without waiting for orgs to load
        dispatch(setCurrentOrg({ id: project.organizationId, name: project.organization?.name || 'Workspace' }));
      }
    }).catch(err => { toast.error(getFriendlyErrorMessage(err)); navigate('/app'); });
    dispatch(fetchMembers(id)).unwrap().catch(() => {});
    dispatch(fetchTasks(id)).unwrap().catch(() => {});
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
    try { await dispatch(deleteProject(id)).unwrap(); toast.success('Project deleted.'); navigate('/app'); }
    catch (error) { toast.error(getFriendlyErrorMessage(error)); }
  };

  /* Loading skeleton */
  if (!current) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-cf-high rounded-sm" />
          <div className="h-8 w-2/3 bg-cf-high rounded-sm" />
          <div className="h-3 w-full bg-cf-elevated rounded-sm" />
        </div>
      </main>
    );
  }

  const isManager = current.userRole === 'PROJECT_MANAGER';

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 animate-fade-in">

      {/* Breadcrumb */}
      <Link to="/app" className="inline-flex items-center gap-1.5 font-caps text-cf-3 hover:text-cf transition-colors mb-5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        {current.organization?.name ?? 'Projects'}
      </Link>

      {/* ── Project header ── */}
      <div className="level-1-surface p-5 mb-px">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="cf-badge-key">{current.key}</span>
              {current.organization?.name && (
                <span className="font-caps text-cf-3">{current.organization.name}</span>
              )}
              {!isManager && (
                <span className="font-caps text-cf-3 border border-cf px-2 py-0.5" style={{ borderRadius: 2 }}>
                  View Only
                </span>
              )}
            </div>
            <h1 className="font-geist text-xl font-semibold text-cf tracking-tight sm:text-2xl">{current.name}</h1>
            <p className="mt-1.5 text-sm text-cf-2 max-w-2xl leading-relaxed">
              {current.description || 'No project description.'}
            </p>
            <div className="mt-3 flex items-center gap-3 font-technical text-[11px] text-cf-3">
              <span>{current.taskCount ?? 0} tasks</span>
              <span className="text-cf-border">·</span>
              <span>{current.memberCount ?? members.length} members</span>
            </div>
          </div>

          {isManager && (
            <div className="flex shrink-0 items-center gap-2">
              <button id="edit-project-btn" onClick={() => setEditing(!editing)} className="cf-btn-secondary">
                {editing ? 'Cancel' : 'Edit'}
              </button>
              <button id="delete-project-btn" onClick={removeProject} className="cf-btn-danger">Delete</button>
            </div>
          )}
        </div>

        {/* Inline edit form */}
        {editing && isManager && (
          <form onSubmit={editForm.handleSubmit(saveProject)} className="mt-5 pt-5 border-t border-cf grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="cf-section-label mb-2 block">Name</span>
              <input className="cf-input" {...editForm.register('name', { required: true })} />
            </label>
            <label className="block">
              <span className="cf-section-label mb-2 block">Visibility</span>
              <select className="cf-input" {...editForm.register('visibility')}>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </label>
            <label className="block">
              <span className="cf-section-label mb-2 block">Status</span>
              <select className="cf-input" {...editForm.register('status')}>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="cf-section-label mb-2 block">Description</span>
              <textarea rows="2" className="cf-input" {...editForm.register('description')} />
            </label>
            <div>
              <button type="submit" className="cf-btn-primary">Save Changes</button>
            </div>
          </form>
        )}
      </div>

      {/* ── Tab navigation ── */}
      <div className="flex items-center border-b border-cf mb-5 overflow-x-auto scrollbar-none">
        {TAB_VIEWS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setTaskView(tab.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 font-technical text-xs whitespace-nowrap border-b-2 transition-colors ${
              taskView === tab.id
                ? 'border-cf-cyan text-cf-cyan'
                : 'border-transparent text-cf-3 hover:text-cf'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {taskView === 'board'    && <KanbanBoard    projectId={id} onTaskSelect={setSelectedTaskId} />}
      {taskView === 'list'     && <TaskManager    projectId={id} members={members} onTaskSelect={setSelectedTaskId} />}
      {taskView === 'activity' && <ActivityTimeline projectId={id} />}

      {/* ── Members tab ── */}
      {taskView === 'members' && (
        <div className="level-1-surface p-5">
          <h2 className="font-technical text-xs text-cf uppercase tracking-wider mb-5 pb-3 border-b border-cf">Team Members</h2>

          {/* Invite form */}
          <form
            onSubmit={handleSubmit(invite)}
            className={`flex flex-col sm:flex-row gap-2 mb-6 pb-6 border-b border-cf ${!isManager ? 'opacity-40 pointer-events-none select-none' : ''}`}
          >
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
            <button disabled={!isManager} type="submit" id="invite-member-btn" className="cf-btn-primary shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              Invite
            </button>
          </form>

          {/* Member list */}
          <div className="space-y-0 divide-y divide-cf">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between py-3 hover:bg-cf-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="cf-avatar h-8 w-8 text-[10px]">
                    {member.user.firstName[0]}{member.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cf">{member.user.firstName} {member.user.lastName}</p>
                    <p className="font-technical text-[11px] text-cf-3">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${ROLE_BADGE[member.role] ?? 'cf-badge-role-viewer'}`}>
                    {member.role.replace('_', ' ')}
                  </span>
                  {isManager && (
                    <button onClick={() => remove(member.userId)} className="cf-btn-ghost p-1 text-[#ffb4ab] hover:text-[#ff8a80]">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task detail modal */}
      {selectedTaskId && <TaskDetailsModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
    </main>
  );
};
