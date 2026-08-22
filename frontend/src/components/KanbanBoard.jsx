import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { fetchTasks, moveTask } from '../store/taskSlice.js';

/* ── Priority indicator colors ── */
const PRIORITY_BAR = {
  CRITICAL: 'bg-[#ffb4ab]',
  HIGH:     'bg-orange-400',
  MEDIUM:   'bg-amber-400',
  LOW:      'bg-cf-3',
};

/* ── Column definitions ── */
const COLUMN_META = {
  TODO: {
    label:    'TODO',
    dotClass: '',
    countClass: 'text-cf-3',
  },
  IN_PROGRESS: {
    label:    'IN PROGRESS',
    dotClass: 'bg-cf-teal',
    countClass: 'text-cf-teal',
  },
  TESTING: {
    label:    'TESTING',
    dotClass: 'bg-amber-400',
    countClass: 'text-amber-400',
  },
  COMPLETED: {
    label:    'DONE',
    dotClass: 'bg-cf-cyan',
    countClass: 'text-cf-cyan',
  },
};

const columns = [
  { id: 'TODO' },
  { id: 'IN_PROGRESS' },
  { id: 'TESTING' },
  { id: 'COMPLETED' },
];

/* ── Task card — Stitch "level-2-surface" design ── */
const TaskCard = ({ task, dragHandleProps, isOverlay = false, onClick }) => {
  return (
    <article
      onClick={onClick}
      {...dragHandleProps}
      className={`task-card cursor-pointer group ${isOverlay ? 'rotate-1 scale-105 opacity-90' : ''}`}
    >
      {/* Task ID + assignee row */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-technical text-[10px] text-cf-3">{task.project?.key ?? ''}–{task.id?.slice(-4)}</span>
        {task.assignee ? (
          <div className="cf-avatar h-4 w-4 text-[7px] shrink-0" title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
            {task.assignee.firstName[0]}
          </div>
        ) : (
          <div className="h-4 w-4 rounded-full border border-cf bg-cf-elevated shrink-0" />
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-cf leading-snug line-clamp-2 mb-2">{task.title}</p>

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map(label => (
            <span key={label.id} style={{ color: label.color, background: label.color + '18', border: `1px solid ${label.color}33`, borderRadius: 999 }} className="font-technical text-[9px] px-1.5 py-px">
              {label.label}
            </span>
          ))}
        </div>
      )}

      {/* Footer row: priority + status indicator */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 ${PRIORITY_BAR[task.priority] ?? 'bg-cf-3'}`} style={{ borderRadius: 1 }} />
          <span className="font-caps text-cf-3">{task.priority}</span>
        </div>
        {task.status === 'IN_PROGRESS' && (
          <span className="font-technical text-[10px] text-cf-teal flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cf-teal" />
          </span>
        )}
        {task.status === 'COMPLETED' && (
          <svg className="w-3 h-3 text-cf-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        )}
      </div>
    </article>
  );
};

/* ── Draggable wrapper ── */
const DraggableTask = ({ task, onTaskSelect }) => {
  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({ id: task.id, data: { type: 'task', status: task.status } });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: task.id, data: { type: 'task', status: task.status } });
  const setNodeRef = (node) => { setDraggableRef(node); setDroppableRef(node); };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1, transition: 'opacity 0.15s' }}
      className={isOver ? 'outline outline-1 outline-cf-cyan' : ''}
      {...attributes}
    >
      <TaskCard task={task} dragHandleProps={listeners} onClick={() => onTaskSelect?.(task.id)} />
    </div>
  );
};

/* ── Kanban column — Stitch style with left border divider ── */
const BoardColumn = ({ column, tasks, onTaskSelect }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', status: column.id } });
  const meta = COLUMN_META[column.id];

  return (
    <section ref={setNodeRef} className={`kanban-col ${isOver ? 'is-over' : ''}`}>
      {/* Column header */}
      <div className="kanban-col-header mb-3 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 font-caps ${meta.countClass}`}>
          {meta.dotClass && <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />}
          {meta.label}
        </div>
        <span className="kanban-count-badge font-technical text-[11px] text-cf-3">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-1.5">
        {tasks.length === 0 ? (
          <div className="kanban-empty">Drop tasks here</div>
        ) : (
          tasks.map(task => <DraggableTask key={task.id} task={task} onTaskSelect={onTaskSelect} />)
        )}
      </div>
    </section>
  );
};

/* ── Board ── */
export const KanbanBoard = ({ projectId, onTaskSelect }) => {
  const dispatch = useDispatch();
  const tasks    = useSelector(state => state.tasks.items);
  const [activeTask, setActiveTask] = useState(null);
  const sensors  = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const orderedByStatus = (status, excludingId) =>
    tasks.filter(t => t.status === status && t.id !== excludingId).sort((a, b) => a.position - b.position);

  const onDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    const task = tasks.find(t => t.id === active.id);
    if (!task) return;
    const overTask      = tasks.find(t => t.id === over.id);
    const targetStatus  = overTask?.status ?? columns.find(c => c.id === over.id)?.id;
    if (!targetStatus) return;
    const destination   = orderedByStatus(targetStatus, task.id);
    const insertionIndex = overTask ? destination.findIndex(t => t.id === overTask.id) : destination.length;
    const previous      = destination[insertionIndex - 1];
    const next          = destination[insertionIndex];
    const position      = previous && next ? (previous.position + next.position) / 2 : previous ? previous.position + 1 : next ? next.position - 1 : 0;
    try { await dispatch(moveTask({ projectId, id: task.id, status: targetStatus, position })).unwrap(); }
    catch (error) { dispatch(fetchTasks(projectId)); toast.error(getFriendlyErrorMessage(error)); }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveTask(tasks.find(t => t.id === active.id))}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="-mx-2 overflow-x-auto px-2 pb-4">
        <div className="kanban-shell flex min-w-max lg:min-w-0 lg:grid lg:grid-cols-4">
          {columns.map(col => (
            <div key={col.id} className="w-[272px] shrink-0 sm:w-[290px] lg:w-auto lg:shrink">
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
