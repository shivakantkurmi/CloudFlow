import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { createProject, fetchProjects } from '../store/projectSlice.js';

const STATUS_LABEL = {
  ACTIVE:   { text: 'Active',   cls: 'text-green-500' },
  ARCHIVED: { text: 'Archived', cls: 'text-gray-400' },
};

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
  </svg>
);

/* ── Project card ── */
const ProjectCard = ({ project }) => {
  const statusInfo = STATUS_LABEL[project.status] ?? { text: project.status?.toLowerCase(), cls: 'text-gray-400' };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative flex aspect-video flex-col justify-end overflow-hidden rounded-xl bg-cf-high transition-transform hover:scale-[1.02]"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(https://picsum.photos/seed/${project.id}/600/400)` }}
      />
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-10 opacity-95 transition-opacity group-hover:opacity-100"
        style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--cf-bg) 88%, transparent), color-mix(in srgb, var(--cf-bg) 52%, transparent), transparent)' }}
      />
      
      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <span className="cf-badge-key shadow-sm">
          {project.key}
        </span>
        <span className="flex items-center gap-1 rounded-full border border-cf bg-cf-card px-2 py-1 text-xs font-medium text-cf-2 backdrop-blur-md">
          {project.visibility === 'PRIVATE' ? <LockIcon /> : <GlobeIcon />}
          {project.visibility}
        </span>
      </div>

      {/* Card Body */}
      <div className="relative z-20 p-5 pt-12">
        <h2 className="mb-2 line-clamp-1 text-xl font-bold text-cf">
          {project.name}
        </h2>
        <p className="mb-4 min-h-[2.5rem] line-clamp-2 text-sm text-cf-2">
          {project.description || 'No description provided.'}
        </p>

        {/* Card footer */}
        <div className="flex items-center justify-between text-xs font-medium text-cf-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {project.memberCount ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              {project.taskCount ?? 0} tasks
            </span>
          </div>
          <span className={`flex items-center gap-1.5 ${statusInfo.cls}`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {statusInfo.text}
          </span>
        </div>
      </div>
    </Link>
  );
};

export const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { user }        = useSelector(state => state.auth);
  const { items, status } = useSelector(state => state.projects);
  const { currentOrg }  = useSelector(state => state.orgs);
  const [isCreating, setIsCreating] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { visibility: 'PRIVATE' }
  });

  const userMember      = currentOrg?.members?.find(m => m.userId === user?.id) || currentOrg?.members?.[0];
  const userRoleInOrg   = userMember?.role;
  const canCreateProject = userRoleInOrg === 'OWNER' || userRoleInOrg === 'ADMIN';

  useEffect(() => {
    if (currentOrg) dispatch(fetchProjects(currentOrg.id));
  }, [dispatch, currentOrg]);

  const submit = async (values) => {
    try {
      await dispatch(createProject({ ...values, organizationId: currentOrg.id })).unwrap();
      reset();
      setIsCreating(false);
      toast.success('Project created.');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {currentOrg && (
            <p className="mb-1 flex items-center gap-2 font-medium text-cf-2">
              <span className="w-2 h-2 rounded-full bg-cf-cyan" />
              {currentOrg.name}
            </p>
          )}
          <h1 className="font-geist text-4xl font-semibold tracking-tight text-cf">Projects</h1>
        </div>

        {canCreateProject ? (
          <button
            id="new-project-btn"
            onClick={() => setIsCreating(!isCreating)}
            className={isCreating ? 'cf-btn-secondary' : 'cf-btn-primary'}
          >
            {isCreating ? (
              <>
                <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                New Project
              </>
            )}
          </button>
        ) : (
          <span className="rounded-full border border-cf bg-cf-high px-3 py-1.5 text-xs font-bold uppercase text-cf-3">
            Admins only
          </span>
        )}
      </div>

      {/* ── Create form ── */}
      {isCreating && (
        <div className="mb-10 level-2-surface p-8 animate-slide-down">
          <h2 className="mb-6 border-b border-cf pb-4 font-geist text-xl font-semibold text-cf">New Project</h2>
          <form onSubmit={handleSubmit(submit)} className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-cf-2">Name</span>
              <input className="cf-input" placeholder="My Awesome Project" {...register('name', { required: 'Name is required' })} />
              {errors.name && <small className="text-red-500 mt-1 block text-sm">{errors.name.message}</small>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-cf-2">Key</span>
              <input className="cf-input font-mono uppercase" placeholder="PROJ" {...register('key', {
                required: 'Key is required',
                pattern: { value: /^[A-Za-z][A-Za-z0-9_]{1,9}$/, message: 'Use 2–10 letters/numbers' }
              })} />
              {errors.key && <small className="text-red-500 mt-1 block text-sm">{errors.key.message}</small>}
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-cf-2">Description</span>
              <textarea className="cf-input min-h-[100px]" placeholder="What is this project about?" {...register('description')} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-cf-2">Visibility</span>
              <select className="cf-input" {...register('visibility')}>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </label>
            <div className="flex items-end sm:col-span-2">
              <button type="submit" id="create-project-submit" disabled={isSubmitting} className="cf-btn-primary w-full sm:w-auto">
                {isSubmitting ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {status === 'loading' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl bg-cf-high animate-pulse aspect-video"></div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {status !== 'loading' && items.length === 0 && (
        <div className="level-2-surface flex flex-col items-center justify-center p-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cf-high mb-6 shadow-lg">
            <svg className="w-8 h-8 text-cf-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-cf">No projects yet</p>
          <p className="mt-2 text-cf-2">Create your first project to start tracking work</p>
          {canCreateProject && (
            <button onClick={() => setIsCreating(true)} className="cf-btn-primary mt-6">
              Create Project
            </button>
          )}
        </div>
      )}

      {/* ── Project grid ── */}
      {status !== 'loading' && items.length > 0 && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      )}
    </main>
  );
};
