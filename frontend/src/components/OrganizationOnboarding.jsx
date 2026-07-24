import { useDispatch, useSelector } from 'react-redux';
import { createOrganization } from '../store/orgSlice.js';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { useTheme } from '../hooks/useTheme.jsx';

export const OrganizationOnboarding = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { theme, toggle } = useTheme();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await dispatch(createOrganization(data)).unwrap();
      toast.success('Organization created!');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-cf overflow-hidden p-4">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary-DEFAULT/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent-violet/6 blur-3xl" />
      </div>

      <button onClick={toggle} className="absolute top-4 right-4 cf-btn-ghost p-2 rounded-full z-10">
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <img
            src="/images/logo.png"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
            className="h-9 w-auto max-w-[140px] object-contain"
            alt="CloudFlow"
          />
          <div style={{ display: 'none' }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-white shadow-glow">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span className="text-lg font-bold text-cf">CloudFlow</span>
        </div>

        <h1 className="text-2xl font-bold text-cf">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋
        </h1>
        <p className="mt-2 text-sm text-cf-2 mb-8">
          Create your first organization to start managing projects and inviting your team.
        </p>

        <div className="cf-surface rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="cf-section-label mb-1.5 block">Organization name</span>
              <input
                className="cf-input"
                placeholder="Acme Corp, My Team…"
                autoFocus
                {...register('name', { required: 'Organization name is required' })}
              />
              {errors.name && <small>{errors.name.message}</small>}
            </label>

            <button type="submit" disabled={isSubmitting} className="cf-btn-primary w-full py-3">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating…
                </span>
              ) : 'Create organization'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};
