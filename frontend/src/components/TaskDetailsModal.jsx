import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchComments, addComment, deleteComment, fetchAttachments, uploadAttachment, deleteAttachment, setCurrentTask, clearCurrentTask } from '../store/collaborationSlice.js';
import { getAttachmentDownloadUrl } from '../services/collaborationService.js';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';

export const TaskDetailsModal = ({ taskId, onClose }) => {
  const dispatch = useDispatch();
  const task = useSelector(state => state.tasks.items.find(t => t.id === taskId));
  const { comments, attachments, status } = useSelector(state => state.collaboration);
  const currentUser = useSelector(state => state.auth.user);
  
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    dispatch(setCurrentTask(taskId));
    dispatch(fetchComments(taskId));
    dispatch(fetchAttachments(taskId));
    return () => dispatch(clearCurrentTask());
  }, [dispatch, taskId]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-bold">{task.title}</h2>
            <p className="mt-1 flex gap-2 text-sm text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5">{task.status}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5">{task.priority} Priority</span>
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-800">Description</h3>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">{task.description || 'No description provided.'}</p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Attachments Section */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Attachments</h3>
                <label className="cursor-pointer rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
                  Upload File
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                </label>
              </div>
              
              <div className="flex flex-col gap-2">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{att.fileName}</p>
                        <p className="text-xs text-slate-500">
                          {(att.fileSize / 1024).toFixed(1)} KB • {new Date(att.uploadedAt).toLocaleDateString()} by {att.uploadedBy.firstName}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a href={getAttachmentDownloadUrl(taskId, att.id)} download={att.fileName} target="_blank" rel="noreferrer" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </a>
                      {(currentUser?.id === att.uploadedBy.id || currentUser?.role === 'ADMIN') && (
                        <button onClick={() => dispatch(deleteAttachment({ taskId, attachmentId: att.id }))} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {attachments.length === 0 && <p className="rounded-lg border border-dashed p-4 text-center text-sm text-slate-500">No attachments yet.</p>}
              </div>
            </section>
            
            {/* Comments Section */}
            <section className="flex flex-col">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Comments</h3>
              
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-sm">
                      {comment.author.firstName[0]}{comment.author.lastName[0]}
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-none bg-slate-100 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{comment.author.firstName} {comment.author.lastName}</span>
                        <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">{comment.content}</p>
                      {(currentUser?.id === comment.author.id || currentUser?.role === 'ADMIN') && (
                        <button onClick={() => dispatch(deleteComment({ taskId, commentId: comment.id }))} className="mt-2 text-xs font-medium text-slate-400 hover:text-red-600">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
              </div>
              
              <form onSubmit={handleAddComment} className="mt-6 flex gap-3">
                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-sm">
                   {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                 </div>
                 <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    rows="2"
                  />
                  <div className="mt-2 flex justify-end">
                    <button type="submit" disabled={!commentText.trim()} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50">
                      Post Comment
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
