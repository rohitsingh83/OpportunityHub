import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, FALLBACK_DOMAINS } from '../api.js';
import Spinner from '../components/Spinner.jsx';

const EMPTY = {
  title: '',
  company: '',
  domain: FALLBACK_DOMAINS[0],
  location: '',
  experience: '',
  type: 'Internship',
  salary: '',
  description: '',
  applicationLink: '',
};

export default function OpportunityForm() {
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api(`/opportunities/${id}`)
      .then((opp) => setForm({ ...EMPTY, ...opp }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api(`/opportunities/${id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await api('/opportunities', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading opportunity details…" />;

  return (
    <div className="form-page">
      <Link to="/admin" className="back-link">
        ← Back to Admin Opportunities
      </Link>
      <div className="card form-card">
        <h1>{isEdit ? 'Edit Opportunity' : 'Add New Opportunity'}</h1>
        <p className="card-company">
          {isEdit ? `Updating listing: ${form.title || ''}` : 'Publish a new job or internship listing'}
        </p>

        {error && (
          <div className="error-box">
            <p>⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={submit} className="form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={update}
              required
              placeholder="e.g. Frontend Developer Intern"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company *</label>
            <input
              className="input"
              name="company"
              value={form.company}
              onChange={update}
              required
              placeholder="e.g. TechNova Solutions"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Domain *</label>
              <select className="input" name="domain" value={form.domain} onChange={update} required>
                {FALLBACK_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="input" name="type" value={form.type} onChange={update}>
                <option value="Internship">🎓 Internship</option>
                <option value="Job">💼 Job</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                className="input"
                name="location"
                value={form.location}
                onChange={update}
                required
                placeholder="e.g. Hyderabad (Hybrid) or Remote"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience Requirement *</label>
              <input
                className="input"
                name="experience"
                value={form.experience}
                onChange={update}
                required
                placeholder="e.g. 0-1 years or Freshers"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Salary / Stipend</span>
              <span className="form-hint">Optional (e.g. ₹25,000 / month or ₹8 - 12 LPA)</span>
            </label>
            <input
              className="input"
              name="salary"
              value={form.salary}
              onChange={update}
              placeholder="e.g. ₹25,000 / month or Competitive"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Description *</label>
            <textarea
              className="input"
              name="description"
              rows="6"
              value={form.description}
              onChange={update}
              required
              placeholder="Detail the responsibilities, expected skills, learning outcomes, and perks..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Application / Career Link *</label>
            <input
              className="input"
              type="url"
              name="applicationLink"
              value={form.applicationLink}
              onChange={update}
              required
              placeholder="https://company.example.com/careers/role"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Link to="/admin" className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? 'Saving Listing…' : isEdit ? '💾 Save Changes' : '✨ Publish Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
