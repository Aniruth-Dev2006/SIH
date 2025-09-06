const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser= require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.set("view engine", "ejs");
var ad = "panda"; // This should be managed with sessions in a real app
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
    res.render("login");
});

app.post("/", async function (req, res) {
    const { email, password } = req.body;
    try {
        // 1. Check if user is an admin
        const admin = await Admin.findOne({ email, password });
        if (admin) {
            ad = email;
            return res.redirect("/admin");
        }

        // 2. Check if the user's request is pending
        const pending = await PendingRequest.findOne({ email, password });
        if (pending) {
            return res.redirect("/?status=pending_approval");
        }

        // 3. Check if user is an approved alumni
        const alumni = await Alumini.findOne({ email, password });
        if (alumni) {
            // Replace with actual alumni dashboard redirect
            return res.send("alumni logged in");
        }

        // 4. Check if user is a student
        const student = await Student.findOne({ email, password });
        if (student) {
            // Replace with actual student dashboard redirect
            return res.send("student logged in");
        }

        // 5. If no user is found
        res.redirect("/?status=login_failed");

    } catch (err) {
        console.log("Login Error: " + err);
        res.status(500).send("Server error during login.");
    }
});

// Route to render the signup page
app.get("/signup", function(req, res){
    res.render("signup");
});

// Route to handle signup form submission
app.post("/signup", async function(req, res){
    const { name, email, password, batch, rno, course, dept } = req.body;

    try {
        // Check if email already exists in any collection
        const existingAdmin = await Admin.findOne({ email });
        const existingAlumni = await Alumini.findOne({ email });
        const existingStudent = await Student.findOne({ email });
        const existingPending = await PendingRequest.findOne({ email });

        if (existingAdmin || existingAlumni || existingStudent || existingPending) {
            return res.redirect("/signup?status=email_exists"); // You can add a message on signup page
        }

        const newRequest = new PendingRequest({
            name, email, password, batch, rno, course, dept,
            role: 'Alumni'
        });

        await newRequest.save();
        res.redirect("/?status=signup_success");

    } catch (err) {
        console.error("Error creating pending request:", err);
        res.status(500).send("Error submitting request.");
    }
});


// --- ADMIN & USER MANAGEMENT ROUTES ---
app.get("/user_management", function(req, res){
    res.render("user_management",{admin:ad});
});

app.get("/all_users", function(req, res){
    const deleteSuccess = req.query.deleteSuccess === 'true';
    Promise.all([
        Alumini.find({}),
        Student.find({})
    ]).then(([alumni, students]) => {
        const allUsers = [...alumni, ...students];
        res.render("all_users", {
            users: allUsers,
            admin: ad,
            deleteSuccess: deleteSuccess
        });
    }).catch(err => {
        console.log("error " + err);
        res.status(500).send("Server error");
    });
});

app.get("/admin", function(req, res){
    Promise.all([
        Announcement.find().sort({ _id: -1 }).limit(2),
        Event.find(),
        Event.countDocuments({status:"Upcoming"}),
        Event.countDocuments({status:"Completed"})
    ]).then(([docs, allEvents, upcomingCount, completedCount]) => {
        res.render("admin", {
            admin: ad,
            ann: docs.length > 0 ? docs[0].title : "No announcements",
            ann1: docs.length > 1 ? docs[1].title : "No older announcements",
            events: allEvents,
            Upcoming: { length: upcomingCount },
            total: { length: completedCount }
        });
    }).catch(err => {
        console.log("error " + err);
        res.status(500).send("Server Error");
    });
});

app.get("/pending-requests", function(req, res){
    PendingRequest.find({})
        .then(requests => {
            res.render("pending-requests", {
                requests: requests,
                admin: ad
            });
        })
        .catch(err => {
            console.error("Error fetching pending requests:", err);
            res.status(500).send("Server error");
        });
});

app.post("/approve-alumni", function(req, res){
    const { requestId } = req.body;
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
        .then(() => {
            res.redirect("/pending-requests?status=approved");
        })
        .catch(err => {
            console.error("Error approving request:", err);
            res.status(500).send("Server error.");
        });
});

app.post("/reject-alumni", function(req, res){
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

app.get("/create_student",function(req,res){
    res.render("create_student", { admin: ad, success: req.query.success === 'true' });
});

app.post("/create_student",function(req,res){
  const user = new Student({
    name:req.body.fullName, email:req.body.email, password:req.body.password,
    batch:req.body.batch, role:"Student", rno:req.body.rollNo,
    course:req.body.Course, dept:req.body.department
  });
  user.save()
    .then(() => res.redirect("/create_student?success=true"))
    .catch(() => res.redirect("/create_student?success=false"));
});

app.post("/delete-user", function(req, res) {
    const { userId, userRole } = req.body;
    let Model = userRole === 'Student' ? Student : Alumini;
    Model.findByIdAndDelete(userId)
        .then(result => {
            if (!result) { return res.status(404).send("User not found."); }
            res.redirect("/all_users?deleteSuccess=true");
        })
        .catch(err => res.status(500).send("Error deleting user."));
});

app.get("/create_alumni",function(req,res){
    res.render("create_alumini", { admin: ad, success: req.query.success === 'true' });
});

app.post("/create_alumni",function(req,res){
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
    Announcement.find({}).sort({ date: -1 })
        .then(announcements => {
            res.render("announcements", {
                announcements: announcements, admin: ad,
                success: req.query.success === 'true'
            });
        })
        .catch(err => res.status(500).send("Server error."));
});

app.post("/create-announcement", function(req, res) {
    const newAnnouncement = new Announcement({ title: req.body.title, content: req.body.content });
    newAnnouncement.save()
        .then(() => res.redirect("/announcements?success=true"))
        .catch(() => res.redirect("/announcements?success=false"));
});


// --- EVENTS ROUTES ---

app.get("/events", function(req, res) {
    const { title, category, status } = req.query;
    let query = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;

    Event.find(query).sort({ created_at: -1 })
        .then(events => res.render("events", { events: events, admin: ad }))
        .catch(err => res.status(500).send("Server error."));
});

app.get("/api/event/:id", function(req, res) {
    Event.findById(req.params.id)
        .then(event => res.json(event))
        .catch(() => res.status(404).json({ error: "Event not found." }));
});

app.post("/create-event", function(req, res) {
    const newEvent = new Event(req.body);
    newEvent.save()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

app.post("/edit-event", function(req, res) {
    Event.findByIdAndUpdate(req.body.id, req.body)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

app.post("/delete-event", function(req, res) {
    Event.findByIdAndDelete(req.body.eventId)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

app.listen(3000, function(req, res){
    console.log("server is running\n");
});

