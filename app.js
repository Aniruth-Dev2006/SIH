const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser= require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.set("view engine", "ejs");

// Using a global variable to track the logged-in user.
// NOTE: This is not secure for a production environment.
var loggedInUserEmail = null; 

// --- Database Connection ---
mongoose.connect("mongodb://localhost:27017/communityDB");

// --- Schemas ---
const adminschema = new mongoose.Schema({ email:String, password:String });
const Admin = mongoose.model("admin",adminschema);

const studentschema = new mongoose.Schema({ name:String, email:String, password:String, batch:String, role:String, rno:String,course:String,dept:String });
const Student = mongoose.model("student",studentschema);

const aluminschema = new mongoose.Schema({ name:String, email:String, password:String, batch:String, role:String, rno:String,course:String,dept:String });
const Alumini = mongoose.model("alumini",aluminschema);

const announcementschema = new mongoose.Schema({ title: String, content: String, date: { type: Date, default: Date.now } });
const Announcement = mongoose.model("Announcement", announcementschema);

const eventschema = new mongoose.Schema({
    title: String, date: String, time: String, venue_name: String,
    venue_link: String, description: String, organizer_name: String,
    organizer_contact: String, category: String,
    status: { type: String, default: 'Upcoming' },
    created_at: { type: Date, default: Date.now }
});
const Event = mongoose.model("Event", eventschema);

const pendingRequestSchema = new mongoose.Schema({
    name: String, email: String, password: String, batch: String,
    role: String, rno: String, course: String, dept: String
});
const PendingRequest = mongoose.model("pendingRequest", pendingRequestSchema);


// --- AUTHENTICATION & SIGNUP ROUTES ---

app.get("/", function(req, res){
    loggedInUserEmail = null; // Reset on visiting login page
    res.render("login");
});

app.post("/", async function (req, res) {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email, password });
        if (admin) {
            loggedInUserEmail = admin.email;
            return res.redirect("/admin");
        }
        const pending = await PendingRequest.findOne({ email, password });
        if (pending) {
            return res.redirect("/?status=pending_approval");
        }
        const alumni = await Alumini.findOne({ email, password });
        if (alumni) {
            loggedInUserEmail = alumni.email;
            return res.redirect("/alumni-dashboard");
        }
        const student = await Student.findOne({ email, password });
        if (student) {
            loggedInUserEmail = student.email;
            return res.send("student logged in"); // Placeholder for student dashboard
        }
        res.redirect("/?status=login_failed");
    } catch (err) {
        console.log("Login Error: " + err);
        res.status(500).send("Server error during login.");
    }
});

app.get("/signup", function(req, res){
    res.render("signup");
});

app.post("/signup", async function(req, res){
    const { name, email, password, batch, rno, course, dept } = req.body;
    try {
        const existingUser = await Alumini.findOne({ email }) || await Student.findOne({ email }) || await Admin.findOne({ email }) || await PendingRequest.findOne({ email });
        if (existingUser) {
            return res.redirect("/signup?status=email_exists");
        }
        const newRequest = new PendingRequest({ name, email, password, batch, rno, course, dept, role: 'Alumni' });
        await newRequest.save();
        res.redirect("/?status=signup_success");
    } catch (err) {
        console.error("Error creating pending request:", err);
        res.status(500).send("Error submitting request.");
    }
});

// --- ALUMNI DASHBOARD ROUTE ---
app.get("/alumni-dashboard", async (req, res) => {
    if (!loggedInUserEmail) {
        return res.redirect("/");
    }

    try {
        const alumni = await Alumini.findOne({ email: loggedInUserEmail });
        if (!alumni) {
            return res.redirect("/");
        }

        // Mock data for dashboard cards
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

        res.render("alumni_dashboard", {
            alumni: alumni,
            ...dashboardData
        });

    } catch (err) {
        console.error("Error fetching alumni dashboard data:", err);
        res.status(500).send("Server error.");
    }
});


// --- ADMIN & USER MANAGEMENT ROUTES ---
app.get("/admin", function(req, res) {
    // A simple check if an admin is logged in
    if(!loggedInUserEmail) return res.redirect("/");

    Promise.all([
        Announcement.find().sort({ _id: -1 }).limit(2),
        Event.find(),
        Event.countDocuments({ status: "Upcoming" }),
        Event.countDocuments({ status: "Completed" }),
        PendingRequest.countDocuments()
    ])
    .then(([docs, allEvents, upcomingCount, completedCount, pendingCount]) => {
        res.render("admin", {
            admin: loggedInUserEmail,
            ann: docs.length > 0 ? docs[0].title : "No announcements",
            ann1: docs.length > 1 ? docs[1].title : "No older announcements",
            events: allEvents,
            Upcoming: { length: upcomingCount },
            total: { length: completedCount },
            pendings: { length: pendingCount }
        });
    })
    .catch(err => {
        console.log("error " + err);
        res.status(500).send("Server Error");
    });
});

app.get("/user_management", function(req, res){
    if(!loggedInUserEmail) return res.redirect("/");
    res.render("user_management",{admin: loggedInUserEmail});
});

app.get("/all_users", function(req, res){
    if(!loggedInUserEmail) return res.redirect("/");
    const deleteSuccess = req.query.deleteSuccess === 'true';
    const editSuccess = req.query.editSuccess === 'true';
    Promise.all([
        Alumini.find({}),
        Student.find({})
    ]).then(([alumni, students]) => {
        const allUsers = [...alumni, ...students];
        res.render("all_users", { 
            users: allUsers, 
            admin: loggedInUserEmail,
            deleteSuccess: deleteSuccess,
            editSuccess: editSuccess
        });
    }).catch(err => {
        console.log("error " + err);
        res.status(500).send("Server error");
    });
});

app.get("/pending-requests", function(req, res){
    if(!loggedInUserEmail) return res.redirect("/");
    PendingRequest.find({})
        .then(requests => {
            res.render("pending-requests", {
                requests: requests,
                admin: loggedInUserEmail
            });
        })
        .catch(err => {
            console.error("Error fetching pending requests:", err);
            res.status(500).send("Server error");
        });
});

app.post("/approve-alumni", function(req, res){
    if(!loggedInUserEmail) return res.redirect("/");
    const { requestId } = req.body;
    PendingRequest.findById(requestId)
        .then(request => {
            if (!request) {
                return res.status(404).send("Request not found.");
            }
            const newAlumni = new Alumini({
                name: request.name, email: request.email, password: request.password,
                batch: request.batch, role: "Alumni", rno: request.rno,
                course: request.course, dept: request.dept
            });
            return newAlumni.save().then(() => PendingRequest.findByIdAndDelete(requestId));
        })
        .then(() => {
            res.redirect("/pending-requests?status=approved");
        })
        .catch(err => {
            console.error("Error approving request:", err);
            res.status(500).send("Server error.");
        });
});

app.post("/reject-alumni", function(req, res){
    if(!loggedInUserEmail) return res.redirect("/");
    const { requestId } = req.body;
    PendingRequest.findByIdAndDelete(requestId)
        .then(result => {
            if (!result) {
                return res.status(404).send("Request not found.");
            }
            res.redirect("/pending-requests?status=rejected");
        })
        .catch(err => {
            console.error("Error rejecting request:", err);
            res.status(500).send("Server error.");
        });
});

app.get("/api/search-users", function(req, res) {
    if(!loggedInUserEmail) return res.status(401).send("Unauthorized");
    const { name, role, batch } = req.query;
    let query = {};
    if (name) { query.name = { $regex: name, $options: 'i' }; }
    if (batch) { query.batch = batch; }

    const searchTasks = [];
    if (role === "Student") { searchTasks.push(Student.find(query)); }
    else if (role === "Alumni") { searchTasks.push(Alumini.find(query)); }
    else {
        searchTasks.push(Student.find(query));
        searchTasks.push(Alumini.find(query));
    }
    Promise.all(searchTasks)
        .then(results => res.json(results.flat()))
        .catch(err => res.status(500).json({ error: "An error occurred." }));
});

app.get("/create_student", function(req,res){
    if(!loggedInUserEmail) return res.redirect("/");
    res.render("create_student", { admin: loggedInUserEmail, success: req.query.success === 'true' });
});

app.post("/create_student", function(req,res){
  if(!loggedInUserEmail) return res.redirect("/");
  const user = new Student({
    name:req.body.fullName, email:req.body.email, password:req.body.password,
    batch:req.body.batch, role:"Student", rno:req.body.rollNo,
    course:req.body.Course, dept:req.body.department
  });
  user.save()
    .then(() => res.redirect("/create_student?success=true"))
    .catch(() => res.redirect("/create_student?success=false"));
});

app.get("/api/user/:role/:id", async (req, res) => {
    if(!loggedInUserEmail) return res.status(401).send("Unauthorized");
    try {
        const { role, id } = req.params;
        const Model = role === 'Student' ? Student : Alumini;
        const user = await Model.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/edit-user", async (req, res) => {
    if(!loggedInUserEmail) return res.redirect("/");
    const { userId, userRole, newRole, name, rno, batch, course, dept, password } = req.body;
    try {
        if (userRole === newRole) {
            const Model = userRole === 'Student' ? Student : Alumini;
            const updateData = { name, rno, batch, course, dept };
            if (password && password.trim() !== '') {
                updateData.password = password;
            }
            await Model.findByIdAndUpdate(userId, updateData);
        } else {
            const SourceModel = userRole === 'Student' ? Student : Alumini;
            const TargetModel = newRole === 'Student' ? Student : Alumini;
            const originalUser = await SourceModel.findById(userId);
            if (!originalUser) {
                return res.status(404).send("Original user not found.");
            }
            const newUser = new TargetModel({
                name: name || originalUser.name,
                email: originalUser.email,
                password: (password && password.trim() !== '') ? password : originalUser.password,
                batch: batch || originalUser.batch,
                role: newRole,
                rno: rno || originalUser.rno,
                course: course || originalUser.course,
                dept: dept || originalUser.dept,
            });
            await newUser.save();
            await SourceModel.findByIdAndDelete(userId);
        }
        res.redirect('/all_users?editSuccess=true');
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).send("Error updating user.");
    }
});

app.post("/delete-user", function(req, res) {
    if(!loggedInUserEmail) return res.redirect("/");
    const { userId, userRole } = req.body;
    let Model = userRole === 'Student' ? Student : Alumini;
    Model.findByIdAndDelete(userId)
        .then(result => {
            if (!result) { return res.status(404).send("User not found."); }
            res.redirect("/all_users?deleteSuccess=true");
        })
        .catch(err => res.status(500).send("Error deleting user."));
});

app.get("/create_alumni", function(req,res){
    if(!loggedInUserEmail) return res.redirect("/");
    res.render("create_alumini", { admin: loggedInUserEmail, success: req.query.success === 'true' });
});

app.post("/create_alumni", function(req,res){
  if(!loggedInUserEmail) return res.redirect("/");
  const user = new Alumini({
    name:req.body.fullName, email:req.body.email, password:req.body.password,
    batch:req.body.batch, role:"Alumni", rno:req.body.rollNo,
    course:req.body.Course, dept:req.body.department
  });
  user.save()
    .then(() => res.redirect("/create_alumni?success=true"))
    .catch(() => res.redirect("/create_alumni?success=false"));
});


// --- ANNOUNCEMENT ROUTES ---

app.get("/announcements", function(req, res) {
    if(!loggedInUserEmail) return res.redirect("/");
    Announcement.find({}).sort({ date: -1 })
        .then(announcements => {
            res.render("announcements", {
                announcements: announcements, admin: loggedInUserEmail,
                success: req.query.success === 'true'
            });
        })
        .catch(err => res.status(500).send("Server error."));
});

app.post("/create-announcement", function(req, res) {
    if(!loggedInUserEmail) return res.redirect("/");
    const newAnnouncement = new Announcement({ title: req.body.title, content: req.body.content });
    newAnnouncement.save()
        .then(() => res.redirect("/announcements?success=true"))
        .catch(() => res.redirect("/announcements?success=false"));
});


// --- EVENTS ROUTES ---

app.get("/events", function(req, res) {
    if(!loggedInUserEmail) return res.redirect("/");
    const { title, category, status } = req.query;
    let query = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;

    Event.find(query).sort({ created_at: -1 })
        .then(events => res.render("events", { events: events, admin: loggedInUserEmail }))
        .catch(err => res.status(500).send("Server error."));
});

app.get("/api/event/:id", function(req, res) {
    if(!loggedInUserEmail) return res.status(401).send("Unauthorized");
    Event.findById(req.params.id)
        .then(event => res.json(event))
        .catch(() => res.status(404).json({ error: "Event not found." }));
});

app.post("/create-event", function(req, res) {
    if(!loggedInUserEmail) return res.redirect("/");
    const newEvent = new Event(req.body);
    newEvent.save()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

app.post("/edit-event", function(req, res) {
    if(!loggedInUserEmail) return res.redirect("/");
    Event.findByIdAndUpdate(req.body.id, req.body)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

app.post("/delete-event", function(req, res) {
    if(!loggedInUserEmail) return res.redirect("/");
    Event.findByIdAndDelete(req.body.eventId)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

// --- Server Listener ---
app.listen(3000, function(req, res){
    console.log("Server is running on port 3000\n");
});

