function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
