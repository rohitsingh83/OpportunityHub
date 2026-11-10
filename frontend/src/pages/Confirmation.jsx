import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBox from '../components/ErrorBox.jsx';

export default function Confirmation() {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api(`/applications/${applicationId}`)
      .then(setApplication)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const copyId = () => {
    if (application?._id) {
      navigator.clipboard.writeText(application._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <Spinner label="Confirming your application submission…" />;
  if (error) return <ErrorBox message={error} />;
  if (!application) return <ErrorBox message="Application not found" />;

  const opp = application.opportunity || {};

  return (
    <div className="confirmation">
      <div className="card confirmation-card">
        <div className="celebration-icon">🎉</div>
        <h1>Application Submitted!</h1>
        <p className="confirmation-summary">
          Thank you, <strong>{application.name}</strong>! Your application for the position of{' '}
          <strong>{opp.title || 'Role'}</strong> at <strong>{opp.company || 'Company'}</strong> has
          been successfully submitted to the employer.
        </p>

        <div className="timeline">
          <div className="timeline-step completed">
            <div className="timeline-circle">✓</div>
            <div className="timeline-title">Submitted</div>
          </div>
          <div className="timeline-step active">
            <div className="timeline-circle">2</div>
            <div className="timeline-title">Under Review</div>
          </div>
          <div className="timeline-step">
            <div className="timeline-circle">3</div>
            <div className="timeline-title">Decision</div>
          </div>
        </div>

        <div className="confirmation-details">
          <div className="details-item">
            <span className="details-label">Application ID</span>
            <div className="mono-copy">
              <span className="mono">{application._id}</span>
              <button
                type="button"
                className="copy-btn"
                onClick={copyId}
                title="Copy Application ID to clipboard"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="details-item">
            <span className="details-label">Current Status</span>
            <div>
              <span className="badge badge-status submitted">
                ● {application.status || 'Submitted'}
              </span>
            </div>
          </div>

          <div className="details-item">
            <span className="details-label">Submitted On</span>
            <span className="details-value">
              {new Date(application.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="details-item">
            <span className="details-label">Applicant Email</span>
            <span className="details-value">{application.email}</span>
          </div>
        </div>

        <div className="details-actions" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            Browse More Opportunities
          </Link>
          {opp.applicationLink && (
            <a
              href={opp.applicationLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              Company Careers Portal ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
