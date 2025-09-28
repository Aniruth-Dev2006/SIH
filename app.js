const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended: true
}));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static("Public"));
app.set("view engine", "ejs");

// Using a global variable to track the logged-in user.
var loggedInUserEmail = null;

// --- Database Connection ---
mongoose.connect("mongodb://localhost:27017/communityDB");

// --- Schemas ---
const adminschema = new mongoose.Schema({
    email: String,
    password: String
});
const Admin = mongoose.model("admin", adminschema);

const studentschema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    batch: String,
    role: String,
    rno: String,
    course: String,
    dept: String
});
const Student = mongoose.model("student", studentschema);

const aluminschema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    batch: String,
    role: String,
    rno: String,
    course: String,
    dept: String,
    // Extended Profile Fields
    phone: String,
    dob: Date,
    gender: String,
    location: String,
    bio: String,
    profilePicture: String,
    // Professional Details
    company: String,
    designation: String,
    industry: String,
    experience: Number,
    // Skills and Achievements
    skills: [String],
    achievements: [String],
    // Social Links
    linkedin: String,
    github: String,
    twitter: String,
    website: String,
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const Alumini = mongoose.model("alumini", aluminschema);

const announcementschema = new mongoose.Schema({
    title: String,
    content: String,
    date: {
        type: Date,
        default: Date.now
    }
});
const Announcement = mongoose.model("Announcement", announcementschema);

const eventschema = new mongoose.Schema({
    title: String,
    date: String,
    time: String,
    venue_name: String,
    venue_link: String,
    description: String,
    organizer_name: String,
    organizer_contact: String,
    category: String,
    status: {
        type: String,
        default: 'Upcoming'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});
const Event = mongoose.model("Event", eventschema);

const pendingRequestSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    batch: String,
    role: String,
    rno: String,
    course: String,
    dept: String
});
const PendingRequest = mongoose.model("pendingRequest", pendingRequestSchema);

const rsvpSchema = new mongoose.Schema({
    alumniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'alumini'
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const Rsvp = mongoose.model("Rsvp", rsvpSchema);

const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    description: String,
    applicationLink: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'alumini'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Job = mongoose.model("Job", jobSchema);

const marketplaceSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    price: Number,
    contactInfo: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'alumini'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Marketplace = mongoose.model("Marketplace", marketplaceSchema);

// Donation Schema
const donationSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'donorModel'
    },
    donorModel: {
        type: String,
        enum: ['student', 'alumini']
    },
    donorName: String,
    donorEmail: String,
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    },
    amount: Number,
    paymentMethod: String,
    status: {
        type: String,
        default: 'Completed'
    },
    anonymous: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const Donation = mongoose.model("Donation", donationSchema);

// Campaign Schema
const campaignSchema = new mongoose.Schema({
    name: String,
    description: String,
    goalAmount: Number,
    currentAmount: {
        type: Number,
        default: 0
    },
    endDate: Date,
    status: {
        type: String,
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Campaign = mongoose.model("Campaign", campaignSchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Curriculum', 'General', 'Portal', 'Event', 'Mentorship', 'Other']
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'submitterModel'
    },
    submitterModel: {
        type: String,
        enum: ['student', 'alumini']
    },
    submitterName: String,
    submitterEmail: String,
    subject: String,
    message: String,
    rating: Number,
    course: String,
    semester: String,
    priority: {
        type: String,
        default: 'Medium'
    },
    status: {
        type: String,
        default: 'Pending'
    },
    adminResponse: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Connection Schema
const connectionSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'requesterModel'
    },
    requesterModel: {
        type: String,
        enum: ['student', 'alumini']
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        enum: ['student', 'alumini']
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Connection = mongoose.model("Connection", connectionSchema);

// Mentorship Schema
const mentorshipSchema = new mongoose.Schema({
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'alumini'
    },
    menteeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    },
    areaOfInterest: String,
    description: String,
    frequency: String,
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Completed', 'Declined'],
        default: 'Pending'
    },
    progress: {
        type: Number,
        default: 0
    },
    nextSessionDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Mentorship = mongoose.model("Mentorship", mentorshipSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        enum: ['student', 'alumini']
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        enum: ['student', 'alumini']
    },
    content: String,
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Message = mongoose.model("Message", messageSchema);

// Leaderboard Entry Schema
const leaderboardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        enum: ['student', 'alumini']
    },
    name: String,
    points: {
        type: Number,
        default: 0
    },
    contributions: {
        type: Number,
        default: 0
    },
    achievements: [String],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['alumini', 'student', 'admin']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'info-circle'
    },
    read: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['announcement', 'event', 'job', 'general', 'system'],
        default: 'general'
    },
    link: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const Notification = mongoose.model('Notification', notificationSchema);


// --- NOTIFICATION API ROUTES ---

// Get all notifications for a user
app.get("/api/notifications", async (req, res) => {
    try {
        if (!loggedInUserEmail) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        // Find the logged-in user
        let user = await Alumini.findOne({ email: loggedInUserEmail });
        let userModel = 'alumini';
        
        if (!user) {
            user = await Student.findOne({ email: loggedInUserEmail });
            userModel = 'student';
        }
        
        if (!user) {
            user = await Admin.findOne({ email: loggedInUserEmail });
            userModel = 'admin';
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch notifications
        const notifications = await Notification.find({ 
            userId: user._id,
            userModel: userModel
        })
        .sort({ createdAt: -1 })
        .limit(50);

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// Mark a single notification as read
app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
        if (!loggedInUserEmail) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
});

// Mark all notifications as read
app.patch("/api/notifications/mark-all-read", async (req, res) => {
    try {
        if (!loggedInUserEmail) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        // Find the logged-in user
        let user = await Alumini.findOne({ email: loggedInUserEmail });
        let userModel = 'alumini';
        
        if (!user) {
            user = await Student.findOne({ email: loggedInUserEmail });
            userModel = 'student';
        }
        
        if (!user) {
            user = await Admin.findOne({ email: loggedInUserEmail });
            userModel = 'admin';
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const result = await Notification.updateMany(
            { userId: user._id, userModel: userModel, read: false },
            { read: true }
        );

        res.json({ 
            message: "All notifications marked as read", 
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

// Create notification (for testing/admin use)
app.post("/api/notifications/create", async (req, res) => {
    try {
        const { userId, userModel, title, message, icon, type, link } = req.body;

        if (!userId || !userModel || !title || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const notification = new Notification({
            userId,
            userModel,
            title,
            message,
            icon: icon || 'info-circle',
            type: type || 'general',
            link: link || null
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: "Failed to create notification" });
    }
});


// --- AUTHENTICATION & SIGNUP ROUTES ---

app.get("/", function(req, res) {
    loggedInUserEmail = null; // Reset on visiting login page
    res.render("login");
});

app.post("/", async function(req, res) {
    const {
        email,
        password
    } = req.body;
    try {
        const admin = await Admin.findOne({
            email,
            password
        });
        if (admin) {
            loggedInUserEmail = admin.email;
            return res.redirect("/admin");
        }
        const pending = await PendingRequest.findOne({
            email,
            password
        });
        if (pending) {
            return res.redirect("/?status=pending_approval");
        }
        const alumni = await Alumini.findOne({
            email,
            password
        });
        if (alumni) {
            loggedInUserEmail = alumni.email;
            return res.redirect("/alumni-dashboard");
        }
        const student = await Student.findOne({
            email,
            password
        });
        if (student) {
            loggedInUserEmail = student.email;
            return res.redirect("/student-dashboard");
        }
        res.redirect("/?status=login_failed");
    } catch (err) {
        console.log("Login Error: " + err);
        res.status(500).send("Server error during login.");
    }
});

app.get("/signup", function(req, res) {
    res.render("signup");
});

app.post("/signup", async function(req, res) {
    const {
        name,
        email,
        password,
        batch,
        rno,
        course,
        dept
    } = req.body;
    try {
        const existingUser = await Alumini.findOne({
            email
        }) || await Student.findOne({
            email
        }) || await Admin.findOne({
            email
        }) || await PendingRequest.findOne({
            email
        });
        if (existingUser) {
            return res.redirect("/signup?status=email_exists");
        }
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
        res.redirect("/?status=signup_success");
    } catch (err) {
        console.error("Error creating pending request:", err);
        res.status(500).send("Error submitting request.");
    }
});

// --- STUDENT-FACING ROUTES ---
app.get("/student-dashboard", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({
            email: loggedInUserEmail
        });
        if (!student) return res.redirect("/");

        const [announcements, mentors, jobs, events] = await Promise.all([
            Announcement.find().sort({
                date: -1
            }).limit(2),
            Alumini.find().limit(2),
            Job.find().populate('postedBy', 'name').sort({
                createdAt: -1
            }).limit(2),
            Event.find({
                status: 'Upcoming'
            }).sort({
                date: 1
            }).limit(2)
        ]);

        res.render("student_dashboard", {
            student,
            announcements,
            mentors,
            jobs,
            events
        });

    } catch (err) {
        console.error("Error fetching student dashboard data:", err);
        res.status(500).send("Server error.");
    }
});

app.get("/student-career-hub", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({
            email: loggedInUserEmail
        });
        if (!student) return res.redirect("/");
        res.render("student_career_hub", {
            student
        });
    } catch (err) {
        console.error("Error fetching career hub data:", err);
        res.status(500).send("Server error.");
    }
});

app.get("/student-announcements", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const [student, announcements] = await Promise.all([
            Student.findOne({
                email: loggedInUserEmail
            }),
            Announcement.find({}).sort({
                date: -1
            })
        ]);
        if (!student) return res.redirect("/");
        res.render("student_announcements", {
            student,
            announcements
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.get("/student-events", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const {
            title,
            category,
            status
        } = req.query;
        let query = {};
        if (title) query.title = {
            $regex: title,
            $options: 'i'
        };
        if (category) query.category = category;
        if (status) query.status = status;

        const [student, events] = await Promise.all([
            Student.findOne({
                email: loggedInUserEmail
            }),
            Event.find(query).sort({
                created_at: -1
            })
        ]);
        if (!student) return res.redirect("/");
        res.render("student_events", {
            student,
            events,
            titleQuery: title || '',
            categoryQuery: category || '',
            statusQuery: status || ''
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.get("/student-jobs", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const {
            title,
            location
        } = req.query;
        let jobQuery = {};
        if (title) jobQuery.title = {
            $regex: title,
            $options: 'i'
        };
        if (location) jobQuery.location = {
            $regex: location,
            $options: 'i'
        };

        const [student, jobs] = await Promise.all([
            Student.findOne({
                email: loggedInUserEmail
            }),
            Job.find(jobQuery).populate('postedBy', 'name').sort({
                createdAt: -1
            })
        ]);

        if (!student) return res.redirect("/");

        res.render("student_jobs", {
            student,
            jobs,
            titleQuery: title || '',
            locationQuery: location || ''
        });
    } catch (err) {
        console.error("Error fetching jobs for student:", err);
        res.status(500).send("Server error.");
    }
});

app.get("/student-marketplace", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const {
            title,
            category
        } = req.query;
        let query = {};
        if (title) query.title = {
            $regex: title,
            $options: 'i'
        };
        if (category) query.category = category;

        const [student, listings] = await Promise.all([
            Student.findOne({
                email: loggedInUserEmail
            }),
            Marketplace.find(query).populate('postedBy', 'name batch').sort({
                createdAt: -1
            })
        ]);
        if (!student) return res.redirect("/");
        res.render("student_marketplace", {
            student,
            listings,
            titleQuery: title || '',
            categoryQuery: category || ''
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.get("/student-leaderboard", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const [student, allAlumni] = await Promise.all([
            Student.findOne({
                email: loggedInUserEmail
            }),
            Alumini.find({}).sort({
                name: 1
            }).lean()
        ]);
        if (!student) return res.redirect("/");

        const leaderboard = allAlumni.map((user, index) => ({
            ...user,
            rank: index + 1,
            score: (allAlumni.length - index) * 100 // Placeholder score
        }));

        res.render("student_leaderboard", {
            student,
            leaderboard
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.get("/student-profile", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({
            email: loggedInUserEmail
        });
        if (!student) return res.redirect("/");
        res.render("student_profile", {
            student,
            status: req.query.status
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.post("/student-update-profile", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const {
            name,
            rno,
            batch,
            course,
            dept,
            password
        } = req.body;

        const student = await Student.findOne({
            email: loggedInUserEmail
        });
        if (!student) return res.status(404).send("Student not found.");

        const updateData = {
            name,
            rno,
            batch,
            course,
            dept
        };
        if (password && password.trim() !== '') {
            updateData.password = password;
        }

        await Student.findByIdAndUpdate(student._id, updateData);
        res.redirect("/student-profile?status=success");

    } catch (err) {
        console.error("Error updating student profile:", err);
        res.redirect("/student-profile?status=error");
    }
});


// --- ALUMNI-FACING ROUTES ---

app.get("/alumni-dashboard", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({
            email: loggedInUserEmail
        });
        if (!alumni) return res.redirect("/");

        // Fetch real dashboard data with fallbacks
        let mentorshipRequests = 0;
        let activeMentorships = [];
        let upcomingEvents = [];
        let myConnections = 0;
        let myDonations = [];
        let unreadMessages = 0;

        try {
            [
                mentorshipRequests,
                activeMentorships,
                upcomingEvents,
                myConnections,
                myDonations,
                unreadMessages
            ] = await Promise.all([
                Mentorship.countDocuments({ mentorId: alumni._id, status: 'Pending' }).catch(() => 0),
                Mentorship.find({ mentorId: alumni._id, status: 'Active' }).populate('menteeId').limit(3).catch(() => []),
                Event.find({ status: 'Upcoming' }).sort({ date: 1 }).limit(3).catch(() => []),
                Connection.countDocuments({
                    $or: [
                        { requesterId: alumni._id, status: 'Accepted' },
                        { recipientId: alumni._id, status: 'Accepted' }
                    ]
                }).catch(() => 0),
                Donation.aggregate([
                    { $match: { donorId: alumni._id } },
                    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
                ]).catch(() => []),
                Message.countDocuments({ recipientId: alumni._id, read: false }).catch(() => 0)
            ]);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            // Continue with default values
        }

        // Calculate alumni rank
        const allAlumni = await Alumini.countDocuments().catch(() => 0);
        const userMentorshipCount = await Mentorship.countDocuments({ mentorId: alumni._id, status: 'Active' }).catch(() => 0);
        
        const dashboardData = {
            mentorshipSuggestionCount: activeMentorships.length,
            pendingMentorshipRequests: mentorshipRequests,
            activeMentorships: activeMentorships,
            upcomingEvents: upcomingEvents,
            totalConnections: myConnections || 0,
            totalDonations: myDonations[0] ? myDonations[0].total : 0,
            donationCount: myDonations[0] ? myDonations[0].count : 0,
            unreadMessages: unreadMessages || 0,
            userRank: Math.floor(Math.random() * 50) + 1, // Simplified - should calculate based on contributions
            rankChange: 2,
            nextRankMessage: 'Mentor 2 more students to climb higher!'
        };

        res.render("alumni_dashboard", {
            alumni,
            ...dashboardData,
            currentPage: 'dashboard'
        });
    } catch (err) {
        console.error("Error fetching dashboard:", err);
        // Render with default values even if there's an error
        res.render("alumni_dashboard", {
            alumni,
            mentorshipSuggestionCount: 0,
            pendingMentorshipRequests: 0,
            activeMentorships: [],
            upcomingEvents: [],
            totalConnections: 0,
            totalDonations: 0,
            donationCount: 0,
            unreadMessages: 0,
            userRank: 1,
            rankChange: 0,
            nextRankMessage: 'Start contributing to improve your rank!',
            currentPage: 'dashboard'
        });
    }
});

app.get("/alumni-announcements", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const [alumni, announcements] = await Promise.all([
            Alumini.findOne({
                email: loggedInUserEmail
            }),
            Announcement.find({}).sort({
                date: -1
            })
        ]);
        if (!alumni) return res.redirect("/");
        res.render("alumni_announcements", {
            alumni: alumni,
            announcements: announcements,
            currentPage: 'announcements'
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.get("/alumni-events", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const {
            title,
            category,
            status
        } = req.query;
        let eventQuery = {};
        if (title) eventQuery.title = {
            $regex: title,
            $options: 'i'
        };
        if (category) eventQuery.category = category;
        if (status) eventQuery.status = status;

        const alumni = await Alumini.findOne({
            email: loggedInUserEmail
        });
        if (!alumni) return res.redirect("/");

        const [events, rsvps] = await Promise.all([
            Event.find(eventQuery).sort({
                created_at: -1
            }),
            Rsvp.find({
                alumniId: alumni._id
            })
        ]);

        const rsvpdEventIds = rsvps.map(rsvp => rsvp.eventId.toString());

        res.render("alumni_events", {
            alumni: alumni,
            events: events,
            rsvpdEventIds: rsvpdEventIds,
            titleQuery: title || '',
            categoryQuery: category || '',
            statusQuery: status || '',
            currentPage: 'events'
        });
    } catch (err) {
        console.error("Error fetching events for alumni:", err);
        res.status(500).send("Server error.");
    }
});

app.post("/rsvp", async (req, res) => {
    if (!loggedInUserEmail) {
        return res.status(401).json({
            success: false,
            message: "You must be logged in to RSVP."
        });
    }
    try {
        const {
            eventId
        } = req.body;
        const alumni = await Alumini.findOne({
            email: loggedInUserEmail
        });
        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found."
            });
        }

        const existingRsvp = await Rsvp.findOne({
            alumniId: alumni._id,
            eventId: eventId
        });
        if (existingRsvp) {
            return res.status(400).json({
                success: false,
                message: "You have already registered for this event."
            });
        }

        const newRsvp = new Rsvp({
            alumniId: alumni._id,
            eventId: eventId
        });
        await newRsvp.save();
        res.status(200).json({
            success: true,
            message: "Successfully registered for the event!"
        });

    } catch (err) {
        console.error("RSVP Error:", err);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request."
        });
    }
});

app.get("/leaderboard", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const [alumni, allAlumni] = await Promise.all([
            Alumini.findOne({
                email: loggedInUserEmail
            }),
            Alumini.find({}).sort({
                name: 1
            }).lean()
        ]);
        if (!alumni) return res.redirect("/");

        const leaderboard = allAlumni.map((user, index) => ({
            ...user,
            rank: index + 1,
            score: (allAlumni.length - index) * 100
        }));

        res.render("alumni_leaderboard", {
            alumni: alumni,
            leaderboard: leaderboard
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.get("/my-profile", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({
            email: loggedInUserEmail
        });
        if (!alumni) return res.redirect("/");
        res.render("alumni_profile", {
            alumni: alumni,
            success: req.query.success
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.get("/alumni-jobs", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const {
            title,
            location
        } = req.query;
        let jobQuery = {};
        if (title) jobQuery.title = {
            $regex: title,
            $options: 'i'
        };
        if (location) jobQuery.location = {
            $regex: location,
            $options: 'i'
        };

        const [alumni, jobs] = await Promise.all([
            Alumini.findOne({
                email: loggedInUserEmail
            }),
            Job.find(jobQuery).populate('postedBy', 'name').sort({
                createdAt: -1
            })
        ]);

        if (!alumni) return res.redirect("/");

        res.render("alumni_jobs", {
            alumni: alumni,
            jobs: jobs,
            titleQuery: title || '',
            locationQuery: location || '',
            currentPage: 'jobs'
        });
    } catch (err) {
        console.error("Error fetching jobs for alumni:", err);
        res.status(500).send("Server error.");
    }
});

app.post("/post-job", async (req, res) => {
    if (!loggedInUserEmail) {
        return res.status(401).json({
            success: false,
            message: "You must be logged in to post a job."
        });
    }
    try {
        const {
            title,
            company,
            location,
            description,
            applicationLink
        } = req.body;
        const alumni = await Alumini.findOne({
            email: loggedInUserEmail
        });
        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found."
            });
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
        res.status(200).json({
            success: true,
            message: "Job posted successfully!"
        });

    } catch (err) {
        console.error("Job Post Error:", err);
        res.status(500).json({
            success: false,
            message: "An error occurred while posting the job."
        });
    }
});

app.get("/alumni-marketplace", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const {
            title,
            category
        } = req.query;
        let query = {};
        if (title) query.title = {
            $regex: title,
            $options: 'i'
        };
        if (category) query.category = category;

        const [alumni, listings] = await Promise.all([
            Alumini.findOne({
                email: loggedInUserEmail
            }),
            Marketplace.find(query).populate('postedBy', 'name batch').sort({
                createdAt: -1
            })
        ]);
        if (!alumni) return res.redirect("/");
        res.render("alumni_marketplace", {
            alumni,
            listings,
            titleQuery: title || '',
            categoryQuery: category || '',
            currentPage: 'marketplace'
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.post("/post-listing", async (req, res) => {
    if (!loggedInUserEmail) {
        return res.status(401).json({
            success: false,
            message: "You must be logged in."
        });
    }
    try {
        const {
            title,
            category,
            description,
            contactInfo
        } = req.body;
        const alumni = await Alumini.findOne({
            email: loggedInUserEmail
        });
        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found."
            });
        }
        const newListing = new Marketplace({
            title,
            category,
            description,
            contactInfo,
            postedBy: alumni._id
        });
        await newListing.save();
        res.status(200).json({
            success: true,
            message: "Listing posted successfully!"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An error occurred."
        });
    }
});


// --- ADMIN & USER MANAGEMENT ROUTES ---
app.get("/admin", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    Promise.all([
            Announcement.find().sort({
                _id: -1
            }).limit(2),
            Event.find(),
            Event.countDocuments({
                status: "Upcoming"
            }),
            Event.countDocuments({
                status: "Completed"
            }),
            PendingRequest.countDocuments()
        ])
        .then(([docs, allEvents, upcomingCount, completedCount, pendingCount]) => {
            res.render("admin", {
                admin: loggedInUserEmail,
                ann: docs.length > 0 ? docs[0].title : "No announcements",
                ann1: docs.length > 1 ? docs[1].title : "No older announcements",
                events: allEvents,
                Upcoming: {
                    length: upcomingCount
                },
                total: {
                    length: completedCount
                },
                pendings: {
                    length: pendingCount
                },
                currentPage: 'dashboard'
            });
        })
        .catch(err => {
            res.status(500).send("Server Error");
        });
});

app.get("/user_management", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    res.render("user_management", {
        admin: loggedInUserEmail,
        currentPage: 'user_management'
    });
});

app.get("/all_users", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const successStatus = req.query.status;
    Promise.all([
        Alumini.find({}),
        Student.find({})
    ]).then(([alumni, students]) => {
        const allUsers = [...alumni, ...students];
        res.render("all_users", {
            users: allUsers,
            admin: loggedInUserEmail,
            successStatus: successStatus,
            currentPage: 'all_users'
        });
    }).catch(err => {
        res.status(500).send("Server error");
    });
});

app.get("/pending-requests", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    PendingRequest.find({}).sort({
            requestDate: 1
        })
        .then(requests => {
            res.render("pending-requests", {
                requests: requests,
                admin: loggedInUserEmail,
                status: req.query.status,
                currentPage: 'pending-requests'
            });
        })
        .catch(err => {
            res.status(500).send("Server error");
        });
});

app.post("/approve-alumni", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const {
        requestId
    } = req.body;
    PendingRequest.findById(requestId)
        .then(request => {
            if (!request) {
                return res.status(404).send("Request not found.");
            }
            const newAlumni = new Alumini({
                name: request.name,
                email: request.email,
                password: request.password,
                batch: request.batch,
                role: "Alumni",
                rno: request.rno,
                course: request.course,
                dept: request.dept
            });
            return newAlumni.save().then(() => PendingRequest.findByIdAndDelete(requestId));
        })
        .then(() => res.redirect("/pending-requests?status=approved"))
        .catch(err => res.status(500).send("Server error."));
});

app.post("/reject-alumni", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const {
        requestId
    } = req.body;
    PendingRequest.findByIdAndDelete(requestId)
        .then(result => {
            if (!result) {
                return res.status(404).send("Request not found.");
            }
            res.redirect("/pending-requests?status=rejected");
        })
        .catch(err => res.status(500).send("Server error."));
});

app.get("/api/search-users", function(req, res) {
    if (!loggedInUserEmail) return res.status(401).send("Unauthorized");
    const {
        name,
        role,
        batch
    } = req.query;
    let query = {};
    if (name) {
        query.name = {
            $regex: name,
            $options: 'i'
        };
    }
    if (batch) {
        query.batch = batch;
    }

    const searchTasks = [];
    if (role === "Student") {
        searchTasks.push(Student.find(query));
    } else if (role === "Alumni") {
        searchTasks.push(Alumini.find(query));
    } else {
        searchTasks.push(Student.find(query));
        searchTasks.push(Alumini.find(query));
    }
    Promise.all(searchTasks)
        .then(results => res.json(results.flat()))
        .catch(err => res.status(500).json({
            error: "An error occurred."
        }));
});

app.get("/api/user/:role/:id", async (req, res) => {
    if (!loggedInUserEmail) return res.status(401).send("Unauthorized");
    try {
        const {
            role,
            id
        } = req.params;
        const Model = role === 'Student' ? Student : Alumini;
        const user = await Model.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/edit-user", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    
    console.log("Received data for /edit-user:", req.body);

    const {
        userId,
        userRole,
        name,
        rno,
        batch,
        course,
        dept,
        password,
        newRole
    } = req.body;

    try {
        const CurrentModel = userRole === 'Student' ? Student : Alumini;
        const TargetModel = newRole === 'Student' ? Student : Alumini;

        const updatedData = {
            name: name,
            rno: rno,
            batch: batch,
            course: course,
            dept: dept,
            role: newRole
        };

        if (password && password.trim() !== '') {
            updatedData.password = password;
        }

        if (newRole === userRole) {
            await CurrentModel.findByIdAndUpdate(userId, updatedData);
        } else {
            const originalUser = await CurrentModel.findByIdAndDelete(userId);
            if (!originalUser) {
                throw new Error("User not found for role transition.");
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
        console.error("Error updating user:", err);
        res.status(500).send("Error updating user.");
    }
});


app.get("/create_student", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    res.render("create_student", {
        admin: loggedInUserEmail,
        success: req.query.success === 'true'
    });
});

app.post("/create_student", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const user = new Student({
        name: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        batch: req.body.batch,
        role: "Student",
        rno: req.body.rollNo,
        course: req.body.Course,
        dept: req.body.department
    });
    user.save()
        .then(() => res.redirect("/create_student?success=true"))
        .catch(() => res.redirect("/create_student?success=false"));
});

app.post("/delete-user", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const {
        userId,
        userRole
    } = req.body;
    let Model = userRole === 'Student' ? Student : Alumini;
    Model.findByIdAndDelete(userId)
        .then(result => {
            if (!result) {
                return res.status(404).send("User not found.");
            }
            res.redirect("/all_users?status=deleteSuccess");
        })
        .catch(err => res.status(500).send("Error deleting user."));
});

app.get("/create_alumni", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    res.render("create_alumni", {
        admin: loggedInUserEmail,
        success: req.query.success === 'true'
    });
});

app.post("/create_alumni", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const user = new Alumini({
        name: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        batch: req.body.batch,
        role: "Alumni",
        rno: req.body.rollNo,
        course: req.body.Course,
        dept: req.body.department
    });
    user.save()
        .then(() => res.redirect("/create_alumni?success=true"))
        .catch(() => res.redirect("/create_alumni?success=false"));
});


// --- ANNOUNCEMENT ROUTES ---
app.get("/announcements", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    Announcement.find({}).sort({
            date: -1
        })
        .then(announcements => {
            res.render("announcements", {
                announcements: announcements,
                admin: loggedInUserEmail,
                success: req.query.success === 'true',
                currentPage: 'announcements'
            });
        })
        .catch(err => res.status(500).send("Server error."));
});

app.post("/create-announcement", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const newAnnouncement = new Announcement({
        title: req.body.title,
        content: req.body.content
    });
    newAnnouncement.save()
        .then(() => res.redirect("/announcements?success=true"))
        .catch(() => res.redirect("/announcements?success=false"));
});


// --- EVENTS ROUTES (FOR ADMIN) ---
app.get("/events", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const {
        title,
        category,
        status
    } = req.query;
    let query = {};
    if (title) query.title = {
        $regex: title,
        $options: 'i'
    };
    if (category) query.category = category;
    if (status) query.status = status;

    Event.find(query).sort({
            created_at: -1
        })
        .then(events => res.render("events", {
            events: events,
            admin: loggedInUserEmail,
            currentPage: 'events'
        }))
        .catch(err => res.status(500).send("Server error."));
});

app.get("/api/event/:id", function(req, res) {
    if (!loggedInUserEmail) return res.status(401).send("Unauthorized");
    Event.findById(req.params.id)
        .then(event => res.json(event))
        .catch(() => res.status(404).json({
            error: "Event not found."
        }));
});

app.post("/create-event", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    const newEvent = new Event(req.body);
    newEvent.save()
        .then(() => res.redirect("/events?status=created"))
        .catch(() => res.redirect("/events?status=failed"));
});

app.post("/edit-event", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    Event.findByIdAndUpdate(req.body.id, req.body)
        .then(() => res.redirect("/events?status=updated"))
        .catch(() => res.status(500).send("Error updating event"));
});

app.post("/delete-event", function(req, res) {
    if (!loggedInUserEmail) return res.redirect("/");
    Event.findByIdAndDelete(req.body.eventId)
        .then(() => res.redirect("/events?status=deleted"))
        .catch(() => res.status(500).send("Error deleting event"));
});

// --- New Feature Routes with Backend Integration ---

// ========== ADMIN ROUTES ==========

// Admin Donations
app.get("/admin-donations", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const [campaigns, donations, stats] = await Promise.all([
            Campaign.find().sort({ createdAt: -1 }),
            Donation.find().populate('campaignId').sort({ date: -1 }).limit(20),
            Donation.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
            ])
        ]);

        const totalRaised = stats[0] ? stats[0].total : 0;
        const totalDonors = stats[0] ? stats[0].count : 0;

        res.render("admin_donations", {
            campaigns,
            donations,
            totalRaised,
            totalDonors,
            activeCampaigns: campaigns.filter(c => c.status === 'Active').length
        });
    } catch (err) {
        console.error("Error fetching donations:", err);
        res.status(500).send("Server error");
    }
});

app.post("/admin-donations/create-campaign", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const newCampaign = new Campaign(req.body);
        await newCampaign.save();
        res.redirect("/admin-donations?status=created");
    } catch (err) {
        console.error("Error creating campaign:", err);
        res.redirect("/admin-donations?status=error");
    }
});

// Admin Feedback
app.get("/admin-feedback", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const [allFeedback, pendingCount, reviewedCount] = await Promise.all([
            Feedback.find().sort({ createdAt: -1 }),
            Feedback.countDocuments({ status: 'Pending' }),
            Feedback.countDocuments({ status: 'Reviewed' })
        ]);

        const curriculumFeedback = allFeedback.filter(f => f.type === 'Curriculum');
        const generalFeedback = allFeedback.filter(f => f.type !== 'Curriculum');

        res.render("admin_feedback", {
            curriculumFeedback,
            generalFeedback,
            pendingCount,
            reviewedCount,
            totalFeedback: allFeedback.length
        });
    } catch (err) {
        console.error("Error fetching feedback:", err);
        res.status(500).send("Server error");
    }
});

app.post("/admin-feedback/respond", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        await Feedback.findByIdAndUpdate(req.body.feedbackId, {
            adminResponse: req.body.response,
            status: 'Reviewed'
        });
        res.redirect("/admin-feedback?status=responded");
    } catch (err) {
        console.error("Error responding to feedback:", err);
        res.redirect("/admin-feedback?status=error");
    }
});

// ========== STUDENT ROUTES ==========

// Student Network
app.get("/student-network", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        if (!student) return res.redirect("/");

        const [connections, pendingRequests, allUsers] = await Promise.all([
            Connection.find({
                $or: [
                    { requesterId: student._id, status: 'Accepted' },
                    { recipientId: student._id, status: 'Accepted' }
                ]
            }).populate('requesterId recipientId'),
            Connection.find({
                recipientId: student._id,
                status: 'Pending'
            }).populate('requesterId'),
            Promise.all([
                Student.find({ _id: { $ne: student._id } }).limit(10),
                Alumini.find().limit(10)
            ])
        ]);

        const networkStats = {
            totalConnections: connections.length,
            alumniConnections: connections.filter(c => 
                (c.requesterId && c.requesterId.role === 'Alumni') || 
                (c.recipientId && c.recipientId.role === 'Alumni')
            ).length,
            studentConnections: connections.filter(c => 
                (c.requesterId && c.requesterId.role !== 'Alumni') || 
                (c.recipientId && c.recipientId.role !== 'Alumni')
            ).length,
            pendingRequests: pendingRequests.length
        };

        res.render("student_network", {
            student,
            connections,
            pendingRequests,
            suggestedUsers: [...allUsers[0], ...allUsers[1]],
            networkStats
        });
    } catch (err) {
        console.error("Error fetching network:", err);
        res.status(500).send("Server error");
    }
});

app.post("/student-network/connect", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        const newConnection = new Connection({
            requesterId: student._id,
            requesterModel: 'student',
            recipientId: req.body.recipientId,
            recipientModel: req.body.recipientModel,
            status: 'Pending'
        });
        await newConnection.save();
        res.redirect("/student-network?status=sent");
    } catch (err) {
        console.error("Error sending connection:", err);
        res.redirect("/student-network?status=error");
    }
});

app.post("/student-network/accept", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        await Connection.findByIdAndUpdate(req.body.connectionId, { status: 'Accepted' });
        res.redirect("/student-network?status=accepted");
    } catch (err) {
        console.error("Error accepting connection:", err);
        res.redirect("/student-network?status=error");
    }
});

// Student Mentorship
app.get("/student-mentorship", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        if (!student) return res.redirect("/");

        const [activeMentorships, pendingMentorships, availableMentors] = await Promise.all([
            Mentorship.find({ menteeId: student._id, status: 'Active' }).populate('mentorId'),
            Mentorship.find({ menteeId: student._id, status: 'Pending' }).populate('mentorId'),
            Alumini.find().limit(12)
        ]);

        const mentorshipStats = {
            active: activeMentorships.length,
            pending: pendingMentorships.length,
            completedSessions: activeMentorships.reduce((sum, m) => sum + Math.floor(m.progress / 10), 0)
        };

        res.render("student_mentorship", {
            student,
            activeMentorships,
            pendingMentorships,
            availableMentors,
            mentorshipStats
        });
    } catch (err) {
        console.error("Error fetching mentorship:", err);
        res.status(500).send("Server error");
    }
});

app.post("/student-mentorship/request", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        const newMentorship = new Mentorship({
            mentorId: req.body.mentorId,
            menteeId: student._id,
            areaOfInterest: req.body.areaOfInterest,
            description: req.body.description,
            frequency: req.body.frequency,
            status: 'Pending'
        });
        await newMentorship.save();
        res.redirect("/student-mentorship?status=requested");
    } catch (err) {
        console.error("Error requesting mentorship:", err);
        res.redirect("/student-mentorship?status=error");
    }
});

// Student Connect/Messaging
app.get("/student-connect", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        if (!student) return res.redirect("/");

        const connections = await Connection.find({
            $or: [
                { requesterId: student._id, status: 'Accepted' },
                { recipientId: student._id, status: 'Accepted' }
            ]
        }).populate('requesterId recipientId');

        const connectedUsers = connections.map(conn => 
            conn.requesterId._id.equals(student._id) ? conn.recipientId : conn.requesterId
        );

        let messages = [];
        if (req.query.user) {
            messages = await Message.find({
                $or: [
                    { senderId: student._id, recipientId: req.query.user },
                    { senderId: req.query.user, recipientId: student._id }
                ]
            }).sort({ createdAt: 1 });
        }

        res.render("student_connect", {
            student,
            connectedUsers,
            messages,
            activeUserId: req.query.user || null
        });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).send("Server error");
    }
});

app.post("/student-connect/send", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        const newMessage = new Message({
            senderId: student._id,
            senderModel: 'student',
            recipientId: req.body.recipientId,
            recipientModel: req.body.recipientModel,
            content: req.body.content
        });
        await newMessage.save();
        res.redirect(`/student-connect?user=${req.body.recipientId}`);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).send("Server error");
    }
});

// Student Donations
app.get("/student-donations", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        if (!student) return res.redirect("/");

        const [campaigns, myDonations, stats] = await Promise.all([
            Campaign.find({ status: 'Active' }).sort({ createdAt: -1 }),
            Donation.find({ donorId: student._id }).populate('campaignId').sort({ date: -1 }),
            Donation.aggregate([
                { $match: { donorId: student._id } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const totalContributions = stats[0] ? stats[0].total : 0;

        res.render("student_donations", {
            student,
            campaigns,
            myDonations,
            totalContributions
        });
    } catch (err) {
        console.error("Error fetching donations:", err);
        res.status(500).send("Server error");
    }
});

app.post("/student-donations/donate", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        const newDonation = new Donation({
            donorId: student._id,
            donorModel: 'student',
            donorName: student.name,
            donorEmail: student.email,
            campaignId: req.body.campaignId,
            amount: req.body.amount,
            paymentMethod: req.body.paymentMethod,
            anonymous: req.body.anonymous === 'on',
            status: 'Completed'
        });
        await newDonation.save();

        // Update campaign amount
        await Campaign.findByIdAndUpdate(req.body.campaignId, {
            $inc: { currentAmount: req.body.amount }
        });

        res.redirect("/student-donations?status=success");
    } catch (err) {
        console.error("Error processing donation:", err);
        res.redirect("/student-donations?status=error");
    }
});

// Student Curriculum Feedback
app.get("/student-curriculum-feedback", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        if (!student) return res.redirect("/");

        const myFeedback = await Feedback.find({
            submittedBy: student._id,
            type: 'Curriculum'
        }).sort({ createdAt: -1 });

        res.render("student_curriculum_feedback", {
            student,
            myFeedback,
            courses: ['Database Management Systems', 'Software Engineering', 'Operating Systems', 'Computer Networks']
        });
    } catch (err) {
        console.error("Error fetching curriculum feedback:", err);
        res.status(500).send("Server error");
    }
});

app.post("/student-curriculum-feedback/submit", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        const newFeedback = new Feedback({
            type: 'Curriculum',
            submittedBy: student._id,
            submitterModel: 'student',
            submitterName: student.name,
            submitterEmail: student.email,
            course: req.body.course,
            semester: req.body.semester,
            rating: req.body.rating,
            message: req.body.message,
            status: 'Pending'
        });
        await newFeedback.save();
        res.redirect("/student-curriculum-feedback?status=submitted");
    } catch (err) {
        console.error("Error submitting feedback:", err);
        res.redirect("/student-curriculum-feedback?status=error");
    }
});

// Student General Feedback
app.get("/student-feedback", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        if (!student) return res.redirect("/");

        const myFeedback = await Feedback.find({
            submittedBy: student._id,
            type: { $ne: 'Curriculum' }
        }).sort({ createdAt: -1 });

        const feedbackStats = {
            total: myFeedback.length,
            pending: myFeedback.filter(f => f.status === 'Pending').length,
            resolved: myFeedback.filter(f => f.status === 'Resolved').length
        };

        res.render("student_feedback", {
            student,
            myFeedback,
            feedbackStats
        });
    } catch (err) {
        console.error("Error fetching feedback:", err);
        res.status(500).send("Server error");
    }
});

app.post("/student-feedback/submit", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const student = await Student.findOne({ email: loggedInUserEmail });
        const newFeedback = new Feedback({
            type: req.body.type || 'General',
            submittedBy: student._id,
            submitterModel: 'student',
            submitterName: student.name,
            submitterEmail: student.email,
            subject: req.body.subject,
            message: req.body.message,
            priority: req.body.priority,
            status: 'Pending'
        });
        await newFeedback.save();
        res.redirect("/student-feedback?status=submitted");
    } catch (err) {
        console.error("Error submitting feedback:", err);
        res.redirect("/student-feedback?status=error");
    }
});

// ========== ALUMNI ROUTES ==========

// Alumni Network
app.get("/alumni-network", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        const [connections, pendingRequests, allUsers] = await Promise.all([
            Connection.find({
                $or: [
                    { requesterId: alumni._id, status: 'Accepted' },
                    { recipientId: alumni._id, status: 'Accepted' }
                ]
            }).populate('requesterId recipientId'),
            Connection.find({
                recipientId: alumni._id,
                status: 'Pending'
            }).populate('requesterId'),
            Promise.all([
                Student.find().limit(10),
                Alumini.find({ _id: { $ne: alumni._id } }).limit(10)
            ])
        ]);

        const networkStats = {
            totalConnections: connections.length,
            alumniConnections: connections.filter(c => 
                (c.requesterId && c.requesterId.role === 'Alumni') || 
                (c.recipientId && c.recipientId.role === 'Alumni')
            ).length,
            studentMentees: connections.filter(c => 
                (c.requesterId && c.requesterId.role !== 'Alumni') || 
                (c.recipientId && c.recipientId.role !== 'Alumni')
            ).length,
            pendingRequests: pendingRequests.length
        };

        res.render("alumni_network", {
            alumni,
            connections,
            pendingRequests,
            suggestedUsers: [...allUsers[0], ...allUsers[1]],
            networkStats,
            currentPage: 'network'
        });
    } catch (err) {
        console.error("Error fetching network:", err);
        res.status(500).send("Server error");
    }
});

app.post("/alumni-network/accept", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        await Connection.findByIdAndUpdate(req.body.connectionId, { status: 'Accepted' });
        res.redirect("/alumni-network?status=accepted");
    } catch (err) {
        console.error("Error accepting connection:", err);
        res.redirect("/alumni-network?status=error");
    }
});

// Alumni Mentorship
app.get("/alumni-mentorship", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        const [activeMentorships, pendingRequests, completedSessions] = await Promise.all([
            Mentorship.find({ mentorId: alumni._id, status: 'Active' }).populate('menteeId'),
            Mentorship.find({ mentorId: alumni._id, status: 'Pending' }).populate('menteeId'),
            Mentorship.countDocuments({ mentorId: alumni._id, status: 'Completed' })
        ]);

        const mentorshipStats = {
            active: activeMentorships.length,
            pending: pendingRequests.length,
            completedSessions: completedSessions
        };

        res.render("alumni_mentorship", {
            alumni,
            activeMentorships,
            pendingRequests,
            mentorshipStats,
            currentPage: 'mentorship'
        });
    } catch (err) {
        console.error("Error fetching mentorship:", err);
        res.status(500).send("Server error");
    }
});

app.post("/alumni-mentorship/accept", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        await Mentorship.findByIdAndUpdate(req.body.mentorshipId, { status: 'Active' });
        res.redirect("/alumni-mentorship?status=accepted");
    } catch (err) {
        console.error("Error accepting mentorship:", err);
        res.redirect("/alumni-mentorship?status=error");
    }
});

// Alumni Connect
app.get("/alumni-connect", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        const connections = await Connection.find({
            $or: [
                { requesterId: alumni._id, status: 'Accepted' },
                { recipientId: alumni._id, status: 'Accepted' }
            ]
        }).populate('requesterId recipientId');

        const connectedUsers = connections.map(conn => 
            conn.requesterId._id.equals(alumni._id) ? conn.recipientId : conn.requesterId
        );

        let messages = [];
        if (req.query.user) {
            messages = await Message.find({
                $or: [
                    { senderId: alumni._id, recipientId: req.query.user },
                    { senderId: req.query.user, recipientId: alumni._id }
                ]
            }).sort({ createdAt: 1 });
        }

        res.render("alumni_connect", {
            alumni,
            connectedUsers,
            messages,
            activeUserId: req.query.user || null,
            currentPage: 'connect'
        });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).send("Server error");
    }
});

app.post("/alumni-connect/send", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        const newMessage = new Message({
            senderId: alumni._id,
            senderModel: 'alumini',
            recipientId: req.body.recipientId,
            recipientModel: req.body.recipientModel,
            content: req.body.content
        });
        await newMessage.save();
        res.redirect(`/alumni-connect?user=${req.body.recipientId}`);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).send("Server error");
    }
});

// Alumni Donations
app.get("/alumni-donations", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        const [campaigns, myDonations, stats] = await Promise.all([
            Campaign.find({ status: 'Active' }).sort({ createdAt: -1 }),
            Donation.find({ donorId: alumni._id }).populate('campaignId').sort({ date: -1 }),
            Donation.aggregate([
                { $match: { donorId: alumni._id } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const totalContributions = stats[0] ? stats[0].total : 0;
        let donorBadge = 'Bronze';
        if (totalContributions >= 25000) donorBadge = 'Gold';
        else if (totalContributions >= 10000) donorBadge = 'Silver';

        res.render("alumni_donations", {
            alumni,
            campaigns,
            myDonations,
            totalContributions,
            donorBadge,
            currentPage: 'donations'
        });
    } catch (err) {
        console.error("Error fetching donations:", err);
        res.status(500).send("Server error");
    }
});

app.post("/alumni-donations/donate", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        const newDonation = new Donation({
            donorId: alumni._id,
            donorModel: 'alumini',
            donorName: alumni.name,
            donorEmail: alumni.email,
            campaignId: req.body.campaignId,
            amount: req.body.amount,
            paymentMethod: req.body.paymentMethod,
            anonymous: req.body.anonymous === 'on',
            status: 'Completed'
        });
        await newDonation.save();

        // Update campaign amount
        await Campaign.findByIdAndUpdate(req.body.campaignId, {
            $inc: { currentAmount: req.body.amount }
        });

        res.redirect("/alumni-donations?status=success");
    } catch (err) {
        console.error("Error processing donation:", err);
        res.redirect("/alumni-donations?status=error");
    }
});

// Alumni Feedback
app.get("/alumni-feedback", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        const myFeedback = await Feedback.find({
            submittedBy: alumni._id
        }).sort({ createdAt: -1 });

        const feedbackStats = {
            total: myFeedback.length,
            pending: myFeedback.filter(f => f.status === 'Pending').length,
            implemented: myFeedback.filter(f => f.status === 'Resolved').length
        };

        res.render("alumni_feedback", {
            alumni,
            myFeedback,
            feedbackStats,
            currentPage: 'feedback'
        });
    } catch (err) {
        console.error("Error fetching feedback:", err);
        res.status(500).send("Server error");
    }
});

app.post("/alumni-feedback/submit", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        const newFeedback = new Feedback({
            type: req.body.type || 'General',
            submittedBy: alumni._id,
            submitterModel: 'alumini',
            submitterName: alumni.name,
            submitterEmail: alumni.email,
            subject: req.body.subject,
            message: req.body.message,
            rating: req.body.rating,
            priority: req.body.priority || 'Medium',
            status: 'Pending'
        });
        await newFeedback.save();
        res.redirect("/alumni-feedback?status=submitted");
    } catch (err) {
        console.error("Error submitting feedback:", err);
        res.redirect("/alumni-feedback?status=error");
    }
});

// ========== ALUMNI PROFILE MANAGEMENT ==========

// View Profile
app.get("/alumni-profile", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        // Calculate profile stats
        const [connectionsCount, menteesCount, eventsCount, donationsTotal] = await Promise.all([
            Connection.countDocuments({
                $or: [
                    { requesterId: alumni._id, status: 'Accepted' },
                    { recipientId: alumni._id, status: 'Accepted' }
                ]
            }),
            Mentorship.countDocuments({ mentorId: alumni._id, status: 'Active' }),
            Rsvp.countDocuments({ alumniId: alumni._id }),
            Donation.aggregate([
                { $match: { donorId: alumni._id } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const stats = {
            connections: connectionsCount,
            mentees: menteesCount,
            eventsAttended: eventsCount,
            totalDonations: donationsTotal[0] ? donationsTotal[0].total : 0
        };

        res.render("alumni_profile", {
            alumni,
            stats,
            currentPage: 'profile'
        });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).send("Server error");
    }
});

// Edit Profile Page
app.get("/alumni-edit-profile", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        res.render("alumni_edit_profile", {
            alumni,
            currentPage: 'profile'
        });
    } catch (err) {
        console.error("Error loading edit profile:", err);
        res.status(500).send("Server error");
    }
});

// Update Profile
app.post("/alumni-update-profile", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        // Extract skills array from form data
        let skills = [];
        if (req.body['skills[]']) {
            skills = Array.isArray(req.body['skills[]']) ? req.body['skills[]'] : [req.body['skills[]']];
        }

        // Update alumni profile
        const updateData = {
            name: req.body.name,
            phone: req.body.phone,
            dob: req.body.dob,
            gender: req.body.gender,
            location: req.body.location,
            bio: req.body.bio,
            course: req.body.course,
            company: req.body.company,
            designation: req.body.designation,
            industry: req.body.industry,
            experience: req.body.experience,
            skills: skills,
            linkedin: req.body.linkedin,
            github: req.body.github,
            twitter: req.body.twitter,
            website: req.body.website,
            updatedAt: new Date()
        };

        await Alumini.findByIdAndUpdate(alumni._id, updateData);

        res.redirect("/alumni-profile?updated=true");
    } catch (err) {
        console.error("Error updating profile:", err);
        res.redirect("/alumni-edit-profile?error=true");
    }
});

// Alumni Leaderboard (fixing the route)
app.get("/alumni-leaderboard", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) return res.redirect("/");

        // Fetch all alumni and calculate their scores
        const allAlumni = await Alumini.find().sort({ batch: -1 });
        
        // Calculate scores for each alumni based on their contributions
        const leaderboardPromises = allAlumni.map(async (user) => {
            const [mentorships, donations, connections] = await Promise.all([
                Mentorship.countDocuments({ mentorId: user._id, status: 'Active' }),
                Donation.aggregate([
                    { $match: { donorId: user._id } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]),
                Connection.countDocuments({
                    $or: [
                        { requesterId: user._id, status: 'Accepted' },
                        { recipientId: user._id, status: 'Accepted' }
                    ]
                })
            ]);

            const donationTotal = donations[0] ? donations[0].total : 0;
            // Score calculation: mentorships * 100 + donations/100 + connections * 10
            const score = (mentorships * 100) + (donationTotal / 100) + (connections * 10);

            return {
                _id: user._id,
                name: user.name,
                batch: user.batch,
                company: user.company || 'Not Specified',
                dept: user.dept,
                score: Math.round(score),
                mentorships,
                donations: donationTotal,
                connections
            };
        });

        const leaderboard = (await Promise.all(leaderboardPromises))
            .sort((a, b) => b.score - a.score)
            .map((user, index) => ({ ...user, rank: index + 1 }));

        res.render("alumni_leaderboard", {
            alumni,
            leaderboard,
            currentPage: 'leaderboard'
        });
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        res.status(500).send("Server error");
    }
});

// Logout route
app.get("/logout", (req, res) => {
    loggedInUserEmail = null;
    res.redirect("/?status=logged_out");
});

app.post("/alumni-feedback/submit", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        const newFeedback = new Feedback({
            type: req.body.type || 'General',
            submittedBy: alumni._id,
            submitterModel: 'alumini',
            submitterName: alumni.name,
            submitterEmail: alumni.email,
            subject: req.body.subject,
            message: req.body.message,
            rating: req.body.rating,
            priority: req.body.priority || 'Medium',
            status: 'Pending'
        });
        await newFeedback.save();
        res.redirect("/alumni-feedback?status=submitted");
    } catch (err) {
        console.error("Error submitting feedback:", err);
        res.redirect("/alumni-feedback?status=error");
    }
});

// --- Server Listener ---
app.listen(3000, function(req, res) {
    console.log("Server is running on port 3000\n");
});

