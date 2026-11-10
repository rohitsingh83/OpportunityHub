import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state" style={{ padding: '80px 20px', maxWidth: '500px', margin: '40px auto' }}>
      <span className="empty-icon">🧭</span>
      <h1 className="empty-title" style={{ fontSize: '36px' }}>404 — Page Not Found</h1>
      <p className="empty-desc">
        The page you are looking for doesn&apos;t exist or has been moved to another URL.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '12px' }}>
        ← Return to Opportunities
      </Link>
    </div>
  );
}
