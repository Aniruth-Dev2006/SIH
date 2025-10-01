// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userEmail) {
        return next();
    }
    res.redirect('/');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.userRole === 'admin') {
        return next();
    }
    res.redirect('/');
};

// Middleware to check if user is alumni
const isAlumni = (req, res, next) => {
    if (req.session && req.session.userRole === 'Alumni') {
        return next();
    }
    res.redirect('/');
};

// Middleware to check if user is student
const isStudent = (req, res, next) => {
    if (req.session && req.session.userRole === 'Student') {
        return next();
    }
    res.redirect('/');
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isAlumni,
    isStudent
};
