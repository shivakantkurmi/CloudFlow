import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { createProject, fetchProjects } from '../store/projectSlice.js';

const STATUS_COLOR = {
  ACTIVE: 'text-emerald-500',
  ARCHIVED: 'text-cf-3',
};

const VISIBILITY_ICON = {
  PRIVATE: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  PUBLIC: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
    </svg>
  ),
};

export const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items, status } = useSelector(state => state.projects);
  const { currentOrg } = useSelector(state => state.orgs);
  const [isCreating, setIsCreating] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { visibility: 'PRIVATE' }
  });

  const userRoleInOrg = currentOrg?.members?.find(m => m.userId === user?.id)?.role;
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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {currentOrg && (
            <p className="cf-section-label mb-1">{currentOrg.name}</p>
          )}
          <h1 className="text-2xl font-bold text-cf">Projects</h1>
        </div>
        {canCreateProject ? (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className={isCreating ? 'cf-btn-secondary' : 'cf-btn-primary'}
          >
            {isCreating ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New project
              </>
            )}
          </button>
        ) : (
          <div className="text-xs font-semibold text-cf-3 bg-cf-elevated border border-cf rounded-xl px-4 py-2.5">
            Only Org Admins can create projects
          </div>
        )}
      </div>

      {/* Create project form */}
      {isCreating && (
        <div className="mb-8 cf-surface rounded-2xl p-6 animate-slide-down">
          <h2 className="mb-5 text-base font-semibold text-cf">New Project</h2>
          <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="cf-section-label mb-1.5 block">Name</span>
              <input className="cf-input" placeholder="My Awesome Project" {...register('name', { required: 'Name is required' })} />
              {errors.name && <small>{errors.name.message}</small>}
            </label>
            <label className="block">
              <span className="cf-section-label mb-1.5 block">Key</span>
              <input className="cf-input font-mono" placeholder="PROJ" {...register('key', {
                required: 'Key is required',
                pattern: { value: /^[A-Za-z][A-Za-z0-9_]{1,9}$/, message: 'Use 2–10 letters/numbers' }
              })} />
              {errors.key && <small>{errors.key.message}</small>}
            </label>
            <label className="block sm:col-span-2">
              <span className="cf-section-label mb-1.5 block">Description</span>
              <textarea className="cf-input" rows="2" placeholder="What is this project about?" {...register('description')} />
            </label>
            <label className="block">
              <span className="cf-section-label mb-1.5 block">Visibility</span>
              <select className="cf-input" {...register('visibility')}>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </label>
            <div className="flex items-end">
              <button type="submit" disabled={isSubmitting} className="cf-btn-primary">
                {isSubmitting ? 'Creating…' : 'Create project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Project grid */}
      {status === 'loading' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="cf-surface rounded-2xl p-5 animate-pulse">
              <div className="h-5 rounded-md bg-cf-elevated w-24 mb-4" />
              <div className="h-4 rounded-md bg-cf-elevated w-3/4 mb-2" />
              <div className="h-4 rounded-md bg-cf-elevated w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cf-strong p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cf-elevated mb-4">
            <svg className="w-6 h-6 text-cf-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-cf">No projects yet</p>
          <p className="mt-1 text-xs text-cf-3">Create your first project to start tracking work.</p>
          <button onClick={() => setIsCreating(true)} className="cf-btn-primary mt-5 text-xs">
            Create a project
          </button>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group cf-surface rounded-2xl p-5 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="inline-flex items-center rounded-lg bg-primary-light dark:bg-primary-DEFAULT/15 px-2 py-1 text-xs font-bold text-primary-DEFAULT dark:text-primary-dark font-mono">
                  {project.key}
                </span>
                <span className="flex items-center gap-1 text-xs text-cf-3">
                  {VISIBILITY_ICON[project.visibility]}
                  {project.visibility.toLowerCase()}
                </span>
              </div>

              <h2 className="text-base font-semibold text-cf group-hover:text-primary-DEFAULT dark:group-hover:text-primary-dark transition-colors line-clamp-1">
                {project.name}
              </h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-cf-2 min-h-[2.5rem]">
                {project.description || 'No description.'}
              </p>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-cf">
                <div className="flex items-center gap-3 text-xs text-cf-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.memberCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {project.taskCount ?? 0}
                  </span>
                </div>
                <span className={`text-xs font-medium ${STATUS_COLOR[project.status] ?? 'text-cf-3'}`}>
                  {project.status?.toLowerCase()}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
};
