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

// Schemas
const adminschema = new mongoose.Schema({ email:String, password:String });
const Admin = mongoose.model("admin",adminschema);
const studentschema = new mongoose.Schema({ name:String, email:String, password:String, batch:String, role:String, rno:String,course:String,dept:String });
const Student = mongoose.model("student",studentschema);
const aluminschema = new mongoose.Schema({ name:String, email:String, password:String, batch:String, role:String, rno:String,course:String,dept:String });
const Alumini = mongoose.model("alumini",aluminschema);
const announcementschema = new mongoose.Schema({ title: String, content: String, date: { type: Date, default: Date.now } });
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
// --- Standard Page Routes ---

app.get("/", function(req, res){
    res.render("login");
});
app.post("/", function (req, res) {
  const { email, password } = req.body;

  Admin.findOne({ email, password })
    .then(admin => {
      if (admin) {
        ad = req.body.email;
        res.redirect("/admin");
        return Promise.reject("handled");
      }
      return Alumini.findOne({ email, password });
    })
    .then(alumni => {
      if (alumni) {
        res.send("alumni");
        return Promise.reject("handled");
      }
      return Student.findOne({ email, password });
    })
    .then(student => {
      if (student) {
        res.send("student");
        return Promise.reject("handled");
      }
      res.redirect("/");
    })
    .catch(err => {
      if (err === "handled") return; 
      console.log("error " + err);
      res.status(500).send("Server error");
    });
});

app.get("/user_management", function(req, res){
  res.render("user_management",{admin:ad});
});

app.get("/all_users", function(req, res){
  // Check for a success flag from the delete operation
  const deleteSuccess = req.query.deleteSuccess === 'true';
  Promise.all([
      Alumini.find({}),
      Student.find({})
  ]).then(([alumni, students]) => {
      const allUsers = [...alumni, ...students];
      res.render("all_users", { 
          users: allUsers, 
          admin: ad,
          deleteSuccess: deleteSuccess // Pass the flag to the template
      });
  }).catch(err => {
      console.log("error " + err);
      res.status(500).send("Server error");
  });
});

app.get("/admin", function(req, res){
  Announcement.find().sort({ _id: -1 }).limit(2)
  .then(docs => {
    Event.find()
      .then(result => {
        Event.find({status:"Upcoming"})
          .then(up => {
            Event.find({status:"Completed"})
                .then(tot=>{
                    res.render("admin", {
                        admin: ad,
                        ann: docs[0].title,
                        ann1: docs[1].title,
                        events: result,
                        Upcoming: up,
                        total:tot
                    });
                });
          });
      });
  })
  .catch(err => console.log("error " + err));
});

// --- API Route for Live Search ---
app.get("/api/search-users", function(req, res) {
    const { name, role, batch } = req.query;

    let query = {};

    // Build the dynamic query for powerful searching
    if (name) {
        query.name = { $regex: name, $options: 'i' };
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
        .then(results => {
            const combinedResults = results.flat();
            res.json(combinedResults);
        })
        .catch(err => {
            console.error("API Search Error:", err);
            res.status(500).json({ error: "An error occurred during search." });
        });
});

// --- Create Student Routes ---
app.get("/create_student",function(req,res){
    const wasSuccess = req.query.success === 'true';
    res.render("create_student", { admin: ad, success: wasSuccess });
});

app.post("/create_student",function(req,res){
  const user = new Student({
    name:req.body.fullName,
    email:req.body.email,
    password:req.body.password,
    batch:req.body.batch,
    role:"Student",
    rno:req.body.rollNo,
    course:req.body.Course,
    dept:req.body.department
  });
  user.save()
    .then(result=>{
      res.redirect("/create_student?success=true");
    })
    .catch(err=>{
      console.log("error "+err);
      res.redirect("/create_student?success=false");
    });
});

// --- Route for Deleting a User ---
app.post("/delete-user", function(req, res) {
    const { userId, userRole } = req.body;

    let deletePromise;

    if (userRole === 'Student') {
        deletePromise = Student.findByIdAndDelete(userId);
    } else if (userRole === 'Alumni') {
        deletePromise = Alumini.findByIdAndDelete(userId);
    } else {
        return res.status(400).send("Invalid user role.");
    }

    deletePromise.then(result => {
        if (!result) {
            return res.status(404).send("User not found.");
        }
        console.log("Deleted user:", result.name);
        res.redirect("/all_users?deleteSuccess=true");
    }).catch(err => {
        console.log("Error deleting user: " + err);
        res.status(500).send("Error deleting user.");
    });
});
app.get("/create_alumni",function(req,res){
    const wasSuccess = req.query.success === 'true';
    res.render("create_alumini", { admin: ad, success: wasSuccess });
});
app.post("/create_alumni",function(req,res){
  const user = new Alumini({
    name:req.body.fullName,
    email:req.body.email,
    password:req.body.password,
    batch:req.body.batch,
    role:"Alumni",
    rno:req.body.rollNo,
    course:req.body.Course,
    dept:req.body.department
  });
  user.save()
    .then(result=>{
      res.redirect("/create_alumni?success=true");
    })
    .catch(err=>{
      console.log("error "+err);
      res.redirect("/create_alumni?success=false");
    });
});

app.get("/announcements", function(req, res) {
    const success = req.query.success === 'true';
    Announcement.find({}).sort({ date: -1 })
        .then(announcements => {
            res.render("announcements", {
                announcements: announcements,
                admin: ad,
                success: success
            });
        })
        .catch(err => {
            console.error("Error fetching announcements: " + err);
            res.status(500).send("Server error fetching announcements.");
        });
});

app.post("/create-announcement", function(req, res) {
    const newAnnouncement = new Announcement({
        title: req.body.title,
        content: req.body.content
    });
    newAnnouncement.save()
        .then(() => {
            res.redirect("/announcements?success=true");
        })
        .catch(err => {
            console.error("Error saving announcement: " + err);
            res.redirect("/announcements?success=false");
        });
});
// --- NEW EVENTS ROUTES ---
app.get("/events", function(req, res) {
    const status = req.query.status;
    Event.find({}).sort({
            created_at: -1
        })
        .then(events => {
            res.render("events", {
                events: events,
                admin: ad,
                status: status
            });
        })
        .catch(err => {
            console.error("Error fetching events: " + err);
            res.status(500).send("Server error fetching events.");
        });
});

app.get("/api/event/:id", function(req, res) {
    Event.findById(req.params.id)
        .then(event => {
            if (!event) {
                return res.status(404).json({
                    error: "Event not found."
                });
            }
            res.json(event);
        })
        .catch(err => {
            console.error("Error fetching event: " + err);
            res.status(500).json({
                error: "Server error fetching event."
            });
        });
});

app.post("/create-event", function(req, res) {
    const newEvent = new Event({
        title: req.body.title,
        date: req.body.date,
        time: req.body.time,
        venue_name: req.body.venue_name,
        venue_link: req.body.venue_link,
        description: req.body.description,
        organizer_name: req.body.organizer_name,
        organizer_contact: req.body.organizer_contact,
        category: req.body.category
    });
    newEvent.save()
        .then(() => {
            res.redirect("/events?status=created");
        })
        .catch(err => {
            console.error("Error saving event: " + err);
            res.redirect("/events?status=failed");
        });
});

app.post("/edit-event", function(req, res) {
    const eventId = req.body.id;
    const updatedEvent = {
        title: req.body.title,
        date: req.body.date,
        time: req.body.time,
        venue_name: req.body.venue_name,
        venue_link: req.body.venue_link,
        description: req.body.description,
        organizer_name: req.body.organizer_name,
        organizer_contact: req.body.organizer_contact,
        category: req.body.category
    };
    Event.findByIdAndUpdate(eventId, updatedEvent, {
            new: true
        })
        .then(result => {
            if (!result) {
                return res.status(404).send("Event not found.");
            }
            res.redirect("/events?status=updated");
        })
        .catch(err => {
            console.error("Error updating event: " + err);
            res.status(500).send("Error updating event.");
        });
});

app.post("/delete-event", function(req, res) {
    const eventId = req.body.eventId;
    Event.findByIdAndDelete(eventId)
        .then(result => {
            if (!result) {
                return res.status(404).send("Event not found.");
            }
            console.log("Deleted event:", result.title);
            res.redirect("/events?status=deleted");
        })
        .catch(err => {
            console.error("Error deleting event: " + err);
            res.status(500).send("Error deleting event.");
        });
});

app.get("/api/search-events", function(req, res) {
    const {
        title,
        category,
        status
    } = req.query;
    let query = {};
    if (title) {
        query.title = {
            $regex: title,
            $options: 'i'
        };
    }
    if (category) {
        query.category = category;
    }
    if (status) {
        query.status = status;
    }
    Event.find(query).sort({
            created_at: -1
        })
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.error("API Event Search Error:", err);
            res.status(500).json({
                error: "An error occurred during event search."
            });
        });
});

app.listen(3000, function(req, res){
    console.log("server is running\n");
});