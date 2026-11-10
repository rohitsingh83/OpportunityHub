import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBox from '../components/ErrorBox.jsx';

export default function Admin() {
  const [opportunities, setOpportunities] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api('/opportunities')
      .then((res) => setOpportunities(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? All applications submitted for this opportunity will also be permanently removed.`)) {
      return;
    }
    setMessage('');
    try {
      await api(`/opportunities/${id}`, { method: 'DELETE' });
      setMessage(`Successfully deleted opportunity "${title}".`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredOpps = opportunities.filter((opp) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      opp.title.toLowerCase().includes(q) ||
      opp.company.toLowerCase().includes(q) ||
      opp.domain.toLowerCase().includes(q) ||
      opp.location.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <header className="page-header row">
        <div>
          <h1>Admin — Opportunities Management</h1>
          <p>Create, update, or remove job and internship listings across the portal.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/applications" className="btn btn-outline">
            📋 View Applications
          </Link>
          <Link to="/admin/new" className="btn btn-primary">
            ➕ Add Opportunity
          </Link>
        </div>
      </header>

      {message && <div className="success-box">✅ {message}</div>}
      {error && <ErrorBox message={error} onRetry={load} />}

      <div style={{ marginBottom: '18px', maxWidth: '360px' }}>
        <input
          type="text"
          className="input"
          placeholder="Filter listings by title or company…"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </div>

      {loading && <Spinner label="Loading listings…" />}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Domain</th>
                <th>Type</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpps.map((opp) => (
                <tr key={opp._id}>
                  <td>
                    <strong>{opp.title}</strong>
                  </td>
                  <td>{opp.company}</td>
                  <td>
                    <span className="badge badge-domain">{opp.domain}</span>
                  </td>
                  <td>
                    <span className={`badge ${opp.type === 'Job' ? 'badge-job' : 'badge-intern'}`}>
                      {opp.type}
                    </span>
                  </td>
                  <td>📍 {opp.location}</td>
                  <td className="actions">
                    <Link to={`/opportunity/${opp._id}`} className="btn btn-small btn-ghost" title="View public card">
                      View
                    </Link>
                    <Link to={`/admin/edit/${opp._id}`} className="btn btn-small btn-outline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => remove(opp._id, opp.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOpps.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    {filterQuery
                      ? 'No listings match your search.'
                      : 'No opportunities found. Click "Add Opportunity" to create one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
