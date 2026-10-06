/**
 * Centralized error handling middleware
 * Should be registered last in the middleware chain
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error (in production, use a proper logging library like winston)
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
  });
};

module.exports = errorHandler;
