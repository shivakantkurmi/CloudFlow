import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.jsx';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const NAV_ITEMS = ['Overview', 'Features', 'Modules', 'Start'];
const Arrow = ({ left = false }) => <svg className={left ? 'rotate-180' : ''} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>;
const AnimatedWords = ({ text }) => <span className="word-reveal">{text.split(' ').map((word, index) => <span key={`${word}-${index}`} style={{ '--word-delay': `${index * 90}ms` }}>{word}&nbsp;</span>)}</span>;

export const LandingPage = () => {
  const { theme, toggle } = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  const lastWheelChange = useRef(0);
  const showSlide = (index) => setActiveSlide((index + NAV_ITEMS.length) % NAV_ITEMS.length);
  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) < 12) return;
    const now = Date.now();
    if (now - lastWheelChange.current < 700) return;
    lastWheelChange.current = now;
    setActiveSlide((slide) => (slide + (event.deltaY > 0 ? 1 : -1) + NAV_ITEMS.length) % NAV_ITEMS.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % NAV_ITEMS.length), 7000);
    return () => window.clearInterval(timer);
  }, [activeSlide]);

  return <main className="landing-slideshow mx-auto flex h-[100dvh] w-full max-w-[1440px] flex-col overflow-hidden px-2.5 py-2.5 sm:px-5 sm:py-3 lg:px-8">
    <header className="relative z-30 shrink-0"><div className="landing-glass flex items-center justify-between rounded-full px-2.5 py-2 sm:px-5 sm:py-2.5">
      <Link to="/" className="flex items-center gap-2.5" aria-label="CloudFlow home"><span className="cf-logo-round h-10 w-10 sm:h-11 sm:w-11"><img src="/images/logo.png" alt="" /></span><span className="hidden font-geist text-lg font-semibold tracking-tight text-cf-cyan sm:inline sm:text-xl">CloudFlow</span></Link>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Landing slides">{NAV_ITEMS.map((item, index) => <button key={item} type="button" onClick={() => showSlide(index)} className={`cf-nav-link ${activeSlide === index ? 'active' : ''}`}>{item}</button>)}</nav>
      <div className="flex items-center gap-1.5 sm:gap-2"><button onClick={toggle} className="cf-btn-secondary rounded-full p-2" type="button" title="Toggle theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button><Link to="/login" className="cf-btn-secondary px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-xs">Sign In</Link><Link to="/register" className="cf-btn-primary px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-xs">Register</Link></div>
    </div></header>
    <div className="relative mt-2 min-h-0 flex-1 overflow-hidden rounded-3xl sm:mt-3" onWheel={handleWheel}>
      <section className={`landing-slide slide-overview cinematic-hero ${activeSlide === 0 ? 'is-active is-ready' : ''}`} aria-hidden={activeSlide !== 0}><div className="hero-grid" /><div className="hero-orbit hero-orbit-left" /><div className="hero-orbit hero-orbit-right" /><div className="hero-circuit hero-circuit-left"><i /><i /></div><div className="hero-circuit hero-circuit-right"><i /><i /></div><div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-24 pt-12 text-center sm:px-8"><p className="hero-kicker">CloudFlow workspace</p><h1 className="hero-title mt-4 max-w-4xl"><AnimatedWords text="Plan with focus." /><span><AnimatedWords text="Ship with momentum." /></span></h1><p className="hero-copy mt-5 max-w-xl text-sm sm:text-base">Bring projects, tasks, and team context into one calm command center built for delivery.</p><div className="hero-actions mt-7 flex flex-wrap justify-center gap-3"><Link to="/register" className="cf-btn-primary">Get started</Link><Link to="/login" className="cf-btn-secondary">Open workspace</Link></div></div></section>
      <section className={`landing-slide slide-from-right landing-feature-slide ${activeSlide === 1 ? 'is-active' : ''}`} aria-hidden={activeSlide !== 1}><div className="landing-feature-media" /><div className="relative z-10 grid h-full items-center gap-7 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-16"><div><p className="slide-eyebrow">Task execution</p><h2 className="slide-title mt-3"><AnimatedWords text="Move faster" /><AnimatedWords text="in flow." /></h2><p className="slide-copy mt-5">Turn priorities into progress with focused boards, clear ownership, and effortless task movement.</p><Link to="/register" className="cf-btn-primary mt-7">Build your board <Arrow /></Link></div><div className="slide-board-preview" aria-label="Task board preview"><div className="board-column"><span>To do</span><i /><i /></div><div className="board-column board-column-active"><span>In progress</span><i /><i /><i /></div><div className="board-column"><span>Done</span><i /></div></div></div></section>
      <section className={`landing-slide slide-from-bottom landing-module-slide ${activeSlide === 2 ? 'is-active' : ''}`} aria-hidden={activeSlide !== 2}><div className="relative z-10 flex h-full flex-col justify-center p-6 sm:p-10 lg:p-16"><p className="slide-eyebrow">Core modules</p><h2 className="slide-title mt-3 max-w-3xl"><AnimatedWords text="Everything your team" /><AnimatedWords text="needs to deliver." /></h2><p className="slide-copy mt-4 max-w-2xl">One connected workspace for plans, execution, and the context that keeps work moving.</p><div className="module-grid mt-8"><article><b>01</b><h3>Projects</h3><p>Shared scope, milestones, and momentum.</p></article><article><b>02</b><h3>Tasks</h3><p>Focused priority and clear ownership.</p></article><article><b>03</b><h3>Collaboration</h3><p>Updates and decisions in the work itself.</p></article></div></div></section>
      <section className={`landing-slide slide-from-left landing-cta-slide ${activeSlide === 3 ? 'is-active' : ''}`} aria-hidden={activeSlide !== 3}><div className="cta-orb cta-orb-one" /><div className="cta-orb cta-orb-two" /><div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-20 text-center"><p className="slide-eyebrow">Start in minutes</p><h2 className="slide-title mt-3 max-w-3xl"><AnimatedWords text="Create your CloudFlow" /><AnimatedWords text="workspace." /></h2><p className="slide-copy mt-5 max-w-xl">Bring planning, execution, and collaboration into one streamlined workflow.</p><Link to="/register" className="cf-btn-primary mt-8">Get started free <Arrow /></Link></div></section>
      <div className="landing-slide-controls"><button type="button" onClick={() => showSlide(activeSlide - 1)} className="slide-arrow" aria-label="Previous slide"><Arrow left /></button><div className="slide-dots" role="tablist" aria-label="Choose landing slide">{NAV_ITEMS.map((item, index) => <button key={item} type="button" role="tab" aria-selected={activeSlide === index} aria-label={item} onClick={() => showSlide(index)} className={activeSlide === index ? 'active' : ''} />)}</div><button type="button" onClick={() => showSlide(activeSlide + 1)} className="slide-arrow" aria-label="Next slide"><Arrow /></button></div>
    </div>
  </main>;
};
