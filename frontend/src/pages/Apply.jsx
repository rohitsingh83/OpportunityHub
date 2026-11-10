import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBox from '../components/ErrorBox.jsx';

const EMPTY = { name: '', email: '', phone: '', resumeLink: '', coverLetter: '' };

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [loadingOpp, setLoadingOpp] = useState(true);
  const [oppError, setOppError] = useState('');

  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/opportunities/${id}`)
      .then(setOpportunity)
      .catch((err) => setOppError(err.message))
      .finally(() => setLoadingOpp(false));
  }, [id]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api('/applications', {
        method: 'POST',
        body: JSON.stringify({ opportunityId: id, ...form }),
      });
      navigate(`/confirmation/${res.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOpp) return <Spinner label="Loading application details…" />;
  if (oppError) return <ErrorBox message={oppError} />;

  return (
    <div className="form-page">
      <Link to={`/opportunity/${id}`} className="back-link">
        ← Back to opportunity details
      </Link>
      <div className="card form-card">
        <h1>Apply for {opportunity.title}</h1>
        <p className="card-company">
          {opportunity.company} &nbsp;•&nbsp; 📍 {opportunity.location} &nbsp;•&nbsp; 💼 {opportunity.type}
        </p>

        {error && (
          <div className="error-box">
            <p>⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={submit} className="form">
          <div className="form-group">
            <label className="form-label">
              <span>Full Name *</span>
            </label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={update}
              required
              placeholder="e.g. Aarav Sharma"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span>Email Address *</span>
              </label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <span>Phone Number</span>
                <span className="form-hint">Optional</span>
              </label>
              <input
                className="input"
                name="phone"
                value={form.phone}
                onChange={update}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Resume Link (PDF, Google Drive, LinkedIn, or Portfolio)</span>
              <span className="form-hint">Recommended</span>
            </label>
            <input
              className="input"
              type="url"
              name="resumeLink"
              value={form.resumeLink}
              onChange={update}
              placeholder="https://drive.google.com/file/d/... or portfolio URL"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Cover Letter / Brief Note</span>
              <span className="form-hint">Optional</span>
            </label>
            <textarea
              className="input"
              name="coverLetter"
              rows="5"
              value={form.coverLetter}
              onChange={update}
              placeholder="Share why your background and skills make you a great fit for this position..."
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Submitting Application…' : '🚀 Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
