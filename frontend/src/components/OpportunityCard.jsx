import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompanyColor, isOpportunitySaved, toggleSaveOpportunity } from '../api';

export default function OpportunityCard({ opportunity, onBookmarkChange }) {
  const { _id, title, company, domain, location, experience, description, type, salary } = opportunity;
  const initial = (company || 'C').charAt(0).toUpperCase();
  const avatarBg = getCompanyColor(company);
  const [saved, setSaved] = useState(isOpportunitySaved(_id));

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = toggleSaveOpportunity(_id);
    setSaved(nextSaved.includes(String(_id)));
    if (onBookmarkChange) onBookmarkChange();
  };

  const snippet = description && description.length > 115
    ? description.substring(0, 110).trim() + '…'
    : description;

  return (
    <div className="card">
      <div className="card-header-row">
        <div className="company-avatar" style={{ background: avatarBg }}>
          {initial}
        </div>
        <div className="card-title-group">
          <h3 className="card-title" title={title}>
            {title}
          </h3>
          <p className="card-company">
            {company} <span className="verified-icon" title="Verified employer">✓</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleSave}
          className="btn-ghost"
          style={{
            padding: '6px',
            fontSize: '18px',
            lineHeight: 1,
            cursor: 'pointer',
            borderRadius: '8px',
            color: saved ? '#f59e0b' : 'var(--text-dim)',
            transition: 'transform 0.15s ease',
          }}
          title={saved ? 'Remove from saved' : 'Save opportunity'}
        >
          {saved ? '★' : '☆'}
        </button>
      </div>

      <div className="card-badges">
        <span className={`badge ${type === 'Job' ? 'badge-job' : 'badge-intern'}`}>
          {type === 'Job' ? '💼 Full-Time Job' : '🎓 Internship'}
        </span>
        <span className="badge badge-domain">
          {domain}
        </span>
        {salary && (
          <span className="badge badge-salary">
            💰 {salary}
          </span>
        )}
      </div>

      <div className="card-meta-list">
        <div className="card-meta-item">
          <span>📍</span>
          <span>{location}</span>
        </div>
        <div className="card-meta-item">
          <span>💼</span>
          <span>{experience}</span>
        </div>
      </div>

      {snippet && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6, flex: 1 }}>
          {snippet}
        </p>
      )}

      <div className="card-footer">
        <Link to={`/opportunity/${_id}`} className="btn btn-primary btn-block">
          View Details &amp; Apply →
        </Link>
      </div>
    </div>
  );
}
