const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Alumni = require('../models/Alumni');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const PendingRequest = require('../models/PendingRequest');
const { isAdmin } = require('../middleware/auth');

// Admin Dashboard
router.get('/admin', isAdmin, async (req, res) => {
    try {
        const [announcements, allEvents, upcomingCount, completedCount, pendingCount] = await Promise.all([
            Announcement.find().sort({ _id: -1 }).limit(2),
            Event.find(),
            Event.countDocuments({ status: 'Upcoming' }),
            Event.countDocuments({ status: 'Completed' }),
            PendingRequest.countDocuments()
        ]);

        res.render('admin', {
            admin: req.session.userEmail,
            ann: announcements.length > 0 ? announcements[0].title : 'No announcements',
            ann1: announcements.length > 1 ? announcements[1].title : 'No older announcements',
            events: allEvents,
            Upcoming: { length: upcomingCount },
            total: { length: completedCount },
            pendings: { length: pendingCount }
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// User Management
router.get('/user_management', isAdmin, (req, res) => {
    res.render('user_management', { admin: req.session.userEmail });
});

// All Users
router.get('/all_users', isAdmin, async (req, res) => {
    try {
        const successStatus = req.query.status;
        const [alumni, students] = await Promise.all([
            Alumni.find({}),
            Student.find({})
        ]);
        const allUsers = [...alumni, ...students];
        res.render('all_users', {
            users: allUsers,
            admin: req.session.userEmail,
            successStatus
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Pending Requests
router.get('/pending-requests', isAdmin, async (req, res) => {
    try {
        const requests = await PendingRequest.find({}).sort({ requestDate: 1 });
        res.render('pending-requests', {
            requests,
            admin: req.session.userEmail,
            status: req.query.status
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Approve Alumni
router.post('/approve-alumni', isAdmin, async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await PendingRequest.findById(requestId);
        if (!request) {
            return res.status(404).send('Request not found.');
        }

        const newAlumni = new Alumni({
            name: request.name,
            email: request.email,
            password: request.password,
            batch: request.batch,
            role: 'Alumni',
            rno: request.rno,
            course: request.course,
            dept: request.dept
        });
        await newAlumni.save();
        await PendingRequest.findByIdAndDelete(requestId);
        res.redirect('/pending-requests?status=approved');
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Reject Alumni
router.post('/reject-alumni', isAdmin, async (req, res) => {
    try {
        const { requestId } = req.body;
        const result = await PendingRequest.findByIdAndDelete(requestId);
        if (!result) {
            return res.status(404).send('Request not found.');
        }
        res.redirect('/pending-requests?status=rejected');
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Search Users API
router.get('/api/search-users', isAdmin, async (req, res) => {
    try {
        const { name, role, batch } = req.query;
        let query = {};
        if (name) query.name = { $regex: name, $options: 'i' };
        if (batch) query.batch = batch;

        const searchTasks = [];
        if (role === 'Student') {
            searchTasks.push(Student.find(query));
        } else if (role === 'Alumni') {
            searchTasks.push(Alumni.find(query));
        } else {
            searchTasks.push(Student.find(query));
            searchTasks.push(Alumni.find(query));
        }

        const results = await Promise.all(searchTasks);
        res.json(results.flat());
    } catch (err) {
        res.status(500).json({ error: 'An error occurred.' });
    }
});

// Get User by ID API
router.get('/api/user/:role/:id', isAdmin, async (req, res) => {
    try {
        const { role, id } = req.params;
        const Model = role === 'Student' ? Student : Alumni;
        const user = await Model.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Edit User
router.post('/edit-user', isAdmin, async (req, res) => {
    try {
        const { userId, originalRole, name, rno, batch, course, dept, password, role } = req.body;

        const CurrentModel = originalRole === 'Student' ? Student : Alumni;
        const TargetModel = role === 'Student' ? Student : Alumni;

        const updatedData = { name, rno, batch, course, dept, role };

        if (password && password.trim() !== '') {
            updatedData.password = password;
        }

        if (role === originalRole) {
            await CurrentModel.findByIdAndUpdate(userId, updatedData);
        } else {
            const originalUser = await CurrentModel.findByIdAndDelete(userId);
            if (!originalUser) {
                throw new Error('User not found for role transition.');
            }

            const newUserData = {
                ...updatedData,
                email: originalUser.email,
                password: updatedData.password || originalUser.password
            };
            const newUser = new TargetModel(newUserData);
            await newUser.save();
        }

        res.redirect('/all_users?status=editSuccess');
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Error updating user.');
    }
});

// Create Student - GET
router.get('/create_student', isAdmin, (req, res) => {
    res.render('create_student', {
        admin: req.session.userEmail,
        success: req.query.success === 'true'
    });
});

// Create Student - POST
router.post('/create_student', isAdmin, async (req, res) => {
    try {
        const user = new Student({
            name: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            batch: req.body.batch,
            role: 'Student',
            rno: req.body.rollNo,
            course: req.body.Course,
            dept: req.body.department
        });
        await user.save();
        res.redirect('/create_student?success=true');
    } catch (err) {
        res.redirect('/create_student?success=false');
    }
});

// Delete User
router.post('/delete-user', isAdmin, async (req, res) => {
    try {
        const { userId, userRole } = req.body;
        let Model = userRole === 'Student' ? Student : Alumni;
        const result = await Model.findByIdAndDelete(userId);
        if (!result) {
            return res.status(404).send('User not found.');
        }
        res.redirect('/all_users?status=deleteSuccess');
    } catch (err) {
        res.status(500).send('Error deleting user.');
    }
});

// Create Alumni - GET
router.get('/create_alumni', isAdmin, (req, res) => {
    res.render('create_alumni', {
        admin: req.session.userEmail,
        success: req.query.success === 'true'
    });
});

// Create Alumni - POST
router.post('/create_alumni', isAdmin, async (req, res) => {
    try {
        const user = new Alumni({
            name: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            batch: req.body.batch,
            role: 'Alumni',
            rno: req.body.rollNo,
            course: req.body.Course,
            dept: req.body.department
        });
        await user.save();
        res.redirect('/create_alumni?success=true');
    } catch (err) {
        res.redirect('/create_alumni?success=false');
    }
});

// Announcements
router.get('/announcements', isAdmin, async (req, res) => {
    try {
        const announcements = await Announcement.find({}).sort({ date: -1 });
        res.render('announcements', {
            announcements,
            admin: req.session.userEmail,
            success: req.query.success === 'true'
        });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Create Announcement
router.post('/create-announcement', isAdmin, async (req, res) => {
    try {
        const newAnnouncement = new Announcement({
            title: req.body.title,
            content: req.body.content
        });
        await newAnnouncement.save();
        res.redirect('/announcements?success=true');
    } catch (err) {
        res.redirect('/announcements?success=false');
    }
});

// Events
router.get('/events', isAdmin, async (req, res) => {
    try {
        const { title, category, status } = req.query;
        let query = {};
        if (title) query.title = { $regex: title, $options: 'i' };
        if (category) query.category = category;
        if (status) query.status = status;

        const events = await Event.find(query).sort({ created_at: -1 });
        res.render('events', { events, admin: req.session.userEmail });
    } catch (err) {
        res.status(500).send('Server error.');
    }
});

// Get Event by ID API
router.get('/api/event/:id', isAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        res.json(event);
    } catch (err) {
        res.status(404).json({ error: 'Event not found.' });
    }
});

// Create Event
router.post('/create-event', isAdmin, async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.redirect('/events?status=created');
    } catch (err) {
        res.redirect('/events?status=failed');
    }
});

// Edit Event
router.post('/edit-event', isAdmin, async (req, res) => {
    try {
        await Event.findByIdAndUpdate(req.body.id, req.body);
        res.redirect('/events?status=updated');
    } catch (err) {
        res.status(500).send('Error updating event');
    }
});

// Delete Event
router.post('/delete-event', isAdmin, async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.body.eventId);
        res.redirect('/events?status=deleted');
    } catch (err) {
        res.status(500).send('Error deleting event');
    }
});

module.exports = router;
