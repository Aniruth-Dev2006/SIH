const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const  bodyParser= require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost:27017/communityDB");
const adminschema = new mongoose.Schema({
    email:String,
    password:Number
});
const Admin = mongoose.model("admin",adminschema);
const studentschema = new mongoose.Schema({
    email:String,
    password:Number
});
const Student = mongoose.model("student",studentschema);
const aluminschema = new mongoose.Schema({
    email:String,
    password:Number
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


app.listen(3000,function(req,res){
    console.log("server is running\n");
});