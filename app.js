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

// Schemas (no changes needed here)
const adminschema = new mongoose.Schema({ email:String, password:String });
const Admin = mongoose.model("admin",adminschema);
const studentschema = new mongoose.Schema({ name:String, email:String, password:String, batch:String, role:String, rno:String });
const Student = mongoose.model("student",studentschema);
const aluminschema = new mongoose.Schema({ name:String, email:String, password:String, batch:String, role:String, rno:String });
const Alumini = mongoose.model("alumini",aluminschema);

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
        res.render("admin", { admin: req.body.email });
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
  // This route now just loads the initial page with all users
  Promise.all([
      Alumini.find({}),
      Student.find({})
  ]).then(([alumni, students]) => {
      const allUsers = [...alumni, ...students];
      res.render("all_users", { users: allUsers, admin: ad });
  }).catch(err => {
      console.log("error " + err);
      res.status(500).send("Server error");
  });
});

app.get("/admin", function(req, res){
  res.render("admin",{admin:ad});
});


// --- NEW: API Route for Live Search ---

app.get("/api/search-users", function(req, res) {
    const { name, role, batch } = req.query;

    let query = {};

    // Build the dynamic query for powerful searching
    if (name) {
        // This regex finds the 'name' string anywhere in the field, case-insensitively.
        // It matches prefixes, suffixes, and substrings.
        query.name = { $regex: name, $options: 'i' };
    }
    if (batch) {
        query.batch = batch;
    }

    // Determine which collections to search
    const searchTasks = [];
    if (role === "Student") {
        searchTasks.push(Student.find(query));
    } else if (role === "Alumni") {
        searchTasks.push(Alumini.find(query));
    } else {
        // If role is "all" or not specified, search both
        searchTasks.push(Student.find(query));
        searchTasks.push(Alumini.find(query));
    }

    Promise.all(searchTasks)
        .then(results => {
            // Flatten the results from multiple queries into a single array
            const combinedResults = results.flat();
            res.json(combinedResults); // Send the data back as JSON
        })
        .catch(err => {
            console.error("API Search Error:", err);
            res.status(500).json({ error: "An error occurred during search." });
        });
});


app.listen(3000, function(req, res){
    console.log("server is running\n");
});