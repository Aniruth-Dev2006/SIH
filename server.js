const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('Public'));

// Session configuration
app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const alumniRoutes = require('./routes/alumni');

// Use Routes
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', studentRoutes);
app.use('/', alumniRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
