export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Handle Mongoose unique constraint error (e.g. registrationNumber unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Conflict: ${field} already exists.`,
      errors: [{
        field,
        message: `${field} must be unique.`
      }]
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  res.status(status).json({
    success: false,
    message,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
