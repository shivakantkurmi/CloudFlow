import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession } from '../store/authSlice.js';
import { markNotificationRead, markAllNotificationsRead } from '../store/notificationSlice.js';
import { globalSearch } from '../services/searchService.js';

export const TopNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { items, status } = useSelector(state => state.notifications);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  
  const unreadCount = items.filter(n => !n.read).length;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    const delayFn = setTimeout(async () => {
      try {
        const results = await globalSearch(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayFn);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(clearSession());
    navigate('/login');
  };

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    dispatch(markNotificationRead(id));
  };
  
  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/20 glass-panel px-6">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-lg font-bold text-white shadow-md">CF</div>
          <span className="text-xl font-bold tracking-tight text-slate-800">CloudFlow</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
          <Link to="/" className="hover:text-primary">Projects</Link>
        </nav>
      </div>
      
      {/* Global Search */}
      <div className="flex flex-1 items-center justify-center px-8" ref={searchRef}>
        <div className="relative w-full max-w-lg">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full rounded-full border border-slate-200 bg-white/50 py-2 pl-10 pr-3 text-sm placeholder-slate-500 backdrop-blur-sm transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm shadow-sm"
            placeholder="Search projects and tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
          />
          
          {showSearch && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-3 max-h-[80vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/90 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 animate-slide-up">
              {isSearching && !searchResults ? (
                <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
              ) : searchResults ? (
                <div className="py-2">
                  {searchResults.projects.length === 0 && searchResults.tasks.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500">No results found for "{searchQuery}"</div>
                  )}
                  
                  {searchResults.projects.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Projects</div>
                      {searchResults.projects.map(project => (
                        <Link
                          key={project.id}
                          to={`/projects/${project.id}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                          className="block px-4 py-2 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-bold text-indigo-700">{project.key}</span>
                            <span className="text-sm font-medium text-slate-900">{project.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Tasks</div>
                      {searchResults.tasks.map(task => (
                        <Link
                          key={task.id}
                          to={`/projects/${task.projectId}?task=${task.id}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                          className="block px-4 py-2 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">{task.project.key}</span>
                            <span className="truncate text-sm font-medium text-slate-900">{task.title}</span>
                          </div>
                          <div className="mt-0.5 flex gap-2 pl-6 text-xs text-slate-500">
                            <span>{task.status}</span>
                            <span>{task.priority} Priority</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 animate-slide-up">
              <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {status === 'loading' && items.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-500">Loading...</p>
                ) : items.length > 0 ? (
                  <div className="divide-y">
                    {items.map(notif => (
                      <div key={notif.id} className={`flex gap-3 p-4 transition-colors ${notif.read ? 'bg-white opacity-70' : 'bg-blue-50/50'}`}>
                        {!notif.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"></div>}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</p>
                          <p className="mt-1 text-xs text-slate-600">{notif.message}</p>
                          <p className="mt-2 text-[10px] text-slate-400">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                        {!notif.read && (
                          <button onClick={(e) => handleMarkRead(e, notif.id)} className="shrink-0 text-xs font-medium text-slate-400 hover:text-primary">
                            Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-6 text-center text-sm text-slate-500">No notifications.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-sm ring-2 ring-white hover:opacity-90 focus:outline-none"
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </button>
          
          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl py-1 shadow-2xl ring-1 ring-black/5 animate-slide-up">
              <div className="border-b px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
