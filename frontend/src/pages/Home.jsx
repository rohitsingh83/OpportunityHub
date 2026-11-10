import { useEffect, useMemo, useState } from 'react';
import { api, FALLBACK_DOMAINS, getSavedOpportunities } from '../api.js';
import OpportunityCard from '../components/OpportunityCard.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorBox from '../components/ErrorBox.jsx';

export default function Home() {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('All');
  const [type, setType] = useState('All');
  const [location, setLocation] = useState('');
  const [domains, setDomains] = useState(FALLBACK_DOMAINS);
  const [opportunities, setOpportunities] = useState([]);
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedKey, setSavedKey] = useState(0); // trigger re-render on bookmark

  const debouncedSearch = useDebounced(search, 300);

  // Fetch distinct domains
  useEffect(() => {
    api('/opportunities/domains')
      .then((res) => {
        if (res.data && res.data.length) setDomains(res.data);
      })
      .catch(() => setDomains(FALLBACK_DOMAINS));
  }, []);

  // Fetch platform statistics
  useEffect(() => {
    api('/opportunities/stats')
      .then(setStats)
      .catch(() => {});
  }, []);

  // Fetch opportunities
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (domain !== 'All') params.set('domain', domain);
    if (type !== 'All') params.set('type', type);
    if (location.trim()) params.set('location', location.trim());

    api(`/opportunities?${params.toString()}`)
      .then((res) => {
        if (!cancelled) setOpportunities(res.data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, domain, type, location]);

  const reset = () => {
    setSearch('');
    setDomain('All');
    setType('All');
    setLocation('');
    setShowOnlySaved(false);
    setSortBy('newest');
  };

  const displayedOpps = useMemo(() => {
    let list = [...opportunities];
    if (showOnlySaved) {
      const savedIds = getSavedOpportunities();
      list = list.filter((opp) => savedIds.includes(String(opp._id)));
    }

    if (sortBy === 'title-asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'company-asc') {
      list.sort((a, b) => a.company.localeCompare(b.company));
    } else {
      // Default: newest
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [opportunities, showOnlySaved, sortBy, savedKey]);

  const heading = useMemo(() => {
    if (displayedOpps.length === 0 && !loading) {
      return showOnlySaved ? 'No saved opportunities yet' : 'No opportunities match your filters';
    }
    return `Showing ${displayedOpps.length} opportunit${displayedOpps.length === 1 ? 'y' : 'ies'}${
      showOnlySaved ? ' (saved)' : ''
    }`;
  }, [displayedOpps, loading, showOnlySaved]);

  return (
    <div>
      <section className="hero-section">
        <div className="hero-pill">
          <span className="hero-pill-dot" />
          <span>Verified Employers · 1-Click Applications · Transparent Status</span>
        </div>
        <h1 className="hero-title">
          Your Next Career Move,
          <br />
          <span className="hero-title-gradient">One Click Away.</span>
        </h1>
        <p className="hero-subtitle">
          OpportunityHub connects you with verified internships and high-growth job opportunities
          across engineering, design, marketing, data, and management domains.
        </p>

        {stats && (
          <div className="stats-ribbon">
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <div>
                <div className="stat-value">{stats.opportunities}</div>
                <div className="stat-label">Total Listings</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎓</span>
              <div>
                <div className="stat-value">{stats.internships}</div>
                <div className="stat-label">Internships</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💼</span>
              <div>
                <div className="stat-value">{stats.jobs}</div>
                <div className="stat-label">Full-Time Jobs</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📂</span>
              <div>
                <div className="stat-value">{stats.domains}</div>
                <div className="stat-label">Career Domains</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📝</span>
              <div>
                <div className="stat-value">{stats.applications}</div>
                <div className="stat-label">Applications</div>
              </div>
            </div>
          </div>
        )}
      </section>

      <SearchFilterBar
        search={search}
        setSearch={setSearch}
        domain={domain}
        setDomain={setDomain}
        type={type}
        setType={setType}
        location={location}
        setLocation={setLocation}
        domains={domains}
        showOnlySaved={showOnlySaved}
        setShowOnlySaved={setShowOnlySaved}
        onReset={reset}
      />

      {loading && <Spinner label="Loading verified opportunities…" />}
      {error && <ErrorBox message={error} onRetry={() => setLocation(location + ' ')} />}

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <p className="result-count" style={{ margin: 0 }}>
              {heading}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                className="input"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="title-asc">Role Title (A-Z)</option>
                <option value="company-asc">Company Name (A-Z)</option>
              </select>
            </div>
          </div>

          {displayedOpps.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">{showOnlySaved ? '⭐' : '🔎'}</span>
              <div className="empty-title">
                {showOnlySaved ? 'No Saved Roles Yet' : 'No opportunities found'}
              </div>
              <p className="empty-desc">
                {showOnlySaved
                  ? 'Click the star icon (☆) on any opportunity card to save it for later reference.'
                  : "We couldn't find any opportunities matching your current filters. Try resetting them."}
              </p>
              <button type="button" className="btn btn-primary" onClick={reset}>
                {showOnlySaved ? 'Show All Opportunities' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <div className="grid">
              {displayedOpps.map((opp) => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                  onBookmarkChange={() => setSavedKey((k) => k + 1)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
