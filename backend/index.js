const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/userModel");
const Student = require("./model/studentModel");
var cors = require("cors");
const app = express();
const multer = require("multer");
const bookModel = require("./model/bookModel");
const dotenv = require('dotenv')

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'))
dotenv.config()

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!🚀"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname );
    console.log(file)
  },
});

const upload = multer({ storage: storage });

app.post("/uploadbook", upload.single("avatar"), function (req, res, next) {
  console.log("hello")
  let book = new bookModel({
    name: req.body.name,
    department: req.body.department,
    writer: req.body.writer,
    serial: req.body.serial,
    url: req.file.path
  }).save()
  res.send("Book uploaded")
});

app.get("/allbook",async (req,res)=>{
  let data = await bookModel.find({})
  res.send(data)
})

app.post("/registration", async (req, res) => {
  let isUserExists = await User.findOne({ email: req.body.email });
  if (isUserExists) {
    return res.send(`${req.body.email} already exixts`);
  }
  let user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  }).save();
  res.send("Regisration successfull");
});

app.post("/login", async (req, res) => {
  let isUserExists = await User.findOne({ email: req.body.email });
  if (!isUserExists) {
    return res.send(`${req.body.email} not found`);
  }
  if (isUserExists.password !== req.body.password) {
    return res.send(`Invalid credential`);
  }
  res.send({
    username: isUserExists.username,
    email: isUserExists.email,
  });
});

app.post("/createstudent", async (req, res) => {
  let student = new Student({
    studentname: req.body.studentname,
    departmentname: req.body.departmentname,
    studentid: req.body.studentid,
    phonenumber: req.body.phonenumber,
  }).save();

  res.send("Student Created");
});

app.get("/allstudent", async (req, res) => {
  let data = await Student.find({});
  res.send(data);
});

app.get("/student/:id", async (req, res) => {
  let data = await Student.find({ _id: req.params.id });
  res.send(data);
});

app.patch("/student/:id", async (req, res) => {
  let data = await Student.findByIdAndUpdate(
    { _id: req.params.id },
    {
      studentname: req.body.studentname,
      departmentname: req.body.departmentname,
      studentid: req.body.studentid,
      phonenumber: req.body.phonenumber,
    }
  );
  res.send(data);
});

app.post("/delete", async (req, res) => {
  let data = await Student.findByIdAndDelete({ _id: req.body.id });
  res.send("Deleted");
});

app.listen(8000);
