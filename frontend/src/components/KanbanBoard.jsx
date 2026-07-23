import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { fetchTasks, moveTask } from '../store/taskSlice.js';

const columns = [
  { id: 'TODO', title: 'To Do', accent: 'border-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', accent: 'border-blue-500' },
  { id: 'TESTING', title: 'Testing', accent: 'border-amber-500' },
  { id: 'COMPLETED', title: 'Completed', accent: 'border-emerald-500' },
];

const TaskCard = ({ task, dragHandleProps, isOverlay = false, onClick }) => <article onClick={onClick} {...dragHandleProps} className={`rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 cursor-pointer hover:shadow-md ${isOverlay ? 'rotate-2 shadow-lg' : ''}`}><p className="font-medium text-slate-800">{task.title}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-500">{task.priority}</span>{task.assignee && <span className="text-xs text-slate-500">{task.assignee.firstName}</span>}</div>{task.labels.length > 0 && <div className="mt-2 flex gap-1">{task.labels.slice(0, 2).map((label) => <span key={label.id} style={{ backgroundColor: label.color }} className="rounded px-1.5 py-0.5 text-[10px] text-white">{label.label}</span>)}</div>}</article>;

const DraggableTask = ({ task, onTaskSelect }) => {
  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({ id: task.id, data: { type: 'task', status: task.status } });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: task.id, data: { type: 'task', status: task.status } });
  const setNodeRef = (node) => { setDraggableRef(node); setDroppableRef(node); };
  return <div ref={setNodeRef} className={isOver ? 'rounded-lg ring-2 ring-primary' : ''} style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 }} {...attributes}><TaskCard task={task} dragHandleProps={listeners} onClick={() => onTaskSelect?.(task.id)} /></div>;
};

const BoardColumn = ({ column, tasks, onTaskSelect }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', status: column.id } });
  return <section ref={setNodeRef} className={`min-h-72 rounded-xl border-t-4 bg-slate-100 p-3 ${column.accent} ${isOver ? 'bg-blue-50' : ''}`}><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{column.title}</h3><span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{tasks.length}</span></div><div className="space-y-2">{tasks.map((task) => <DraggableTask key={task.id} task={task} onTaskSelect={onTaskSelect} />)}</div></section>;
};

export const KanbanBoard = ({ projectId, onTaskSelect }) => {
  const dispatch = useDispatch(); const tasks = useSelector((state) => state.tasks.items); const [activeTask, setActiveTask] = useState(null); const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const orderedByStatus = (status, excludingId) => tasks.filter((task) => task.status === status && task.id !== excludingId).sort((a, b) => a.position - b.position);
  const onDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    const task = tasks.find((item) => item.id === active.id);
    if (!task) return;
    const overTask = tasks.find((item) => item.id === over.id);
    const targetStatus = overTask?.status ?? columns.find((column) => column.id === over.id)?.id;
    if (!targetStatus) return;
    const destination = orderedByStatus(targetStatus, task.id);
    const insertionIndex = overTask ? destination.findIndex((item) => item.id === overTask.id) : destination.length;
    const previous = destination[insertionIndex - 1]; const next = destination[insertionIndex];
    const position = previous && next ? (previous.position + next.position) / 2 : previous ? previous.position + 1 : next ? next.position - 1 : 0;
    try { await dispatch(moveTask({ projectId, id: task.id, status: targetStatus, position })).unwrap(); } catch (error) { dispatch(fetchTasks(projectId)); toast.error(getFriendlyErrorMessage(error)); }
  };
  return <section className="mt-6"><div className="mb-4"><h2 className="text-xl font-bold">Kanban board</h2><p className="text-sm text-slate-500">Drag tasks between columns to update their status and order. Click a task to view comments and attachments.</p></div><DndContext sensors={sensors} onDragStart={({ active }) => setActiveTask(tasks.find((task) => task.id === active.id))} onDragEnd={onDragEnd} onDragCancel={() => setActiveTask(null)}><div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">{columns.map((column) => <BoardColumn key={column.id} column={column} tasks={orderedByStatus(column.id)} onTaskSelect={onTaskSelect} />)}</div><DragOverlay>{activeTask ? <TaskCard task={activeTask} isOverlay /> : null}</DragOverlay></DndContext></section>;
};
