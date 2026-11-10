import { getSavedOpportunities } from '../api';

export default function SearchFilterBar({
  search,
  setSearch,
  domain,
  setDomain,
  type,
  setType,
  location,
  setLocation,
  domains,
  showOnlySaved,
  setShowOnlySaved,
  onReset,
}) {
  const popularChips = ['All', 'Software Development', 'Data Science', 'Design', 'Marketing', 'Finance'];
  const savedCount = getSavedOpportunities().length;

  return (
    <div className="filter-card">
      <div className="filter-grid">
        <div className="input-group">
          <span className="input-icon">🔍</span>
          <input
            type="text"
            placeholder="Search title, company, skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input has-icon"
          />
          {search && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={domain}
          onChange={(e) => {
            setShowOnlySaved(false);
            setDomain(e.target.value);
          }}
          className="input"
          aria-label="Filter by Domain"
        >
          <option value="All">All Domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input"
          aria-label="Filter by Type"
        >
          <option value="All">All Types</option>
          <option value="Internship">🎓 Internship</option>
          <option value="Job">💼 Full-Time Job</option>
        </select>

        <div className="input-group">
          <span className="input-icon">📍</span>
          <input
            type="text"
            placeholder="Location / Remote…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input has-icon"
          />
          {location && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setLocation('')}
              title="Clear location"
            >
              ✕
            </button>
          )}
        </div>

        <button type="button" className="btn btn-ghost" onClick={onReset} title="Reset all filters">
          Reset
        </button>
      </div>

      <div className="quick-tags">
        <span className="quick-tag-label">Popular Domains:</span>
        {popularChips.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`quick-chip ${!showOnlySaved && domain === chip ? 'active' : ''}`}
            onClick={() => {
              setShowOnlySaved(false);
              setDomain(chip);
            }}
          >
            {chip}
          </button>
        ))}

        <button
          type="button"
          className={`quick-chip quick-chip-saved ${showOnlySaved ? 'active' : ''}`}
          onClick={() => setShowOnlySaved(!showOnlySaved)}
          title="Filter saved opportunities"
        >
          ★ Saved Roles ({savedCount})
        </button>
      </div>
    </div>
  );
}
