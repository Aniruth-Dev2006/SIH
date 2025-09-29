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

app.get("/student-donations", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const [student, campaigns] = await Promise.all([
            Student.findOne({ email: loggedInUserEmail }),
            Campaign.find().sort({ createdAt: -1 })
        ]);
        if (!student) return res.redirect("/");
        res.render("student_donations", { 
            student, 
            campaigns,
            status: req.query.status
        });
    } catch (err) {
        res.status(500).send("Server error.");
    }
});

app.post("/make-donation", async (req, res) => {
    if (!loggedInUserEmail) return res.redirect("/");
    try {
        const { campaignId, amount, donorName } = req.body;
        
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.redirect("/student-donations?status=error");

        const donationAmount = Number(amount);
        
        const newDonation = new Donation({
            campaignId,
            donorName: donorName || 'Anonymous',
            donorEmail: loggedInUserEmail,
            amount: donationAmount
        });
        await newDonation.save();
        
        campaign.currentAmount += donationAmount;
        await campaign.save();
        
        res.redirect("/student-donations?status=success");
    } catch (err) {
        console.error("Error making donation:", err);
        res.redirect("/student-donations?status=error");
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

    const {
        userId,
        originalRole,
        name,
        rno,
        batch,
        course,
        dept,
        password,
        role
    } = req.body;

    try {
        const CurrentModel = originalRole === 'Student' ? Student : Alumini;
        const TargetModel = role === 'Student' ? Student : Alumini;

        const updatedData = {
            name,
            rno,
            batch,
            course,
            dept,
            role
        };

        if (password && password.trim() !== '') {
            updatedData.password = password;
        }

        if (role === originalRole) {
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

// --- Server Listener ---
app.listen(3000, function(req, res) {
    console.log("Server is running on port 3000\n");
});

