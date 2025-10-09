const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Alumni = require('../models/Alumni');
const PendingRequest = require('../models/PendingRequest');

// Login page
router.get('/', (req, res) => {
    req.session.destroy();
    res.render('login');
});

// Login handler
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check admin
        const admin = await Admin.findOne({ email, password });
        if (admin) {
            req.session.userEmail = admin.email;
            req.session.userRole = 'admin';
            return res.redirect('/admin');
        }

        // Check pending request
        const pending = await PendingRequest.findOne({ email, password });
        if (pending) {
            return res.redirect('/?status=pending_approval');
        }

        // Check alumni
        const alumni = await Alumni.findOne({ email, password });
        if (alumni) {
            req.session.userEmail = alumni.email;
            req.session.userId = alumni._id;
            req.session.userRole = 'Alumni';
            return res.redirect('/alumni-dashboard');
        }

        // Check student
        const student = await Student.findOne({ email, password });
        if (student) {
            req.session.userEmail = student.email;
            req.session.userId = student._id;
            req.session.userRole = 'Student';
            return res.redirect('/student-dashboard');
        }

        res.redirect('/?status=login_failed');
    } catch (err) {
        console.log('Login Error: ' + err);
        res.status(500).send('Server error during login.');
    }
});

// Signup page
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Signup handler
router.post('/signup', async (req, res) => {
    const { name, email, password, batch, rno, course, dept } = req.body;
    try {
        // Check if user already exists
        const existingUser = await Alumni.findOne({ email }) ||
                            await Student.findOne({ email }) ||
                            await Admin.findOne({ email }) ||
                            await PendingRequest.findOne({ email });

        if (existingUser) {
            return res.redirect('/signup?status=email_exists');
        }

        // Create pending request
        const newRequest = new PendingRequest({
            name,
            email,
            password,
            batch,
            rno,
            course,
            dept,
            role: 'Alumni'
        });
        await newRequest.save();
        res.redirect('/?status=signup_success');
    } catch (err) {
        console.error('Error creating pending request:', err);
        res.status(500).send('Error submitting request.');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;
