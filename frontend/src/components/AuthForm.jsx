import { useForm } from 'react-hook-form';
export const AuthForm = ({ isRegister, onSubmit, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const fieldClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary-light';
  return <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
    {isRegister && <div className="grid grid-cols-2 gap-3"><label>First name<input className={fieldClass} {...register('firstName', { required: 'First name is required' })} />{errors.firstName && <small className="text-red-500">{errors.firstName.message}</small>}</label><label>Last name<input className={fieldClass} {...register('lastName', { required: 'Last name is required' })} />{errors.lastName && <small className="text-red-500">{errors.lastName.message}</small>}</label></div>}
    <label className="block">Email<input className={fieldClass} type="email" {...register('email', { required: 'Email is required' })} />{errors.email && <small className="text-red-500">{errors.email.message}</small>}</label>
    <label className="block">Password<input className={fieldClass} type="password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' }, ...(isRegister && { pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: 'Password needs an uppercase, lowercase, and number' } }) })} />{errors.password && <small className="text-red-500">{errors.password.message}</small>}</label>
    <button className="mt-2 w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/40 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</button>
  </form>;
};
