import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBox from '../components/ErrorBox.jsx';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [oppFilter, setOppFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Load opportunities for filter dropdown
  useEffect(() => {
    api('/opportunities')
      .then((res) => setOpportunities(res.data || []))
      .catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (oppFilter !== 'All') params.set('opportunityId', oppFilter);

    api(`/applications?${params.toString()}`)
      .then((res) => setApplications(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, statusFilter, oppFilter]);

  const handleStatusChange = async (appId, applicantName, newStatus) => {
    setMessage('');
    try {
      await api(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setMessage(`Updated status of "${applicantName}" to "${newStatus}"`);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApplicant && selectedApplicant._id === appId) {
        setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id, applicantName) => {
    if (!window.confirm(`Delete application submitted by "${applicantName}"?`)) return;
    setMessage('');
    try {
      await api(`/applications/${id}`, { method: 'DELETE' });
      setMessage(`Deleted application for "${applicantName}"`);
      if (selectedApplicant && selectedApplicant._id === id) {
        setSelectedApplicant(null);
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const exportToCSV = () => {
    if (!applications.length) {
      alert('No applications to export.');
      return;
    }
    const headers = [
      'Applicant Name',
      'Email',
      'Phone',
      'Opportunity Title',
      'Company',
      'Type',
      'Status',
      'Resume Link',
      'Applied Date',
    ];

    const rows = applications.map((a) => [
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.phone || '').replace(/"/g, '""')}"`,
      `"${(a.opportunity?.title || '').replace(/"/g, '""')}"`,
      `"${(a.opportunity?.company || '').replace(/"/g, '""')}"`,
      `"${(a.opportunity?.type || '').replace(/"/g, '""')}"`,
      `"${(a.status || '').replace(/"/g, '""')}"`,
      `"${(a.resumeLink || '').replace(/"/g, '""')}"`,
      `"${new Date(a.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Under Review':
        return 'badge-status under-review';
      case 'Shortlisted':
        return 'badge-status shortlisted';
      case 'Rejected':
        return 'badge-status rejected';
      default:
        return 'badge-status submitted';
    }
  };

  return (
    <div>
      <header className="page-header row">
        <div>
          <h1>Applications Management</h1>
          <p>Review, screen, and update candidate applications submitted through OpportunityHub.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button type="button" className="btn btn-outline" onClick={exportToCSV} title="Download CSV report">
            📥 Export CSV
          </button>
          <div className="stat-item" style={{ padding: '8px 16px' }}>
            <span className="stat-icon">📄</span>
            <div>
              <div className="stat-value">{applications.length}</div>
              <div className="stat-label">Applications</div>
            </div>
          </div>
        </div>
      </header>

      {message && <div className="success-box">✅ {message}</div>}
      {error && <ErrorBox message={error} onRetry={load} />}

      <div className="filter-card" style={{ marginBottom: '20px' }}>
        <div className="filter-grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr auto' }}>
          <div className="input-group">
            <span className="input-icon">🔍</span>
            <input
              type="text"
              className="input has-icon"
              placeholder="Search by candidate name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="clear-btn" onClick={() => setSearch('')}>
                ✕
              </button>
            )}
          </div>

          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="input"
            value={oppFilter}
            onChange={(e) => setOppFilter(e.target.value)}
            aria-label="Filter by Opportunity"
          >
            <option value="All">All Opportunities</option>
            {opportunities.map((opp) => (
              <option key={opp._id} value={opp._id}>
                {opp.title} ({opp.company})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setOppFilter('All');
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {loading && <Spinner label="Loading candidate applications…" />}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Contact</th>
                <th>Applied For</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a._id}>
                  <td>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: 0,
                        color: 'var(--text-main)',
                      }}
                      onClick={() => setSelectedApplicant(a)}
                      title="Click to view full application profile"
                    >
                      <strong style={{ color: 'var(--brand)', textDecoration: 'underline' }}>
                        {a.name}
                      </strong>
                    </button>
                    {a.coverLetter && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '3px',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={a.coverLetter}
                      >
                        &ldquo;{a.coverLetter}&rdquo;
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{a.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {a.phone || 'No phone'}
                    </div>
                  </td>
                  <td>
                    {a.opportunity ? (
                      <div>
                        <strong>{a.opportunity.title}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {a.opportunity.company} &nbsp;•&nbsp; {a.opportunity.type}
                        </div>
                      </div>
                    ) : (
                      <em style={{ color: 'var(--text-dim)' }}>Opportunity deleted</em>
                    )}
                  </td>
                  <td>
                    {a.resumeLink ? (
                      <a
                        href={a.resumeLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-small btn-outline"
                        style={{ textDecoration: 'none', display: 'inline-flex' }}
                      >
                        📄 View Resume
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Not provided</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className={getStatusClass(a.status)}>
                        ● {a.status}
                      </span>
                      <select
                        className="status-select"
                        value={a.status}
                        onChange={(e) => handleStatusChange(a._id, a.name, e.target.value)}
                        title="Update applicant status"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn-small btn-outline"
                      onClick={() => setSelectedApplicant(a)}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => remove(a._id, a.name)}
                      title="Delete application"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No applications match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      {selectedApplicant && (
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
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '620px',
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '34px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className={getStatusClass(selectedApplicant.status)}>
                  ● {selectedApplicant.status}
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 900, marginTop: '8px', marginBottom: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {selectedApplicant.name}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Applied for <strong>{selectedApplicant.opportunity?.title || 'Position'}</strong> at{' '}
                  {selectedApplicant.opportunity?.company || 'Company'}
                </p>
              </div>
              <button
                type="button"
                className="clear-btn"
                style={{ position: 'static', fontSize: '20px' }}
                onClick={() => setSelectedApplicant(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-grid" style={{ marginBottom: '20px' }}>
              <div className="details-item">
                <span className="details-label">Email</span>
                <span className="details-value" style={{ fontSize: '14px' }}>{selectedApplicant.email}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Phone</span>
                <span className="details-value" style={{ fontSize: '14px' }}>{selectedApplicant.phone || 'Not provided'}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Submitted On</span>
                <span className="details-value" style={{ fontSize: '14px' }}>
                  {new Date(selectedApplicant.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="details-item">
                <span className="details-label">Resume Link</span>
                {selectedApplicant.resumeLink ? (
                  <a
                    href={selectedApplicant.resumeLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#60a5fa', fontWeight: 700, fontSize: '14px', textDecoration: 'underline' }}
                  >
                    View Document ↗
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>None provided</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Cover Letter / Candidate Note
              </h3>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}
              >
                {selectedApplicant.coverLetter || 'No cover letter provided with this application.'}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                {['Submitted', 'Under Review', 'Shortlisted', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn btn-small ${selectedApplicant.status === st ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '11px', padding: '5px 10px' }}
                    onClick={() => handleStatusChange(selectedApplicant._id, selectedApplicant.name, st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedApplicant(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
