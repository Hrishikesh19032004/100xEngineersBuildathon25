// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
  
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ error: 'Resource already exists' });
    }
  
    if (err.code === '23503') { // PostgreSQL foreign key violation
      return res.status(400).json({ error: 'Referenced resource does not exist' });
    }
  
    res.status(500).json({ 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  };
  
  module.exports = errorHandler;