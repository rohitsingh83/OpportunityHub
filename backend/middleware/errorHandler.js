function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler — turns Mongoose validation errors into clean 400 responses
function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
}

module.exports = { notFound, errorHandler };
