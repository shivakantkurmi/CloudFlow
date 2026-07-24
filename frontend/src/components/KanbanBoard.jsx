import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { fetchTasks, moveTask } from '../store/taskSlice.js';

const PRIORITY_DOT = {
  CRITICAL: 'bg-rose-500',
  HIGH: 'bg-orange-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-slate-400',
};

const STATUS_ACCENT = {
  TODO: 'border-t-slate-300 dark:border-t-slate-600',
  IN_PROGRESS: 'border-t-blue-500',
  TESTING: 'border-t-amber-500',
  COMPLETED: 'border-t-emerald-500',
};

const STATUS_META = {
  TODO: { label: 'To Do', icon: '○' },
  IN_PROGRESS: { label: 'In Progress', icon: '◑' },
  TESTING: { label: 'Testing', icon: '◕' },
  COMPLETED: { label: 'Done', icon: '●' },
};

const columns = [
  { id: 'TODO' },
  { id: 'IN_PROGRESS' },
  { id: 'TESTING' },
  { id: 'COMPLETED' },
];

const TaskCard = ({ task, dragHandleProps, isOverlay = false, onClick }) => (
  <article
    onClick={onClick}
    {...dragHandleProps}
    className={`task-card group ${isOverlay ? 'rotate-1 scale-105 shadow-card-hover' : ''}`}
  >
    <p className="text-sm font-medium text-cf leading-snug">{task.title}</p>

    {task.description && (
      <p className="mt-1.5 text-xs text-cf-3 line-clamp-2 leading-relaxed">{task.description}</p>
    )}

    {task.labels.length > 0 && (
      <div className="mt-2.5 flex flex-wrap gap-1">
        {task.labels.slice(0, 3).map(label => (
          <span
            key={label.id}
            style={{ backgroundColor: label.color + '22', color: label.color, borderColor: label.color + '44' }}
            className="rounded-full border px-1.5 py-px text-[10px] font-medium"
          >
            {label.label}
          </span>
        ))}
      </div>
    )}

    <div className="mt-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[task.priority] ?? 'bg-slate-400'}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-cf-3">{task.priority}</span>
      </div>
      {task.assignee ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-[9px] font-bold text-white shrink-0" title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
          {task.assignee.firstName[0]}
        </span>
      ) : (
        <span className="text-[10px] text-cf-3">Unassigned</span>
      )}
    </div>
  </article>
);

const DraggableTask = ({ task, onTaskSelect }) => {
  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({ id: task.id, data: { type: 'task', status: task.status } });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: task.id, data: { type: 'task', status: task.status } });
  const setNodeRef = (node) => { setDraggableRef(node); setDroppableRef(node); };

  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'rounded-xl ring-2 ring-primary-DEFAULT/50' : ''}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1, transition: 'opacity 0.15s' }}
      {...attributes}
    >
      <TaskCard task={task} dragHandleProps={listeners} onClick={() => onTaskSelect?.(task.id)} />
    </div>
  );
};

const BoardColumn = ({ column, tasks, onTaskSelect }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', status: column.id } });
  const meta = STATUS_META[column.id];

  return (
    <section
      ref={setNodeRef}
      className={`kanban-col border-t-2 ${STATUS_ACCENT[column.id]} ${isOver ? 'is-over' : ''}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base text-cf-2">{meta.icon}</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cf-2">{meta.label}</h3>
        </div>
        <span className="rounded-full bg-cf-card border border-cf px-2 py-0.5 text-xs font-semibold text-cf-3">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map(task => <DraggableTask key={task.id} task={task} onTaskSelect={onTaskSelect} />)}
      </div>
    </section>
  );
};

export const KanbanBoard = ({ projectId, onTaskSelect }) => {
  const dispatch = useDispatch();
  const tasks = useSelector(state => state.tasks.items);
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const orderedByStatus = (status, excludingId) =>
    tasks.filter(t => t.status === status && t.id !== excludingId).sort((a, b) => a.position - b.position);

  const onDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    const task = tasks.find(t => t.id === active.id);
    if (!task) return;
    const overTask = tasks.find(t => t.id === over.id);
    const targetStatus = overTask?.status ?? columns.find(c => c.id === over.id)?.id;
    if (!targetStatus) return;
    const destination = orderedByStatus(targetStatus, task.id);
    const insertionIndex = overTask ? destination.findIndex(t => t.id === overTask.id) : destination.length;
    const previous = destination[insertionIndex - 1];
    const next = destination[insertionIndex];
    const position = previous && next ? (previous.position + next.position) / 2 : previous ? previous.position + 1 : next ? next.position - 1 : 0;
    try { await dispatch(moveTask({ projectId, id: task.id, status: targetStatus, position })).unwrap(); }
    catch (error) { dispatch(fetchTasks(projectId)); toast.error(getFriendlyErrorMessage(error)); }
  };

  return (
    <DndContext sensors={sensors}
      onDragStart={({ active }) => setActiveTask(tasks.find(t => t.id === active.id))}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex gap-3 min-w-max lg:min-w-0 lg:grid lg:grid-cols-4">
          {columns.map(col => (
            <div key={col.id} className="w-[260px] sm:w-[280px] lg:w-auto shrink-0 lg:shrink">
              <BoardColumn column={col} tasks={orderedByStatus(col.id)} onTaskSelect={onTaskSelect} />
            </div>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
