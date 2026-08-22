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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 bg-cf">
      <div className="absolute inset-0 bg-gradient-to-br from-cf-cyan/20 via-transparent to-cf-teal/20" />

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
        <div className="mb-8 flex items-center gap-3">
          <span className="cf-logo-round h-12 w-12">
            <img src="/images/logo.png" alt="CloudFlow" />
          </span>
          <span className="font-geist text-3xl font-semibold tracking-tight text-cf-cyan">CloudFlow</span>
        </div>

        <div className="cf-section-label mb-2">// Setup workspace</div>
        <h1 className="font-geist text-2xl font-semibold text-cf tracking-tight">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="mt-2 text-sm text-cf-2 mb-8">
          Create your first organization to start managing projects and inviting your team.
        </p>

        <div className="level-2-surface p-6 mt-6">
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
