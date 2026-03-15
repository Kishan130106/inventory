// middleware/errorHandler.js

// 404 — no route matched
const notFound = (req, res, next) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
};

// Global error handler — catches anything passed to next(err)
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist.' });
  }

  // PostgreSQL not null violation
  if (err.code === '23502') {
    return res.status(400).json({ error: `Missing required field: ${err.column}` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ error: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired.' });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error.'
      : err.message || 'Something went wrong.';

  res.status(status).json({ error: message });
};

module.exports = { notFound, errorHandler };
