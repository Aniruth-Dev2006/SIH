// Response helper functions for consistent API responses

const successResponse = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message
    };
    
    if (data) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

const errorResponse = (res, message, errors = null, statusCode = 400) => {
    const response = {
        success: false,
        message
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

const validationErrorResponse = (res, errors) => {
    return errorResponse(res, 'Validation failed', errors, 400);
};

const notFoundResponse = (res, resource = 'Resource') => {
    return errorResponse(res, `${resource} not found`, null, 404);
};

const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return errorResponse(res, message, null, 401);
};

const serverErrorResponse = (res, message = 'Internal server error') => {
    return errorResponse(res, message, null, 500);
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    serverErrorResponse
};
