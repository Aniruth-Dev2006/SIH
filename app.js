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
  res.render("admin",{admin:ad});
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


app.listen(3000, function(req, res){
    console.log("server is running\n");
});