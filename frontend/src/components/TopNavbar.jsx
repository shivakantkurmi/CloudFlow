import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearSession } from '../store/authSlice.js';
import { markNotificationRead, markAllNotificationsRead } from '../store/notificationSlice.js';
import { globalSearch } from '../services/searchService.js';
import { setCurrentOrg } from '../store/orgSlice.js';
import { useTheme } from '../hooks/useTheme.jsx';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4 text-cf-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronDown = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export const TopNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const { user } = useSelector(state => state.auth);
  const { items: notifs, status: notifStatus } = useSelector(state => state.notifications);
  const { items: orgs, currentOrg } = useSelector(state => state.orgs);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOrgs, setShowOrgs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const orgRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setIsSearching(true);
    const t = setTimeout(async () => {
      try { setSearchResults(await globalSearch(searchQuery)); }
      catch (e) { console.error(e); }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (orgRef.current && !orgRef.current.contains(e.target)) setShowOrgs(false);
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) setShowMobileSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setShowMobileMenu(false); setShowMobileSearch(false); }, [location.pathname]);

  const handleLogout = () => { dispatch(clearSession()); navigate('/login'); };
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/', label: 'Projects' },
  ];

  const SearchDropdown = ({ results, query }) => (
    <div className="absolute left-0 right-0 mt-2 max-h-[70vh] overflow-y-auto rounded-xl cf-surface shadow-elevated animate-slide-down z-50">
      {isSearching && !results ? (
        <div className="p-4 text-center text-sm text-cf-2">Searching…</div>
      ) : results ? (
        <div className="py-2">
          {results.projects.length === 0 && results.tasks.length === 0 && (
            <div className="p-6 text-center text-sm text-cf-3">No results for "{query}"</div>
          )}
          {results.projects.length > 0 && (
            <div className="mb-1">
              <div className="px-4 py-2 cf-section-label">Projects</div>
              {results.projects.map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} onClick={() => { setShowSearch(false); setShowMobileSearch(false); setSearchQuery(''); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-cf-elevated transition-colors text-cf">
                  <span className="rounded-md bg-primary-light dark:bg-primary-DEFAULT/20 px-1.5 py-0.5 text-[10px] font-bold text-primary-DEFAULT dark:text-primary-dark">{p.key}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                </Link>
              ))}
            </div>
          )}
          {results.tasks.length > 0 && (
            <div>
              <div className="px-4 py-2 cf-section-label">Tasks</div>
              {results.tasks.map(t => (
                <Link key={t.id} to={`/projects/${t.projectId}?task=${t.id}`} onClick={() => { setShowSearch(false); setShowMobileSearch(false); setSearchQuery(''); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-cf-elevated transition-colors text-cf">
                  <span className="text-xs font-bold text-primary-DEFAULT dark:text-primary-dark shrink-0">{t.project.key}</span>
                  <span className="truncate text-sm">{t.title}</span>
                  <span className="ml-auto shrink-0 cf-badge-todo text-xs">{t.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 h-14 w-full glass border-b border-cf">
        <div className="mx-auto flex h-full max-w-screen-2xl items-center gap-2 sm:gap-4 px-3 sm:px-6">

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2 group">
            <img
              src="/images/logo.png"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.nextSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
              className="h-8 w-auto max-w-[100px] object-contain transition-transform group-hover:scale-105"
              alt="CloudFlow"
            />
            <div style={{ display: 'none' }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-white shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-cf hidden sm:block">CloudFlow</span>
          </Link>

          {/* Org Switcher — hidden on very small */}
          {currentOrg && (
            <div className="relative shrink-0 hidden xs:block" ref={orgRef}>
              <button
                onClick={() => setShowOrgs(!showOrgs)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-cf-2 border border-cf hover:border-cf-strong hover:text-cf transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-[120px]">{currentOrg.name}</span>
                <ChevronDown />
              </button>

              {showOrgs && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl cf-surface overflow-hidden animate-scale-in z-50">
                  <div className="px-3 pt-3 pb-1.5">
                    <p className="cf-section-label">Workspace</p>
                  </div>
                  <div className="py-1">
                    {orgs.map(org => (
                      <button
                        key={org.id}
                        onClick={() => { dispatch(setCurrentOrg(org.id)); setShowOrgs(false); navigate('/'); }}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-cf-elevated ${currentOrg.id === org.id ? 'text-primary-DEFAULT font-semibold' : 'text-cf'}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white ${currentOrg.id === org.id ? 'bg-primary-DEFAULT' : 'bg-primary-DEFAULT/40'}`}>
                          {org.name[0]}
                        </span>
                        {org.name}
                        {currentOrg.id === org.id && (
                          <svg className="ml-auto w-3.5 h-3.5 text-primary-DEFAULT shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nav links — desktop only */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className={`nav-link ${active ? 'text-cf bg-cf-elevated' : ''}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search bar — desktop */}
          <div className="flex-1 max-w-md mx-auto hidden sm:block" ref={searchRef}>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="cf-input pl-9 text-xs py-2"
                placeholder="Search projects and tasks…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
              />
              {showSearch && searchQuery.trim() && (
                <SearchDropdown results={searchResults} query={searchQuery} />
              )}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto sm:ml-0">

            {/* Mobile search toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="cf-btn-ghost p-2 rounded-full sm:hidden"
              title="Search"
            >
              <SearchIcon />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="cf-btn-ghost p-2 rounded-full"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="cf-btn-ghost p-2 rounded-full relative">
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-80 rounded-xl cf-surface overflow-hidden animate-scale-in z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-cf">
                    <h3 className="text-sm font-semibold text-cf">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={() => dispatch(markAllNotificationsRead())} className="text-xs font-medium text-primary-DEFAULT hover:text-primary-hover transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-cf">
                    {notifStatus === 'loading' && notifs.length === 0 ? (
                      <p className="p-4 text-center text-sm text-cf-2">Loading…</p>
                    ) : notifs.length > 0 ? (
                      notifs.map(notif => (
                        <div key={notif.id} className={`flex gap-3 p-4 transition-colors ${notif.read ? 'text-cf-3' : 'bg-primary-light/30 dark:bg-primary-DEFAULT/5'}`}>
                          {!notif.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-DEFAULT" />}
                          <div className={`flex-1 ${notif.read ? 'pl-4' : ''}`}>
                            <p className="text-sm font-semibold text-cf">{notif.title}</p>
                            <p className="mt-0.5 text-xs text-cf-2">{notif.message}</p>
                            <p className="mt-1.5 text-[10px] text-cf-3">{new Date(notif.createdAt).toLocaleString()}</p>
                          </div>
                          {!notif.read && (
                            <button onClick={(e) => { e.stopPropagation(); dispatch(markNotificationRead(notif.id)); }} className="cf-btn-ghost p-1 rounded-md text-xs shrink-0">
                              ✓
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="p-8 text-center text-sm text-cf-3">All caught up! 🎉</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfile(!showProfile)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-xs font-bold text-white shadow-glow-sm hover:shadow-glow transition-shadow">
                {initials}
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl cf-surface overflow-hidden animate-scale-in z-50">
                  <div className="px-4 py-3 border-b border-cf">
                    <p className="text-sm font-semibold text-cf truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-cf-2 truncate mt-0.5">{user?.email}</p>
                  </div>
                  {/* Org switcher in profile for mobile */}
                  {currentOrg && orgs.length > 1 && (
                    <div className="block xs:hidden border-b border-cf">
                      <div className="px-3 pt-2 pb-1">
                        <p className="cf-section-label">Switch Workspace</p>
                      </div>
                      {orgs.map(org => (
                        <button
                          key={org.id}
                          onClick={() => { dispatch(setCurrentOrg(org.id)); setShowProfile(false); navigate('/'); }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-cf-elevated ${currentOrg.id === org.id ? 'text-primary-DEFAULT font-semibold' : 'text-cf'}`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white ${currentOrg.id === org.id ? 'bg-primary-DEFAULT' : 'bg-primary-DEFAULT/40'}`}>
                            {org.name[0]}
                          </span>
                          {org.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Mobile nav links */}
                  <div className="block md:hidden border-b border-cf py-1">
                    {navItems.map(item => {
                      const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setShowProfile(false)}
                          className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-cf-elevated ${active ? 'text-primary-DEFAULT font-semibold' : 'text-cf'}`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="py-1">
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search bar — slides down when toggled */}
      {showMobileSearch && (
        <div className="sticky top-14 z-30 sm:hidden bg-cf border-b border-cf px-3 py-2 animate-slide-down" ref={mobileSearchRef}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <SearchIcon />
            </div>
            <input
              autoFocus
              type="text"
              className="cf-input pl-9 text-xs py-2 w-full"
              placeholder="Search projects and tasks…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery.trim() && (
              <SearchDropdown results={searchResults} query={searchQuery} />
            )}
          </div>
        </div>
      )}
    </>
  );
};
