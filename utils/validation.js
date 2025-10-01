// Validation helper functions

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
    // Minimum 6 characters
    return password && password.length >= 6;
};

const validateRequired = (value) => {
    return value && value.trim().length > 0;
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

module.exports = {
    validateEmail,
    validatePassword,
    validateRequired,
    sanitizeInput
};
