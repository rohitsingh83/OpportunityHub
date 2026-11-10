import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getCompanyColor, isOpportunitySaved, toggleSaveOpportunity } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBox from '../components/ErrorBox.jsx';

export default function OpportunityDetails() {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    api(`/opportunities/${id}`)
      .then((data) => {
        setOpportunity(data);
        setSaved(isOpportunitySaved(data._id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleSave = () => {
    if (!opportunity?._id) return;
    const nextSaved = toggleSaveOpportunity(opportunity._id);
    setSaved(nextSaved.includes(String(opportunity._id)));
  };

  if (loading) return <Spinner label="Loading opportunity details…" />;
  if (error) return <ErrorBox message={error} />;
  if (!opportunity) return <ErrorBox message="Opportunity not found" />;

  const {
    _id,
    title,
    company,
    domain,
    location,
    experience,
    description,
    applicationLink,
    type,
    salary,
    createdAt,
  } = opportunity;

  const initial = (company || 'C').charAt(0).toUpperCase();
  const avatarBg = getCompanyColor(company);

  return (
    <div className="details">
      <Link to="/" className="back-link">
        ← Back to all opportunities
      </Link>

      <div className="card details-card">
        <div className="details-header">
          <div className="company-avatar details-avatar" style={{ background: avatarBg }}>
            {initial}
          </div>
          <div className="details-header-content">
            <div className="card-badges" style={{ marginBottom: '8px' }}>
              <span className={`badge ${type === 'Job' ? 'badge-job' : 'badge-intern'}`}>
                {type === 'Job' ? '💼 Full-Time Job' : '🎓 Internship'}
              </span>
              <span className="badge badge-domain">{domain}</span>
              {salary && (
                <span className="badge badge-salary">
                  💰 {salary}
                </span>
              )}
            </div>
            <h1>{title}</h1>
            <p className="card-company">
              {company} <span className="verified-icon" title="Verified employer">✓</span> <span>Verified Employer</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn-small ${saved ? 'btn-primary' : 'btn-outline'}`}
              onClick={handleToggleSave}
              title={saved ? 'Remove from saved' : 'Save opportunity'}
            >
              {saved ? '★ Saved' : '☆ Save'}
            </button>
            <button
              type="button"
              className="btn btn-small btn-outline"
              onClick={handleCopyShare}
              title="Copy link to clipboard"
            >
              {copiedLink ? '✓ Copied!' : '🔗 Share'}
            </button>
          </div>
        </div>

        <div className="details-grid">
          <div className="details-item">
            <span className="details-label">📍 Location</span>
            <span className="details-value">{location}</span>
          </div>
          <div className="details-item">
            <span className="details-label">💼 Experience</span>
            <span className="details-value">{experience}</span>
          </div>
          <div className="details-item">
            <span className="details-label">📂 Domain</span>
            <span className="details-value">{domain}</span>
          </div>
          <div className="details-item">
            <span className="details-label">💰 Compensation</span>
            <span className="details-value" style={{ color: 'var(--brand-green)' }}>
              {salary || 'Competitive'}
            </span>
          </div>
          <div className="details-item">
            <span className="details-label">📅 Date Posted</span>
            <span className="details-value">
              {createdAt ? new Date(createdAt).toLocaleDateString() : 'Recently'}
            </span>
          </div>
        </div>

        <div className="details-section">
          <h2>About the Role</h2>
          <p className="description">{description}</p>
        </div>

        <div className="details-actions">
          <Link to={`/opportunity/${_id}/apply`} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            ✅ Apply on OpportunityHub
          </Link>
          {applicationLink && (
            <a
              href={applicationLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              🔗 Official Company Application Page ↗
            </a>
          )}
          <Link to={`/admin/edit/${_id}`} className="btn btn-ghost" style={{ marginLeft: 'auto' }}>
            ✏️ Edit Listing
          </Link>
        </div>
      </div>
    </div>
  );
}
