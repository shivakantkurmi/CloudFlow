import { useForm } from 'react-hook-form';
import { useTheme } from '../hooks/useTheme.jsx';

export const AuthForm = ({ isRegister, onSubmit, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {isRegister && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-cf-2 uppercase tracking-wider">First name</span>
            <input className="cf-input" placeholder="John" {...register('firstName', { required: 'Required' })} />
            {errors.firstName && <small>{errors.firstName.message}</small>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-cf-2 uppercase tracking-wider">Last name</span>
            <input className="cf-input" placeholder="Doe" {...register('lastName', { required: 'Required' })} />
            {errors.lastName && <small>{errors.lastName.message}</small>}
          </label>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-cf-2 uppercase tracking-wider">Email</span>
        <input className="cf-input" type="email" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
        {errors.email && <small>{errors.email.message}</small>}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-cf-2 uppercase tracking-wider">Password</span>
        <input className="cf-input" type="password" placeholder="••••••••" {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Minimum 8 characters' },
          ...(isRegister && { pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: 'Needs uppercase, lowercase, and number' } })
        })} />
        {errors.password && <small>{errors.password.message}</small>}
      </label>

      <button className="cf-btn-primary w-full py-3 mt-2 text-base" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Please wait…
          </span>
        ) : isRegister ? 'Create account' : 'Sign in'}
      </button>
    </form>
  );
};
