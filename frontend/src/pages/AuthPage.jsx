import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AuthForm } from '../components/AuthForm.jsx';
import * as authService from '../services/authService.js';
import { setSession } from '../store/authSlice.js';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { useTheme } from '../hooks/useTheme.jsx';

export const AuthPage = ({ isRegister = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { theme, toggle } = useTheme();

  const submit = async (values) => {
    setIsSubmitting(true);
    try {
      const session = await (isRegister ? authService.register(values) : authService.login(values));
      dispatch(setSession(session));
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      navigate('/app');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-8 sm:px-4 sm:py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-cf-cyan/20 via-transparent to-cf-teal/20" />

      <header className="absolute left-0 top-0 z-20 flex w-full items-center justify-between px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="cf-logo-round h-11 w-11 sm:h-12 sm:w-12">
            <img src="/images/logo.png" alt="CloudFlow" />
          </span>
          <span className="font-geist text-2xl font-semibold tracking-tight text-cf-cyan sm:text-3xl">CloudFlow</span>
        </Link>
        <button onClick={toggle} className="cf-btn-ghost rounded-full px-3 py-1.5 text-xs" title="Toggle theme">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <section className="relative z-10 grid w-full max-w-5xl gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-end rounded-2xl border border-cf bg-cf-card p-8 shadow-elevated backdrop-blur-xl animate-fade-in">
          <p className="cf-section-label mb-3">Creative workflow platform</p>
          <h2 className="font-geist text-5xl font-semibold leading-[0.95] text-cf">
            Plan Clearly.
            <br />
            Build Boldly.
          </h2>
          <p className="mt-5 max-w-sm text-cf-2">
            CloudFlow keeps projects, tasks, discussions, and delivery in one visual command center.
          </p>
        </div>

        <div className="level-2-surface animate-slide-up p-5 sm:p-7 lg:p-10">
          <h1 className="mb-2 font-geist text-2xl font-semibold text-cf sm:text-3xl">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mb-5 text-sm text-cf-2 sm:mb-7">
            {isRegister ? 'Start your workspace in minutes.' : 'Sign in to continue your flow.'}
          </p>

          <AuthForm isRegister={isRegister} onSubmit={submit} isSubmitting={isSubmitting} />

          <div className="mt-7 text-sm text-cf-2">
            {isRegister ? 'Already have an account? ' : 'New to CloudFlow? '}
            <Link className="font-semibold text-cf-cyan hover:opacity-80 transition-opacity" to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in now.' : 'Sign up now.'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
