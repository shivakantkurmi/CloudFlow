import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.jsx';

const FEATURED_MEDIA = [
  {
    title: 'Projects',
    desc: 'Build structured project spaces with clear scope and milestones.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop',
  },
  {
    title: 'Tasks',
    desc: 'Organize priorities in list and board views with live movement.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop',
  },
  {
    title: 'Collaboration',
    desc: 'Keep context inside work with comments, updates, and activity.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop',
  },
];

const FeatureCard = ({ title, body }) => (
  <article className="landing-glass-soft rounded-2xl p-5">
    <h3 className="font-geist text-xl font-semibold text-cf">{title}</h3>
    <p className="mt-2 text-sm text-cf-2">{body}</p>
  </article>
);

export const LandingPage = () => {
  const { theme, toggle } = useTheme();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1280px] px-2.5 pb-8 pt-2.5 sm:px-5 sm:pb-10 sm:pt-3 lg:px-8">
      <header className="sticky top-2 z-30 mb-4 sm:top-3 sm:mb-6">
        <div className="landing-glass flex items-center justify-between rounded-full px-2.5 py-2 sm:px-5 sm:py-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="cf-logo-round h-10 w-10 sm:h-11 sm:w-11">
              <img src="/images/logo.png" alt="CloudFlow" />
            </span>
            <span className="hidden font-geist text-lg font-semibold tracking-tight text-cf-cyan sm:inline sm:text-xl">CloudFlow</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <a href="#overview" className="cf-nav-link">Overview</a>
            <a href="#features" className="cf-nav-link">Features</a>
            <a href="#modules" className="cf-nav-link">Modules</a>
            <a href="#cta" className="cf-nav-link">Start</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={toggle} className="cf-btn-ghost px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-xs" type="button">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <Link to="/login" className="cf-btn-secondary px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-xs">Sign In</Link>
            <Link to="/register" className="cf-btn-primary px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-xs">Register</Link>
          </div>
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          <a href="#overview" className="cf-nav-link whitespace-nowrap">Overview</a>
          <a href="#features" className="cf-nav-link whitespace-nowrap">Features</a>
          <a href="#modules" className="cf-nav-link whitespace-nowrap">Modules</a>
          <a href="#cta" className="cf-nav-link whitespace-nowrap">Start</a>
        </div>
      </header>

      <section id="overview" className="landing-glass overflow-hidden rounded-3xl">
        <div className="relative min-h-[390px] sm:min-h-[560px]">
          <img
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2200&auto=format&fit=crop"
            alt="Team planning in CloudFlow"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/70" />

          <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-8 lg:p-10">
            <p className="cf-section-label mb-2 text-white/75">Collaborate. Manage. Deliver.</p>
            <h1 className="max-w-4xl font-geist text-[2rem] font-semibold leading-[0.92] text-white sm:text-6xl lg:text-7xl">
              SHAPE WORK.
              <br />
              SHIP WITH CLARITY.
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/register" className="cf-btn-primary">Create Account</Link>
              <Link to="/login" className="cf-btn-secondary">Go to Workspace</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="landing-glass overflow-hidden rounded-3xl">
          <div className="grid lg:grid-cols-[1fr_1.15fr]">
            <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1600&auto=format&fit=crop" alt="Kanban workflow" className="h-52 w-full object-cover lg:h-full" />
            <div className="p-5 sm:p-7">
              <p className="cf-section-label">Task execution</p>
              <h2 className="mt-1 font-geist text-3xl font-semibold text-cf">Move Fast In Boards</h2>
              <p className="mt-3 text-sm text-cf-2 sm:text-base">Track priorities visually with focused columns, clear task cards, and smooth drag-and-drop movement.</p>
            </div>
          </div>
        </article>

        <article className="landing-glass overflow-hidden rounded-3xl">
          <div className="grid lg:grid-cols-[1fr_1.15fr]">
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop" alt="Project analytics" className="h-52 w-full object-cover lg:h-full" />
            <div className="p-5 sm:p-7">
              <p className="cf-section-label">Project visibility</p>
              <h2 className="mt-1 font-geist text-3xl font-semibold text-cf">Keep Teams Aligned</h2>
              <p className="mt-3 text-sm text-cf-2 sm:text-base">Use activity history, assignments, and comments to keep context where work happens.</p>
            </div>
          </div>
        </article>
      </section>

      <section id="modules" className="mt-4">
        <div className="mb-3 px-1">
          <p className="cf-section-label">Core modules</p>
          <h2 className="font-geist text-3xl font-semibold text-cf">Everything Needed To Run Delivery</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {FEATURED_MEDIA.map((item) => (
            <article key={item.title} className="landing-glass-soft overflow-hidden rounded-2xl">
              <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-geist text-2xl font-semibold text-cf">{item.title}</h3>
                <p className="mt-2 text-sm text-cf-2">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="cta" className="landing-glass mt-4 flex flex-col gap-4 rounded-3xl p-6 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="cf-section-label">Start in minutes</p>
          <h3 className="mt-1 font-geist text-3xl font-semibold text-cf">Create Your CloudFlow Workspace</h3>
          <p className="mt-2 text-cf-2">Bring planning, execution, and collaboration into one streamlined workflow.</p>
        </div>
        <Link to="/register" className="cf-btn-primary">Get Started</Link>
      </section>
    </main>
  );
};
