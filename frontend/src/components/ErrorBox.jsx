export default function ErrorBox({ message, onRetry }) {
  return (
    <div className="error-box">
      <p>⚠️ {message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
