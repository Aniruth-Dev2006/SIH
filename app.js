const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const  bodyParser= require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.set("view engine", "ejs");
var ad = "panda";
mongoose.connect("mongodb://localhost:27017/communityDB");
const adminschema = new mongoose.Schema({
    email:String,
    password:String
});
const Admin = mongoose.model("admin",adminschema);
const studentschema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    batch:String,
    role:String,
    rno:String
});
const Student = mongoose.model("student",studentschema);
const aluminschema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    batch:String,
    role:String,
    rno:String
});
const Alumini = mongoose.model("alumini",aluminschema);
app.get("/",function(req,res){
    res.render("login");
});
app.post("/", function (req, res) {
  const { email, password } = req.body;

  Admin.findOne({ email, password })
    .then(admin => {
      if (admin) {
        ad = req.body.email;
        res.render("admin", { admin: req.body.email });
        return null; 
      }
      return Alumini.findOne({ email, password });
    })
    .then(alumni => {
      if (!alumni) return Student.findOne({ email, password });

      res.send("alumini");
      return null; 
    })
    .then(student => {
      if (student) {
        res.send("student");
        return null; 
      }
      if (student !== null) {
       
        res.redirect("/");
      }
    })
    .catch(err => {
      console.log("error " + err);
      res.status(500).send("Server error");
    });
});
app.get("/user_management",function(req,res){
  res.render("user_management",{admin:ad});
});

app.get("/all_users",function(req,res){
  Alumini.find()
    .then(alumni=>{
      Student.find()
        .then(stud=>{
          res.render("all_users",{users:alumni,students:stud});
        })
        .catch(err=>{
          console.log("error "+err);
        });
    })
    .catch(err=>{
      console.log("error "+err);
    })
});

app.post("/all-users",function(req,res){
  if(req.body.role==="Student"){
    Student.find({name:req.body.name,batch:req.body.batch})
      .then(result=>{
        res.render("all_users",{users:result,students:[]});
      })
      .catch(err=>{
        console.log("error "+err);
      });
  }else{
    Alumini.find({name:req.body.name,batch:req.body.batch})
      .then(result=>{
        res.render("all_users",{users:result,students:[]});
      })
      .catch(err=>{
        console.log("error "+err);
      });
  }
});

app.get("/admin",function(req,res){
  res.render("admin",{admin:ad});
});

app.listen(3000,function(req,res){
    console.log("server is running\n");
});