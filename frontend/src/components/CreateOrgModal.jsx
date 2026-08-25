import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createOrganization } from '../store/orgSlice.js';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { useEffect, useRef } from 'react';

export const CreateOrgModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await dispatch(createOrganization(data)).unwrap();
      toast.success('Workspace created!');
      onClose();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-cf-backdrop p-4 backdrop-blur-sm animate-fade-in"
      onMouseDown={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-md level-2-surface animate-scale-in"
      >
        <div className="flex items-center justify-between border-b border-cf px-5 py-4">
          <h2 className="font-geist text-lg font-semibold text-cf">Create Workspace</h2>
          <button 
            onClick={onClose}
            className="cf-btn-ghost flex h-8 w-8 items-center justify-center rounded-full"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5">
          <p className="text-sm text-cf-2 mb-4">
            A workspace is where you can organize projects and collaborate with your team.
          </p>

          <label className="block mb-6">
            <span className="cf-section-label mb-1.5 block">Workspace Name</span>
            <input
              className="cf-input"
              placeholder="e.g. Acme Corp, My Team..."
              autoFocus
              {...register('name', { required: 'Workspace name is required' })}
            />
            {errors.name && <small className="mt-1 block text-xs text-rose-500">{errors.name.message}</small>}
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cf">
            <button
              type="button"
              onClick={onClose}
              className="cf-btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="cf-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
