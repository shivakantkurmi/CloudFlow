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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const submit = async (values) => {
    setIsSubmitting(true);
    try {
      const session = await (isRegister ? authService.register(values) : authService.login(values));
      dispatch(setSession(session));
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-cf">
      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute right-4 top-4 z-10 cf-btn-ghost p-2 rounded-full"
        title="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Left panel — brand/marketing */}
      <aside className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-surface-dark p-12">
        {/* Subtle gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-DEFAULT/20 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-accent-violet/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cyan/10 blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/images/logo.png"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
            className="h-10 w-auto max-w-[140px] object-contain"
            alt="CloudFlow"
          />
          <div style={{ display: 'none' }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-white shadow-glow">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">CloudFlow</span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
            Build faster.<br />
            <span className="text-gradient">Ship together.</span>
          </h2>
          <p className="mt-5 text-lg text-white/50 max-w-sm leading-relaxed">
            The modern workspace for teams that move fast. Plan sprints, ship code, and celebrate wins — all in one place.
          </p>

        </div>

        <p className="relative z-10 text-xs text-white/25">© 2026 CloudFlow, Inc.</p>
      </aside>

      {/* Right panel — form */}
      <section className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <img
              src="/images/logo.png"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.nextSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
              className="h-8 w-auto max-w-[120px] object-contain"
              alt="CloudFlow"
            />
            <div style={{ display: 'none' }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-cf">CloudFlow</span>
          </div>

          <h1 className="text-3xl font-bold text-cf tracking-tight">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-cf-2">
            {isRegister
              ? 'Create an account to start tracking work.'
              : 'Sign in to continue to your workspace.'}
          </p>

          <div className="mt-8 cf-surface rounded-2xl p-6 sm:p-8">
            <AuthForm isRegister={isRegister} onSubmit={submit} isSubmitting={isSubmitting} />
          </div>

          <p className="mt-6 text-center text-sm text-cf-2">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link
              className="font-semibold text-primary-DEFAULT dark:text-primary-dark hover:opacity-80 transition-opacity"
              to={isRegister ? '/login' : '/register'}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};
