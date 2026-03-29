/**
 * Global error handler middleware.
 * Must be registered as the last middleware in app.js.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  const payload = {
    error: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
