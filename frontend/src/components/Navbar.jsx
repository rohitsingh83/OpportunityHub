import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getAdminKey, setAdminKey } from '../api';

export default function Navbar() {
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState(getAdminKey());
  const [inputVal, setInputVal] = useState(getAdminKey());
  
  // Theme state: defaults to 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('opportunityhub-theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('opportunityhub-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    setAdminKey(inputVal);
    setCurrentKey(inputVal.trim());
    setKeyModalOpen(false);
  };

  const handleClearKey = () => {
    setAdminKey('');
    setInputVal('');
    setCurrentKey('');
    setKeyModalOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <Link to="/" className="brand" aria-label="OpportunityHub Home">
          <div className="brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              style={{ width: '20px', height: '20px', color: '#ffffff' }}
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div className="brand-text">
            Opportunity<span>Hub</span>
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Opportunities
          </NavLink>
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Admin
          </NavLink>
          <NavLink to="/admin/applications" className={({ isActive }) => (isActive ? 'active' : '')}>
            Applications
          </NavLink>

          <button
            type="button"
            className={`btn btn-small ${currentKey ? 'btn-outline' : 'btn-ghost'}`}
            style={{ fontSize: '13px', padding: '7px 14px', marginLeft: '4px' }}
            onClick={() => setKeyModalOpen(true)}
            title="Configure Admin Key for authenticated API operations"
          >
            {currentKey ? '🔐 Admin Active' : '🔑 Admin Key'}
          </button>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </header>

      {keyModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setKeyModalOpen(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '460px',
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                🔐 Admin Authorization Key
              </h2>
              <button
                type="button"
                className="clear-btn"
                style={{ position: 'static', fontSize: '18px' }}
                onClick={() => setKeyModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
              If your backend is configured with an <code>ADMIN_KEY</code> in <code>backend/.env</code>,
              enter it below to unlock mutating actions (add/edit/delete listings, review status updates).
            </p>
            <form onSubmit={handleSaveKey}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  Admin Secret Key
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="Enter admin secret key..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                {currentKey && (
                  <button type="button" className="btn btn-ghost" onClick={handleClearKey}>
                    Clear Key
                  </button>
                )}
                <button type="button" className="btn btn-outline" onClick={() => setKeyModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
