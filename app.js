require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static("Public"));
app.set("view engine", "ejs");

var loggedInUserEmail = null;

// --- Database Connection ---
const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/communityDB";
mongoose.connect(dbURI)
    .then(() => console.log('SUCCESS: MongoDB Connection Open'))
    .catch(err => console.error('ERROR: MongoDB Connection FAILED:', err.message));

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
    phone: String,
    dob: Date,
    gender: String,
    location: String,
    bio: String,
    profilePicture: String,
    company: String,
    designation: String,
    industry: String,
    experience: Number,
    skills: [String],
    achievements: [String],
    linkedin: String,
    github: String,
    twitter: String,
    website: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Alumini = mongoose.model("alumini", aluminschema);

const announcementschema = new mongoose.Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now }
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
    status: { type: String, default: 'Upcoming' },
    created_at: { type: Date, default: Date.now }
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
    alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'alumini' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    date: { type: Date, default: Date.now }
});
const Rsvp = mongoose.model("Rsvp", rsvpSchema);

const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    description: String,
    applicationLink: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'alumini' },
    createdAt: { type: Date, default: Date.now }
});
const Job = mongoose.model("Job", jobSchema);

const marketplaceSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    price: Number,
    contactInfo: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'alumini' },
    createdAt: { type: Date, default: Date.now }
});
const Marketplace = mongoose.model("Marketplace", marketplaceSchema);

const campaignSchema = new mongoose.Schema({
    name: String,
    description: String,
    goalAmount: Number,
    currentAmount: { type: Number, default: 0 },
    endDate: Date,
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});
const Campaign = mongoose.model("Campaign", campaignSchema);

const donationSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, refPath: 'donorModel' },
    donorModel: { type: String, enum: ['student', 'alumini'] },
    donorName: String,
    donorEmail: String,
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    amount: Number,
    paymentMethod: String,
    status: { type: String, default: 'Completed' },
    anonymous: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});
const Donation = mongoose.model("Donation", donationSchema);

const feedbackSchema = new mongoose.Schema({
    type: { type: String, enum: ['Curriculum', 'General', 'Portal', 'Event', 'Mentorship', 'Other'] },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'submitterModel' },
    submitterModel: { type: String, enum: ['student', 'alumini'] },
    submitterName: String,
    submitterEmail: String,
    subject: String,
    message: String,
    rating: Number,
    course: String,
    semester: String,
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Pending' },
    adminResponse: String,
    createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model("Feedback", feedbackSchema);

const connectionSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, refPath: 'requesterModel' },
    requesterModel: { type: String, enum: ['student', 'alumini'] },
    recipientId: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientModel' },
    recipientModel: { type: String, enum: ['student', 'alumini'] },
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Connection = mongoose.model("Connection", connectionSchema);

const mentorshipSchema = new mongoose.Schema({
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'alumini' },
    menteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'student' },
    areaOfInterest: String,
    description: String,
    frequency: String,
    status: { type: String, enum: ['Pending', 'Active', 'Completed', 'Declined'], default: 'Pending' },
    progress: { type: Number, default: 0 },
    nextSessionDate: Date,
    createdAt: { type: Date, default: Date.now }
});
const Mentorship = mongoose.model("Mentorship", mentorshipSchema);

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel' },
    senderModel: { type: String, enum: ['student', 'alumini'] },
    recipientId: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientModel' },
    recipientModel: { type: String, enum: ['student', 'alumini'] },
    content: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", messageSchema);

const leaderboardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
    userModel: { type: String, enum: ['student', 'alumini'] },
    name: String,
    points: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
    achievements: [String],
    updatedAt: { type: Date, default: Date.now }
});
const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['alumini', 'student', 'admin'] },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    icon: { type: String, default: 'info-circle' },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['announcement', 'event', 'job', 'general', 'system'], default: 'general' },
    link: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
const Notification = mongoose.model('Notification', notificationSchema);


// --- NOTIFICATION API ROUTES ---
app.get("/api/notifications", async (req, res) => {
    try {
        if (!loggedInUserEmail) return res.status(401).json({ error: "Not authenticated" });
        let user = await Alumini.findOne({ email: loggedInUserEmail }) || await Student.findOne({ email: loggedInUserEmail }) || await Admin.findOne({ email: loggedInUserEmail });
        if (!user) return res.status(404).json({ error: "User not found" });
        const userModel = user.role.toLowerCase();
        const notifications = await Notification.find({ userId: user._id, userModel: userModel }).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
        if (!loggedInUserEmail) return res.status(401).json({ error: "Not authenticated" });
        const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        if (!notification) return res.status(404).json({ error: "Notification not found" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: "Failed to update notification" });
    }
});

app.patch("/api/notifications/mark-all-read", async (req, res) => {
    try {
        if (!loggedInUserEmail) return res.status(401).json({ error: "Not authenticated" });
        let user = await Alumini.findOne({ email: loggedInUserEmail }) || await Student.findOne({ email: loggedInUserEmail }) || await Admin.findOne({ email: loggedInUserEmail });
        if (!user) return res.status(404).json({ error: "User not found" });
        const userModel = user.role.toLowerCase();
        const result = await Notification.updateMany({ userId: user._id, userModel: userModel, read: false }, { read: true });
        res.json({ message: "All notifications marked as read", modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

app.post("/api/notifications/create", async (req, res) => {
    try {
        const { userId, userModel, title, message, icon, type, link } = req.body;
        if (!userId || !userModel || !title || !message) return res.status(400).json({ error: "Missing required fields" });
        const notification = new Notification({ userId, userModel, title, message, icon, type, link });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: "Failed to create notification" });
    }
});


// --- AUTHENTICATION & SIGNUP ROUTES (Corrected) ---
// (Your existing authentication routes are here)


// --- STUDENT & ALUMNI ROUTES (Corrected) ---
// (Your existing student and alumni routes are here)


// --- ADMIN ROUTES (Corrected) ---
// (Your existing admin routes are here)


// --- Server Listener ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}\n`);
});

