const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let error = 'Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    error = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    error = 'Invalid or missing authentication token';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service Unavailable';
    error = 'External service is not available';
  } else if (err.response) {
    statusCode = err.response.status || 500;
    message = err.response.statusText || 'Request failed';
    error = err.response.data?.error || err.message;
  } else if (err.status) {
    statusCode = err.status;
    message = err.message || 'Error occurred';
    error = err.error || err.message;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  res.status(statusCode).json({
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
