import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { createProject, fetchProjects } from '../store/projectSlice.js';

export const ProjectsPage = () => {
  const dispatch = useDispatch(); const { items, status } = useSelector((state) => state.projects); const [isCreating, setIsCreating] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { visibility: 'PRIVATE' } });
  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);
  const submit = async (values) => { try { await dispatch(createProject(values)).unwrap(); reset(); setIsCreating(false); toast.success('Project created.'); } catch (error) { toast.error(getFriendlyErrorMessage(error)); } };
  const inputClass = 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2';
  return <main className="mx-auto max-w-6xl p-6"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold text-primary">CLOUDFLOW</p><h1 className="text-3xl font-bold">Projects</h1></div><button onClick={() => setIsCreating(!isCreating)} className="rounded-md bg-primary px-4 py-2 font-medium text-white">{isCreating ? 'Cancel' : 'New project'}</button></div>
    {isCreating && <form onSubmit={handleSubmit(submit)} className="mb-8 grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2"><label>Name<input className={inputClass} {...register('name', { required: 'Name is required' })} />{errors.name && <small>{errors.name.message}</small>}</label><label>Key<input className={inputClass} placeholder="CLOUD" {...register('key', { required: 'Key is required', pattern: { value: /^[A-Za-z][A-Za-z0-9_]{1,9}$/, message: 'Use 2–10 letters, numbers, or underscores' } })} />{errors.key && <small>{errors.key.message}</small>}</label><label className="md:col-span-2">Description<textarea className={inputClass} rows="3" {...register('description')} /></label><label>Visibility<select className={inputClass} {...register('visibility')}><option value="PRIVATE">Private</option><option value="PUBLIC">Public</option></select></label><div className="flex items-end"><button className="rounded-md bg-slate-900 px-4 py-2 text-white">Create project</button></div></form>}
    {status === 'loading' ? <p>Loading projects…</p> : <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((project) => <Link key={project.id} to={`/projects/${project.id}`} className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"><div className="flex justify-between"><span className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-primary">{project.key}</span><span className="text-xs text-slate-500">{project.visibility.toLowerCase()}</span></div><h2 className="mt-4 text-lg font-bold">{project.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-600">{project.description || 'No project description.'}</p><p className="mt-4 text-xs text-slate-500">{project.memberCount} members · {project.taskCount} tasks</p></Link>)}</section>}
    {status !== 'loading' && items.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-slate-600">Create your first project to get started.</p>}</main>;
};
