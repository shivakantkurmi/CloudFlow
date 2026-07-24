import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { createTask, deleteTask, fetchTasks, updateTask } from '../store/taskSlice.js';

const statuses = ['TODO', 'IN_PROGRESS', 'TESTING', 'COMPLETED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const PRIORITY_COLOR = {
  CRITICAL: 'bg-rose-500',
  HIGH: 'bg-orange-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-slate-400',
};

const STATUS_BADGE = {
  TODO: 'cf-badge-todo',
  IN_PROGRESS: 'cf-badge-in-progress',
  TESTING: 'cf-badge-testing',
  COMPLETED: 'cf-badge-completed',
};

const toPayload = (values) => ({
  ...values,
  assigneeId: values.assigneeId || null,
  dueDate: values.dueDate || null,
  labels: values.labels
    ? values.labels.split(',').map(l => l.trim()).filter(Boolean).map(l => ({ label: l }))
    : []
});

const pretty = v => v.replace('_', ' ').toLowerCase().replace(/^./, c => c.toUpperCase());

const TaskForm = ({ form, members, onCancel, submitLabel }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <label className="block sm:col-span-2">
      <span className="cf-section-label mb-1.5 block">Title</span>
      <input className="cf-input" placeholder="Task title…" {...form.register('title', { required: true })} />
    </label>
    <label className="block">
      <span className="cf-section-label mb-1.5 block">Assignee</span>
      <select className="cf-input" {...form.register('assigneeId')}>
        <option value="">Unassigned</option>
        {members.map(m => <option key={m.userId} value={m.userId}>{m.user.firstName} {m.user.lastName}</option>)}
      </select>
    </label>
    <label className="block">
      <span className="cf-section-label mb-1.5 block">Priority</span>
      <select className="cf-input" {...form.register('priority')}>
        {priorities.map(p => <option key={p}>{p}</option>)}
      </select>
    </label>
    <label className="block">
      <span className="cf-section-label mb-1.5 block">Status</span>
      <select className="cf-input" {...form.register('status')}>
        {statuses.map(s => <option key={s}>{s}</option>)}
      </select>
    </label>
    <label className="block">
      <span className="cf-section-label mb-1.5 block">Due date</span>
      <input className="cf-input" type="date" {...form.register('dueDate')} />
    </label>
    <label className="block sm:col-span-2">
      <span className="cf-section-label mb-1.5 block">Labels <span className="normal-case font-normal text-cf-3">(comma-separated)</span></span>
      <input className="cf-input" placeholder="bug, frontend, ux" {...form.register('labels')} />
    </label>
    <label className="block sm:col-span-2">
      <span className="cf-section-label mb-1.5 block">Description</span>
      <textarea rows="2" className="cf-input" placeholder="What needs to be done?" {...form.register('description')} />
    </label>
    <div className="flex items-center gap-3 sm:col-span-2">
      <button type="submit" className="cf-btn-primary">{submitLabel}</button>
      {onCancel && <button type="button" onClick={onCancel} className="cf-btn-ghost">Cancel</button>}
    </div>
  </div>
);

export const TaskManager = ({ projectId, members, onTaskSelect }) => {
  const dispatch = useDispatch();
  const { items, status } = useSelector(state => state.tasks);
  const [editingTask, setEditingTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const createForm = useForm({ defaultValues: { status: 'TODO', priority: 'MEDIUM' } });
  const editForm = useForm();

  useEffect(() => { dispatch(fetchTasks(projectId)); }, [dispatch, projectId]);

  const saveNew = async (values) => {
    try {
      await dispatch(createTask({ projectId, ...toPayload(values) })).unwrap();
      createForm.reset({ status: 'TODO', priority: 'MEDIUM' });
      setShowCreate(false);
      toast.success('Task created.');
    } catch (error) { toast.error(getFriendlyErrorMessage(error)); }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    editForm.reset({
      title: task.title, description: task.description ?? '', assigneeId: task.assigneeId ?? '',
      status: task.status, priority: task.priority, dueDate: task.dueDate?.slice(0, 10) ?? '',
      labels: task.labels.map(l => l.label).join(', ')
    });
  };

  const saveEdit = async (values) => {
    try {
      await dispatch(updateTask({ projectId, id: editingTask.id, ...toPayload(values) })).unwrap();
      setEditingTask(null);
      toast.success('Task updated.');
    } catch (error) { toast.error(getFriendlyErrorMessage(error)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await dispatch(deleteTask({ projectId, id })).unwrap(); toast.success('Task deleted.'); }
    catch (error) { toast.error(getFriendlyErrorMessage(error)); }
  };

  return (
    <div className="space-y-4">
      {/* Create task */}
      {showCreate ? (
        <div className="cf-surface rounded-2xl p-5 animate-slide-down">
          <h3 className="text-sm font-semibold text-cf mb-4">New Task</h3>
          <form onSubmit={createForm.handleSubmit(saveNew)}>
            <TaskForm form={createForm} members={members} onCancel={() => setShowCreate(false)} submitLabel="Create task" />
          </form>
        </div>
      ) : (
        <button onClick={() => setShowCreate(true)} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-cf-strong p-3.5 text-sm text-cf-2 hover:text-cf hover:border-cf transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add a task…
        </button>
      )}

      {/* Edit task modal overlay */}
      {editingTask && (
        <div className="cf-surface rounded-2xl border border-primary-DEFAULT/30 p-5 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-cf">Edit: {editingTask.title}</h3>
            <button onClick={() => setEditingTask(null)} className="cf-btn-ghost p-1 rounded-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={editForm.handleSubmit(saveEdit)}>
            <TaskForm form={editForm} members={members} onCancel={() => setEditingTask(null)} submitLabel="Save changes" />
          </form>
        </div>
      )}

      {/* Task list */}
      {status === 'loading' ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="cf-surface rounded-xl p-4 animate-pulse flex gap-3">
              <div className="h-4 w-4 rounded-full bg-cf-elevated" />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded-md bg-cf-elevated w-3/5" />
                <div className="h-3 rounded-md bg-cf-elevated w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-cf-3">No tasks yet. Create one above.</p>
      ) : (
        <div className="space-y-2">
          {items.map(task => (
            <article
              key={task.id}
              onClick={() => onTaskSelect?.(task.id)}
              className="task-card flex items-start gap-3"
            >
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_COLOR[task.priority] ?? 'bg-slate-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-cf">{task.title}</h3>
                  <span className={`shrink-0 ${STATUS_BADGE[task.status] ?? 'cf-badge-todo'}`}>{pretty(task.status)}</span>
                </div>
                {task.description && (
                  <p className="mt-1 text-xs text-cf-3 line-clamp-1">{task.description}</p>
                )}
                {task.labels.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {task.labels.map(label => (
                      <span key={label.id} style={{ backgroundColor: label.color + '22', color: label.color }} className="rounded-full px-1.5 py-px text-[10px] font-medium">
                        {label.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-3 text-[10px] text-cf-3">
                  <span>{task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}</span>
                  {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => startEdit(task)} className="cf-btn-ghost p-1.5 rounded-lg text-xs font-medium">
                  Edit
                </button>
                <button onClick={() => remove(task.id)} className="cf-btn-ghost p-1.5 rounded-lg text-xs font-medium text-rose-500 hover:text-rose-600">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
