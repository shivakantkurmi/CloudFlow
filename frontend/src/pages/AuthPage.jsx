import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AuthForm } from '../components/AuthForm.jsx';
import * as authService from '../services/authService.js';
import { setSession } from '../store/authSlice.js';
import { getFriendlyErrorMessage } from '../utils/errorHandler.js';
import { useTheme } from '../hooks/useTheme.jsx';

export const AuthPage = ({ isRegister = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modeReady, setModeReady] = useState(false);
  const location = useLocation();
  const [wipePhase, setWipePhase] = useState(() => location.state?.authTransition ? 'cover' : 'idle');
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setModeReady(false);
    const frame = requestAnimationFrame(() => setModeReady(true));
    return () => cancelAnimationFrame(frame);
  }, [isRegister]);

  useEffect(() => {
    if (!location.state?.authTransition) return undefined;
    const frame = requestAnimationFrame(() => setWipePhase('reveal'));
    return () => cancelAnimationFrame(frame);
  }, [location.key, location.state]);

  useEffect(() => {
    if (wipePhase !== 'reveal') return undefined;
    const timer = window.setTimeout(() => setWipePhase('idle'), 760);
    return () => window.clearTimeout(timer);
  }, [wipePhase]);

  const switchAuthMode = (event, path) => {
    event.preventDefault();
    if (wipePhase !== 'idle' || path === (isRegister ? '/register' : '/login')) return;
    setWipePhase('cover');
    window.setTimeout(() => navigate(path, { state: { authTransition: true } }), 720);
  };

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
    <main className={`auth-page-enter auth-wipe-${wipePhase} relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-8 sm:px-4 sm:py-10`}>
      <div className="absolute inset-0 bg-gradient-to-br from-cf-cyan/20 via-transparent to-cf-teal/20" />
      <div className="auth-transition-wipe" aria-hidden="true" />

      <header className="auth-brand-enter absolute left-0 top-0 z-20 flex w-full items-center justify-between px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
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

      <section className="relative z-10 grid w-full max-w-4xl gap-4 sm:gap-5 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-end rounded-2xl border border-cf shadow-elevated animate-fade-in relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2400&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10">
            <p className="font-geist text-sm font-semibold tracking-widest text-cf-cyan uppercase mb-3">Creative workflow platform</p>
            <h2 className="font-geist text-5xl font-semibold leading-[0.95] text-white">
              Plan Clearly.
              <br />
              Build Boldly.
            </h2>
            <p className="mt-5 max-w-sm text-white/80">
              CloudFlow keeps projects, tasks, discussions, and delivery in one visual command center.
            </p>
          </div>
        </div>

        <div className={`auth-card-enter auth-card--${isRegister ? 'register' : 'login'} ${modeReady ? 'is-mode-ready' : ''} level-2-surface p-5 sm:p-6 lg:p-7`}>
          <div className="auth-mode-orb" aria-hidden="true" />
          <div className="auth-mode-toggle" aria-label="Choose authentication mode">
            <Link to="/login" onClick={(event) => switchAuthMode(event, '/login')} className={!isRegister ? 'active' : ''}>Sign In</Link>
            <Link to="/register" onClick={(event) => switchAuthMode(event, '/register')} className={isRegister ? 'active' : ''}>Sign Up</Link>
          </div>
          <h1 className="mb-2 font-geist text-2xl font-semibold text-cf sm:text-3xl">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mb-5 text-sm text-cf-2 sm:mb-7">
            {isRegister ? 'Start your workspace in minutes.' : 'Sign in to continue your flow.'}
          </p>

          <AuthForm isRegister={isRegister} onSubmit={submit} isSubmitting={isSubmitting} />

          <p className="mt-6 text-center text-xs text-cf-3">{isRegister ? 'Already have an account? Use Sign In above.' : 'New to CloudFlow? Use Sign Up above.'}</p>
        </div>
      </section>
    </main>
  );
};
