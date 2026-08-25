import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearSession, logout } from '../store/authSlice.js';
import { markNotificationRead, markAllNotificationsRead } from '../store/notificationSlice.js';
import { globalSearch } from '../services/searchService.js';
import { setCurrentOrg, deleteOrganization } from '../store/orgSlice.js';
import { useTheme } from '../hooks/useTheme.jsx';
import { CreateOrgModal } from './CreateOrgModal.jsx';
import { toast } from 'react-toastify';

/* ── Icons ── */
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

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

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);

const SearchIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

const ChevronDown = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);

/* ── Search dropdown ── */
const SearchDropdown = ({ results, query, isSearching, onClose }) => (
  <div className="absolute left-0 right-0 mt-1 max-h-[60vh] overflow-y-auto level-2-surface animate-slide-down z-50">
    {isSearching && !results ? (
      <div className="p-4 text-center font-technical text-cf-3">Searching…</div>
    ) : results ? (
      <div className="py-1">
        {results.projects.length === 0 && results.tasks.length === 0 && (
          <div className="p-4 text-center font-technical text-cf-3">No results for "{query}"</div>
        )}
        {results.projects.length > 0 && (
          <div className="mb-1">
            <div className="px-3 py-2 cf-section-label border-b border-cf">Projects</div>
            {results.projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-cf-hover transition-colors text-cf">
                <span className="cf-badge-key">{p.key}</span>
                <span className="font-technical text-sm">{p.name}</span>
              </Link>
            ))}
          </div>
        )}
        {results.tasks.length > 0 && (
          <div>
            <div className="px-3 py-2 cf-section-label border-b border-cf">Tasks</div>
            {results.tasks.map(t => (
              <Link key={t.id} to={`/projects/${t.projectId}?task=${t.id}`} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-cf-hover transition-colors text-cf">
                <span className="font-technical text-[11px] text-cf-cyan shrink-0">{t.project.key}</span>
                <span className="truncate text-sm font-medium">{t.title}</span>
                <span className="ml-auto shrink-0 cf-badge-todo">{t.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    ) : null}
  </div>
);

export const TopNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const { user }                         = useSelector(state => state.auth);
  const { items: notifs, status: notifStatus } = useSelector(state => state.notifications);
  const { items: orgs, currentOrg }       = useSelector(state => state.orgs);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile,       setShowProfile]        = useState(false);
  const [showOrgs,          setShowOrgs]           = useState(false);
  const [searchQuery,       setSearchQuery]         = useState('');
  const [searchResults,     setSearchResults]       = useState(null);
  const [isSearching,       setIsSearching]         = useState(false);
  const [showSearch,        setShowSearch]          = useState(false);
  const [showMobileSearch,  setShowMobileSearch]    = useState(false);
  const [showCreateOrg,     setShowCreateOrg]       = useState(false);
  const [showOwnedOnly,     setShowOwnedOnly]       = useState(false);

  const notifRef  = useRef(null);
  const profileRef= useRef(null);
  const orgRef    = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const unreadCount = notifs.filter(n => !n.read).length;
  const displayOrgs = showOwnedOnly ? orgs.filter(org => org.members?.[0]?.role === 'OWNER') : orgs;

  /* Debounced search */
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

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  setShowSearch(false);
      if (orgRef.current     && !orgRef.current.contains(e.target))     setShowOrgs(false);
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) setShowMobileSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Close mobile search on route change */
  useEffect(() => { setShowMobileSearch(false); }, [location.pathname]);

  const handleLogout = async () => { 
    await dispatch(logout());
    navigate('/login'); 
  };
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  const clearSearch = () => { setSearchQuery(''); setSearchResults(null); setShowSearch(false); setShowMobileSearch(false); };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/app',       label: 'Projects'  },
  ];

  return (
    <>
      {/* ── Top navbar ── */}
      <header className="sticky top-0 z-40 w-full cf-navbar px-2 py-2.5 sm:px-5 sm:py-3">
        <div className="mx-auto flex h-11 max-w-screen-2xl items-center gap-2 rounded-full border border-cf bg-cf-card px-2.5 shadow-elevated backdrop-blur-xl sm:h-12 sm:gap-3 sm:px-5">

          {/* Logo */}
          <Link to="/app" className="group mr-4 flex shrink-0 items-center gap-2">
            <span className="cf-logo-round">
              <img src="/images/logo.png" alt="CloudFlow" />
            </span>
            <span className="hidden font-geist text-lg font-semibold tracking-tight text-cf-cyan lg:inline">CloudFlow</span>
          </Link>

          {/* Org switcher */}
          {currentOrg && (
            <div className="relative shrink-0 block" ref={orgRef}>
              <button
                id="org-switcher-btn"
                onClick={() => setShowOrgs(!showOrgs)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-technical border border-cf text-cf-3 hover:border-cf-strong hover:text-cf transition-all"
                style={{ borderRadius: 4 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cf-teal animate-pulse-dot shrink-0" />
                <span className="truncate max-w-[90px]">{currentOrg.name}</span>
                <ChevronDown />
              </button>

              {showOrgs && (
                <div className="absolute left-0 mt-1 w-64 level-2-surface overflow-hidden animate-scale-in z-50 shadow-elevated">
                  <div className="flex items-center justify-between px-3 pt-3 pb-1.5 border-b border-cf">
                    <p className="cf-section-label">Workspace</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowOwnedOnly(!showOwnedOnly); }}
                      className={`text-[10px] font-technical uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors border ${showOwnedOnly ? 'bg-cf-cyan text-cf-card border-cf-cyan' : 'text-cf-3 border-transparent hover:border-cf-strong hover:text-cf hover:bg-cf-hover'}`}
                      title="Filter by workspaces you own"
                    >
                      Owned Only
                    </button>
                  </div>
                  <div className="py-1">
                    {displayOrgs.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-cf-3 text-center">No workspaces found.</div>
                    ) : displayOrgs.map(org => {
                      const isOwner = org.members?.[0]?.role === 'OWNER';
                      return (
                        <div key={org.id} className="group relative flex w-full items-center px-3 py-2 transition-colors hover:bg-cf-hover">
                          <button
                            onClick={() => { dispatch(setCurrentOrg(org.id)); setShowOrgs(false); navigate('/app'); }}
                            className={`flex flex-1 items-center gap-2.5 text-sm text-left ${currentOrg.id === org.id ? 'text-cf-cyan font-technical' : 'text-cf'}`}
                          >
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold text-cf-base font-technical ${currentOrg.id === org.id ? 'bg-cf-cyan' : 'bg-cf-teal'}`} style={{ borderRadius: 2 }}>
                              {org.name[0]}
                            </span>
                            <span className="flex-1 truncate pr-8">{org.name}</span>
                            {currentOrg.id === org.id && (
                              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-cf-cyan shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            )}
                          </button>
                          {isOwner && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to permanently delete the workspace "${org.name}"? This action cannot be undone.`)) {
                                  try {
                                    await dispatch(deleteOrganization(org.id)).unwrap();
                                    toast.success('Workspace deleted.');
                                  } catch (err) {
                                    toast.error(err.message || 'Failed to delete workspace');
                                  }
                                }
                              }}
                              title="Delete Workspace"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cf-3 hover:text-[#ffb4ab] opacity-0 group-hover:opacity-100 transition-opacity bg-cf-card/80 backdrop-blur-sm rounded"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div className="border-t border-cf mt-1 pt-1">
                      <button 
                        onClick={() => { setShowCreateOrg(true); setShowOrgs(false); }} 
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-cf-hover text-cf-cyan"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[14px] font-bold text-cf-base font-technical bg-cf-cyan" style={{ borderRadius: 2 }}>
                          +
                        </span>
                        <span className="flex-1 truncate font-technical">Create Workspace</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const active = item.to === '/app'
                ? location.pathname === '/app' || location.pathname.startsWith('/projects/')
                : location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className={`cf-nav-link ${active ? 'active' : ''}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search — desktop */}
          <div className="flex-1 max-w-xs mx-auto hidden sm:block" ref={searchRef}>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-cf-3">
                <SearchIcon />
              </div>
              <input
                type="text"
                id="global-search"
                className="cf-input pl-8 py-1.5 text-xs"
                placeholder="Search projects & tasks…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
              />
              {showSearch && searchQuery.trim() && (
                <SearchDropdown results={searchResults} query={searchQuery} isSearching={isSearching} onClose={clearSearch} />
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-0.5 shrink-0 ml-auto sm:ml-0">

            {/* Mobile search toggle */}
            <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="cf-btn-ghost p-2 sm:hidden" title="Search" id="mobile-search-btn">
              <SearchIcon />
            </button>

            {/* Theme toggle */}
            <button onClick={toggle} className="cf-btn-ghost p-2" title={theme === 'dark' ? 'Light mode' : 'Dark mode'} id="theme-toggle-btn">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button id="notif-btn" onClick={() => setShowNotifications(!showNotifications)} className="cf-btn-ghost p-2 relative">
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ffb4ab] text-[8px] font-bold text-[#690005]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-1 w-[calc(100vw-24px)] sm:w-80 level-2-surface overflow-hidden animate-scale-in z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-cf">
                    <h3 className="font-technical text-sm text-cf">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={() => dispatch(markAllNotificationsRead())} className="font-caps text-cf-cyan hover:opacity-80 transition-opacity">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[55vh] overflow-y-auto divide-y divide-cf">
                    {notifStatus === 'loading' && notifs.length === 0 ? (
                      <p className="p-4 text-center font-technical text-cf-3">Loading…</p>
                    ) : notifs.length > 0 ? (
                      notifs.map(notif => (
                        <div key={notif.id} className={`flex gap-3 p-4 transition-colors ${notif.read ? '' : 'bg-cf-cyan/5'}`}>
                          {!notif.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cf-cyan" />}
                          <div className={`flex-1 min-w-0 ${notif.read ? 'pl-4' : ''}`}>
                            <p className="text-sm font-medium text-cf truncate">{notif.title}</p>
                            <p className="mt-0.5 text-xs text-cf-2">{notif.message}</p>
                            <p className="mt-1.5 font-technical text-[10px] text-cf-3">{new Date(notif.createdAt).toLocaleString()}</p>
                          </div>
                          {!notif.read && (
                            <button onClick={e => { e.stopPropagation(); dispatch(markNotificationRead(notif.id)); }} className="cf-btn-ghost p-1 text-cf-3 shrink-0 text-xs">✓</button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="p-6 text-center font-technical text-cf-3">All caught up</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                id="profile-btn"
                onClick={() => setShowProfile(!showProfile)}
                className="cf-avatar h-8 w-8 text-[10px] font-technical hover:opacity-90 transition-opacity"
                style={{ borderRadius: '50%' }}
              >
                {initials}
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-1 w-56 level-2-surface overflow-hidden animate-scale-in z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-cf">
                    <p className="text-sm font-medium text-cf truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="font-technical text-[11px] text-cf-3 truncate mt-0.5">{user?.email}</p>
                  </div>

                  {/* Mobile org switcher */}
                  {currentOrg && orgs.length > 1 && (
                    <div className="block sm:hidden border-b border-cf py-1">
                      <div className="px-3 pt-2 pb-1">
                        <p className="cf-section-label">Switch Workspace</p>
                      </div>
                      {orgs.map(org => (
                        <button
                          key={org.id}
                          onClick={() => { dispatch(setCurrentOrg(org.id)); setShowProfile(false); navigate('/app'); }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-cf-hover ${currentOrg.id === org.id ? 'text-cf-cyan font-technical' : 'text-cf'}`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[9px] font-bold text-cf-base" style={{ background: currentOrg.id === org.id ? 'var(--cf-cyan)' : 'var(--cf-teal)', borderRadius: 2 }}>
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
                      const active = item.to === '/app'
                        ? location.pathname === '/app' || location.pathname.startsWith('/projects/')
                        : location.pathname.startsWith(item.to);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setShowProfile(false)}
                          className={`flex w-full items-center px-4 py-2.5 font-technical text-xs transition-colors hover:bg-cf-hover ${active ? 'text-cf-cyan' : 'text-cf'}`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Logout */}
                  <div className="py-1">
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 font-technical text-xs text-[#ffb4ab] hover:bg-cf-hover transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
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

      {/* Mobile search bar */}
      {showMobileSearch && (
        <div className="sticky top-[72px] z-30 sm:hidden border-b border-cf bg-cf-card px-3 py-2 animate-slide-down backdrop-blur-xl" ref={mobileSearchRef}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-cf-3">
              <SearchIcon />
            </div>
            <input
              autoFocus
              type="text"
              className="cf-input pl-8 py-1.5 text-xs w-full"
              placeholder="Search projects & tasks…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery.trim() && (
              <SearchDropdown results={searchResults} query={searchQuery} isSearching={isSearching} onClose={clearSearch} />
            )}
          </div>
        </div>
      )}

      <CreateOrgModal isOpen={showCreateOrg} onClose={() => setShowCreateOrg(false)} />
    </>
  );
};
