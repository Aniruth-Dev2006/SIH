// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};
