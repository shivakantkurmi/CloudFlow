import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchComments, addComment, deleteComment, fetchAttachments, uploadAttachment, deleteAttachment, setCurrentTask, clearCurrentTask } from '../store/collaborationSlice.js';
import { getAttachmentDownloadUrl } from '../services/collaborationService.js';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';

const PRIORITY_BADGE = {
  CRITICAL: 'cf-badge-critical',
  HIGH: 'cf-badge-high',
  MEDIUM: 'cf-badge-medium',
  LOW: 'cf-badge-low',
};

const STATUS_BADGE = {
  TODO: 'cf-badge-todo',
  IN_PROGRESS: 'cf-badge-in-progress',
  TESTING: 'cf-badge-testing',
  COMPLETED: 'cf-badge-completed',
};

export const TaskDetailsModal = ({ taskId, onClose }) => {
  const dispatch = useDispatch();
  const task = useSelector(state => state.tasks.items.find(t => t.id === taskId));
  const { comments, attachments, status } = useSelector(state => state.collaboration);
  const currentUser = useSelector(state => state.auth.user);

  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    dispatch(setCurrentTask(taskId));
    dispatch(fetchComments(taskId));
    dispatch(fetchAttachments(taskId));
    return () => dispatch(clearCurrentTask());
  }, [dispatch, taskId]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await dispatch(addComment({ taskId, content: commentText })).unwrap();
      setCommentText('');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await dispatch(uploadAttachment({ taskId, file })).unwrap();
      toast.success('Attachment uploaded');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!task) return null;

  const initials = (user) => `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="flex w-full sm:max-w-4xl flex-col rounded-none sm:rounded-2xl bg-cf-card border border-cf shadow-elevated overflow-hidden max-h-screen sm:max-h-[90vh] animate-slide-up">

        {/* Header */}
        <header className="flex items-start gap-4 border-b border-cf p-5 sm:p-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`${STATUS_BADGE[task.status] ?? 'cf-badge-todo'}`}>{task.status.replace('_', ' ')}</span>
              <span className={`${PRIORITY_BADGE[task.priority] ?? 'cf-badge-low'}`}>{task.priority}</span>
              {task.labels.map(label => (
                <span key={label.id} style={{ backgroundColor: label.color + '22', color: label.color }} className="cf-badge text-[10px] font-medium rounded-full">
                  {label.label}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-bold text-cf leading-tight">{task.title}</h2>
            {task.assignee && (
              <p className="mt-1 text-xs text-cf-3">
                Assigned to <span className="font-medium text-cf-2">{task.assignee.firstName} {task.assignee.lastName}</span>
                {task.dueDate && <> · Due <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span></>}
              </p>
            )}
          </div>
          <button onClick={onClose} className="cf-btn-ghost p-2 rounded-full shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Description */}
        {task.description && (
          <div className="px-5 sm:px-6 py-4 border-b border-cf">
            <p className="text-xs font-semibold uppercase tracking-wider text-cf-3 mb-2">Description</p>
            <p className="whitespace-pre-wrap text-sm text-cf-2 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 sm:px-6 pt-3 border-b border-cf">
          {[
            { id: 'comments', label: `Comments (${comments.length})` },
            { id: 'attachments', label: `Attachments (${attachments.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-DEFAULT text-primary-DEFAULT dark:text-primary-dark'
                  : 'border-transparent text-cf-3 hover:text-cf'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">

          {/* Comments tab */}
          {activeTab === 'comments' && (
            <div className="flex flex-col gap-4">
              {comments.length === 0 && (
                <p className="text-sm text-cf-3 text-center py-6">No comments yet. Start the conversation!</p>
              )}
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-xs font-bold text-white">
                    {initials(comment.author)}
                  </div>
                  <div className="flex-1 bg-cf-elevated rounded-2xl rounded-tl-none p-3.5">
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-cf">{comment.author.firstName} {comment.author.lastName}</span>
                      <span className="text-[10px] text-cf-3">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-cf-2 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    {currentUser?.id === comment.author.id && (
                      <button onClick={() => dispatch(deleteComment({ taskId, commentId: comment.id }))} className="mt-2 text-[10px] text-cf-3 hover:text-rose-500 transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Comment input */}
              <form onSubmit={handleAddComment} className="flex gap-3 mt-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-xs font-bold text-white">
                  {initials(currentUser ?? { firstName: '?', lastName: '' })}
                </div>
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddComment(e); }}
                    placeholder="Write a comment… (⌘+Enter to post)"
                    className="cf-input resize-none"
                    rows="2"
                  />
                  <div className="mt-2 flex justify-end">
                    <button type="submit" disabled={!commentText.trim()} className="cf-btn-primary text-xs py-1.5 px-3">
                      Post
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Attachments tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-cf-3">{attachments.length === 0 ? 'No files attached yet.' : `${attachments.length} file(s) attached`}</p>
                <label className="cf-btn-secondary cursor-pointer text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attach file
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                </label>
              </div>

              {attachments.map(att => (
                <div key={att.id} className="flex items-center gap-3 rounded-xl border border-cf p-3 hover:bg-cf-elevated transition-colors">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light dark:bg-primary-DEFAULT/15 text-primary-DEFAULT dark:text-primary-dark">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-cf">{att.fileName}</p>
                    <p className="text-xs text-cf-3">{(att.fileSize / 1024).toFixed(1)} KB · by {att.uploadedBy.firstName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a href={getAttachmentDownloadUrl(taskId, att.id)} download={att.fileName} target="_blank" rel="noreferrer"
                      className="cf-btn-ghost p-1.5 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                    {(currentUser?.id === att.uploadedBy.id || currentUser?.role === 'ADMIN') && (
                      <button onClick={() => dispatch(deleteAttachment({ taskId, attachmentId: att.id }))} className="cf-btn-ghost p-1.5 rounded-lg text-rose-500 hover:text-rose-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
