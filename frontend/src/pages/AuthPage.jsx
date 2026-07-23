import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AuthForm } from '../components/AuthForm.jsx';
import * as authService from '../services/authService.js';
import { setSession } from '../store/authSlice.js';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
export const AuthPage = ({ isRegister = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false); const dispatch = useDispatch(); const navigate = useNavigate();
  const submit = async (values) => { setIsSubmitting(true); try { const session = await (isRegister ? authService.register(values) : authService.login(values)); dispatch(setSession(session)); toast.success(isRegister ? 'Account created.' : 'Welcome back.'); navigate('/'); } catch (error) { toast.error(getFriendlyErrorMessage(error)); } finally { setIsSubmitting(false); } };
  return (
    <main className="flex min-h-screen bg-white">
      {/* Left side - Decorative */}
      <section className="hidden lg:flex w-1/2 flex-col justify-between bg-gradient-to-br from-primary via-indigo-600 to-purple-800 p-12 text-white">
        <div>
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>
            </div>
            CloudFlow
          </div>
          <h2 className="mt-24 text-4xl font-bold leading-tight xl:text-5xl">
            Streamline your workflow. <br />
            <span className="text-primary-light">Ship faster together.</span>
          </h2>
          <p className="mt-6 text-lg text-primary-light max-w-md">
            CloudFlow is the ultimate workspace for modern teams to plan, build, and deploy production software.
          </p>
        </div>
        <div className="animate-fade-in">
          <p className="text-sm font-medium text-white/70">© 2026 CloudFlow Inc.</p>
        </div>
      </section>

      {/* Right side - Form */}
      <section className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 xl:p-24 bg-background">
        <div className="w-full max-w-md animate-slide-up glass-panel rounded-2xl p-8 sm:p-10">
          <div className="lg:hidden mb-8 flex items-center gap-2 font-bold text-2xl tracking-tight text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>
            </div>
            CloudFlow
          </div>
          
          <h1 className="mb-2 text-3xl font-bold text-slate-900 tracking-tight">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="mb-8 text-slate-500">
            {isRegister ? 'Enter your details below to create your workspace.' : 'Enter your credentials to access your workspace.'}
          </p>
          
          <AuthForm isRegister={isRegister} onSubmit={submit} isSubmitting={isSubmitting} />
          
          <p className="mt-8 text-center text-sm text-slate-600">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link className="font-semibold text-primary hover:text-primary-hover transition-colors" to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};
