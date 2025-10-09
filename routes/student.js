const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Marketplace = require('../models/Marketplace');
const Alumni = require('../models/Alumni');
const { isStudent } = require('../middleware/auth');

// Student Dashboard
router.get('/student-dashboard', isStudent, async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.session.userEmail });
        if (!student) return res.redirect('/');

        const [announcements, mentors, jobs, events] = await Promise.all([
            Announcement.find().sort({ date: -1 }).limit(2),
            Alumni.find().limit(2),
            Job.find().populate('postedBy', 'name').sort({ createdAt: -1 }).limit(2),
            Event.find({ status: 'Upcoming' }).sort({ date: 1 }).limit(2)
        ]);

        res.render('student_dashboard', {
            student,
            announcements,
            mentors,
            jobs,
            events
        });
    } catch (err) {
        console.error('Error fetching student dashboard data:', err);
        res.status(500).send('Server error.');
    }
});

// Student Career Hub
router.get('/student-career-hub', isStudent, async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.session.userEmail });
        if (!student) return res.redirect('/');
        res.render('student_career_hub', { student });
    } catch (err) {
        console.error('Error fetching career hub data:', err);
        res.status(500).send('Server error.');
    }
});

// Student Announcements
router.get('/student-announcements', isStudent, async (req, res) => {
    try {
        const [student, announcements] = await Promise.all([
            Student.findOne({ email: req.session.userEmail }),
            Announcement.find({}).sort({ date: -1 })
        ]);
        if (!student) return res.redirect('/');
        res.render('student_announcements', { student, announcements });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Student Events
router.get('/student-events', isStudent, async (req, res) => {
    try {
        const { title, category, status } = req.query;
        let query = {};
        if (title) query.title = { $regex: title, $options: 'i' };
        if (category) query.category = category;
        if (status) query.status = status;

        const [student, events] = await Promise.all([
            Student.findOne({ email: req.session.userEmail }),
            Event.find(query).sort({ created_at: -1 })
        ]);
        if (!student) return res.redirect('/');
        res.render('student_events', {
            student,
            events,
            titleQuery: title || '',
            categoryQuery: category || '',
            statusQuery: status || ''
        });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Student Jobs
router.get('/student-jobs', isStudent, async (req, res) => {
    try {
        const { title, location } = req.query;
        let jobQuery = {};
        if (title) jobQuery.title = { $regex: title, $options: 'i' };
        if (location) jobQuery.location = { $regex: location, $options: 'i' };

        const [student, jobs] = await Promise.all([
            Student.findOne({ email: req.session.userEmail }),
            Job.find(jobQuery).populate('postedBy', 'name').sort({ createdAt: -1 })
        ]);

        if (!student) return res.redirect('/');

        res.render('student_jobs', {
            student,
            jobs,
            titleQuery: title || '',
            locationQuery: location || ''
        });
    } catch (err) {
        console.error('Error fetching jobs for student:', err);
        res.status(500).send('Server error.');
    }
});

// Student Marketplace
router.get('/student-marketplace', isStudent, async (req, res) => {
    try {
        const { title, category } = req.query;
        let query = {};
        if (title) query.title = { $regex: title, $options: 'i' };
        if (category) query.category = category;

        const [student, listings] = await Promise.all([
            Student.findOne({ email: req.session.userEmail }),
            Marketplace.find(query).populate('postedBy', 'name batch').sort({ createdAt: -1 })
        ]);
        if (!student) return res.redirect('/');
        res.render('student_marketplace', {
            student,
            listings,
            titleQuery: title || '',
            categoryQuery: category || ''
        });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Student Leaderboard
router.get('/student-leaderboard', isStudent, async (req, res) => {
    try {
        const [student, allAlumni] = await Promise.all([
            Student.findOne({ email: req.session.userEmail }),
            Alumni.find({}).sort({ name: 1 }).lean()
        ]);
        if (!student) return res.redirect('/');

        const leaderboard = allAlumni.map((user, index) => ({
            ...user,
            rank: index + 1,
            score: (allAlumni.length - index) * 100
        }));

        res.render('student_leaderboard', { student, leaderboard });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

module.exports = router;
