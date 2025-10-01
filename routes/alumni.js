const express = require('express');
const router = express.Router();
const Alumni = require('../models/Alumni');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Marketplace = require('../models/Marketplace');
const Rsvp = require('../models/Rsvp');
const { isAlumni } = require('../middleware/auth');

// Alumni Dashboard
router.get('/alumni-dashboard', isAlumni, async (req, res) => {
    try {
        const alumni = await Alumni.findOne({ email: req.session.userEmail });
        if (!alumni) return res.redirect('/');

        const dashboardData = {
            mentorshipSuggestionCount: 3,
            pendingMentorshipRequests: 1,
            upcomingEvents: [{ name: 'Annual Alumni Meet' }],
            lastAttendedEvent: { name: 'Webinar on AI' },
            userRank: 8,
            rankChange: 2,
            nextRankMessage: 'Mentor 2 more students to climb higher!',
            messages: [
                { title: 'Mentorship Request', sender: 'From: Vikram Singh', is_read: false },
                { title: 'Event Invite: Annual Meetup', sender: 'From: College Admin', is_read: true }
            ]
        };

        res.render('alumni_dashboard', { alumni, ...dashboardData });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Alumni Announcements
router.get('/alumni-announcements', isAlumni, async (req, res) => {
    try {
        const [alumni, announcements] = await Promise.all([
            Alumni.findOne({ email: req.session.userEmail }),
            Announcement.find({}).sort({ date: -1 })
        ]);
        if (!alumni) return res.redirect('/');
        res.render('alumni_announcements', { alumni, announcements });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Alumni Events
router.get('/alumni-events', isAlumni, async (req, res) => {
    try {
        const { title, category, status } = req.query;
        let eventQuery = {};
        if (title) eventQuery.title = { $regex: title, $options: 'i' };
        if (category) eventQuery.category = category;
        if (status) eventQuery.status = status;

        const alumni = await Alumni.findOne({ email: req.session.userEmail });
        if (!alumni) return res.redirect('/');

        const [events, rsvps] = await Promise.all([
            Event.find(eventQuery).sort({ created_at: -1 }),
            Rsvp.find({ alumniId: alumni._id })
        ]);

        const rsvpdEventIds = rsvps.map(rsvp => rsvp.eventId.toString());

        res.render('alumni_events', {
            alumni,
            events,
            rsvpdEventIds,
            titleQuery: title || '',
            categoryQuery: category || '',
            statusQuery: status || ''
        });
    } catch (err) {
        console.error('Error fetching events for alumni:', err);
        res.status(500).send('Server error.');
    }
});

// RSVP to event
router.post('/rsvp', isAlumni, async (req, res) => {
    try {
        const { eventId } = req.body;
        const alumni = await Alumni.findOne({ email: req.session.userEmail });
        if (!alumni) {
            return res.status(404).json({ success: false, message: 'Alumni profile not found.' });
        }

        const existingRsvp = await Rsvp.findOne({ alumniId: alumni._id, eventId });
        if (existingRsvp) {
            return res.status(400).json({ success: false, message: 'You have already registered for this event.' });
        }

        const newRsvp = new Rsvp({ alumniId: alumni._id, eventId });
        await newRsvp.save();
        res.status(200).json({ success: true, message: 'Successfully registered for the event!' });
    } catch (err) {
        console.error('RSVP Error:', err);
        res.status(500).json({ success: false, message: 'An error occurred while processing your request.' });
    }
});

// Leaderboard
router.get('/leaderboard', isAlumni, async (req, res) => {
    try {
        const [alumni, allAlumni] = await Promise.all([
            Alumni.findOne({ email: req.session.userEmail }),
            Alumni.find({}).sort({ name: 1 }).lean()
        ]);
        if (!alumni) return res.redirect('/');

        const leaderboard = allAlumni.map((user, index) => ({
            ...user,
            rank: index + 1,
            score: (allAlumni.length - index) * 100
        }));

        res.render('alumni_leaderboard', { alumni, leaderboard });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Alumni Jobs
router.get('/alumni-jobs', isAlumni, async (req, res) => {
    try {
        const { title, location } = req.query;
        let jobQuery = {};
        if (title) jobQuery.title = { $regex: title, $options: 'i' };
        if (location) jobQuery.location = { $regex: location, $options: 'i' };

        const [alumni, jobs] = await Promise.all([
            Alumni.findOne({ email: req.session.userEmail }),
            Job.find(jobQuery).populate('postedBy', 'name').sort({ createdAt: -1 })
        ]);

        if (!alumni) return res.redirect('/');

        res.render('alumni_jobs', {
            alumni,
            jobs,
            titleQuery: title || '',
            locationQuery: location || ''
        });
    } catch (err) {
        console.error('Error fetching jobs for alumni:', err);
        res.status(500).send('Server error.');
    }
});

// Post Job
router.post('/post-job', isAlumni, async (req, res) => {
    try {
        const { title, company, location, description, applicationLink } = req.body;
        const alumni = await Alumni.findOne({ email: req.session.userEmail });
        if (!alumni) {
            return res.status(404).json({ success: false, message: 'Alumni profile not found.' });
        }

        const newJob = new Job({
            title,
            company,
            location,
            description,
            applicationLink,
            postedBy: alumni._id
        });
        await newJob.save();
        res.status(200).json({ success: true, message: 'Job posted successfully!' });
    } catch (err) {
        console.error('Job Post Error:', err);
        res.status(500).json({ success: false, message: 'An error occurred while posting the job.' });
    }
});

// Alumni Marketplace
router.get('/alumni-marketplace', isAlumni, async (req, res) => {
    try {
        const { title, category } = req.query;
        let query = {};
        if (title) query.title = { $regex: title, $options: 'i' };
        if (category) query.category = category;

        const [alumni, listings] = await Promise.all([
            Alumni.findOne({ email: req.session.userEmail }),
            Marketplace.find(query).populate('postedBy', 'name batch').sort({ createdAt: -1 })
        ]);
        if (!alumni) return res.redirect('/');
        res.render('alumni_marketplace', {
            alumni,
            listings,
            titleQuery: title || '',
            categoryQuery: category || ''
        });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Post Listing
router.post('/post-listing', isAlumni, async (req, res) => {
    try {
        const { title, category, description, contactInfo } = req.body;
        const alumni = await Alumni.findOne({ email: req.session.userEmail });
        if (!alumni) {
            return res.status(404).json({ success: false, message: 'Alumni profile not found.' });
        }
        const newListing = new Marketplace({
            title,
            category,
            description,
            contactInfo,
            postedBy: alumni._id
        });
        await newListing.save();
        res.status(200).json({ success: true, message: 'Listing posted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'An error occurred.' });
    }
});

module.exports = router;
