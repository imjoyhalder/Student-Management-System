const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/userModel");
const Student = require("./model/studentModel");
const Teacher = require("./model/teacherModel"); // Import Teacher model
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


// ==================== BOOK ROUTES ====================

// Create a new book
app.post("/createbook", upload.single("avatar"), async (req, res) => {
  try {
    // Check if book with same serial already exists
    const existingBook = await bookModel.findOne({ serial: req.body.serial });
    if (existingBook) {
      return res.status(400).send("Book with this serial number already exists");
    }

    let book = new bookModel({
      name: req.body.name,
      department: req.body.department,
      writer: req.body.writer,
      serial: req.body.serial,
      url: req.file ? req.file.path : ""
    });

    await book.save();
    res.status(201).send("Book uploaded successfully");
  } catch (error) {
    console.error("Error uploading book:", error);
    res.status(500).send("Error uploading book");
  }
});

// Get all books
app.get("/allbook", async (req, res) => {
  try {
    let data = await bookModel.find({}).sort({ createdAt: -1 });
    res.send(data);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Error fetching books");
  }
});

// Get single book by ID
app.get("/book/:id", async (req, res) => {
  try {
    let data = await bookModel.findById(req.params.id);
    if (!data) {
      return res.status(404).send("Book not found");
    }
    res.send(data);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).send("Error fetching book");
  }
});

// Update book
app.patch("/updatebook/:id", upload.single("avatar"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      department: req.body.department,
      writer: req.body.writer,
      serial: req.body.serial
    };

    // If new file is uploaded, update the URL
    if (req.file) {
      updateData.url = req.file.path;
    }

    let data = await bookModel.findByIdAndUpdate(
      { _id: req.params.id },
      updateData,
      { new: true }
    );

    if (!data) {
      return res.status(404).send("Book not found");
    }

    res.send(data);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).send("Error updating book");
  }
});

// Delete book
app.delete("/deletebook/:id", async (req, res) => {
  try {
    let data = await bookModel.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).send("Book not found");
    }
    res.send("Book Deleted Successfully");
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).send("Error deleting book");
  }
});

// Get books by department
app.get("/books/department/:department", async (req, res) => {
  try {
    let data = await bookModel.find({ department: req.params.department });
    res.send(data);
  } catch (error) {
    console.error("Error fetching books by department:", error);
    res.status(500).send("Error fetching books by department");
  }
});

// Get book statistics
app.get("/bookstats", async (req, res) => {
  try {
    const totalBooks = await bookModel.countDocuments();
    const departments = await bookModel.distinct('department');
    const writers = await bookModel.distinct('writer');
    
    res.send({
      totalBooks,
      totalDepartments: departments.length,
      totalWriters: writers.length,
      departments
    });
  } catch (error) {
    console.error("Error fetching book stats:", error);
    res.status(500).send("Error fetching book stats");
  }
});

// Search books
app.get("/books/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    let data = await bookModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { writer: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { serial: { $regex: query, $options: 'i' } }
      ]
    });
    res.send(data);
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).send("Error searching books");
  }
});

app.get("/allbook",async (req,res)=>{
  let data = await bookModel.find({})
  res.send(data)
})

// ==================== USER AUTH ROUTES ====================
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

// ==================== STUDENT ROUTES ====================
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

// ==================== TEACHER ROUTES ====================

// Create a new teacher
app.post("/createteacher", async (req, res) => {
  try {
    // Check if teacher with same ID or email already exists
    const existingTeacher = await Teacher.findOne({
      $or: [
        { teacherid: req.body.teacherid },
        { email: req.body.email }
      ]
    });

    if (existingTeacher) {
      return res.status(400).send("Teacher ID or Email already exists");
    }

    let teacher = new Teacher({
      teachername: req.body.teachername,
      departmentname: req.body.departmentname,
      teacherid: req.body.teacherid,
      phonenumber: req.body.phonenumber,
      email: req.body.email,
      qualification: req.body.qualification || "",
      experience: req.body.experience || 0,
      subjects: req.body.subjects || [],
      salary: req.body.salary || 0,
      address: req.body.address || {}
    });

    await teacher.save();
    res.status(201).send("Teacher Created Successfully");
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).send("Error creating teacher");
  }
});

// Get all teachers
app.get("/allteacher", async (req, res) => {
  try {
    let data = await Teacher.find({}).sort({ createdAt: -1 });
    res.send(data);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).send("Error fetching teachers");
  }
});

// Get active teachers only
app.get("/activeteachers", async (req, res) => {
  try {
    let data = await Teacher.findActive(); // Using the static method
    res.send(data);
  } catch (error) {
    console.error("Error fetching active teachers:", error);
    res.status(500).send("Error fetching active teachers");
  }
});

// Get single teacher by ID
app.get("/teacher/:id", async (req, res) => {
  try {
    let data = await Teacher.findById(req.params.id);
    if (!data) {
      return res.status(404).send("Teacher not found");
    }
    res.send(data);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).send("Error fetching teacher");
  }
});

// Update teacher
app.patch("/updateteacher/:id", async (req, res) => {
  try {
    let data = await Teacher.findByIdAndUpdate(
      { _id: req.params.id },
      {
        teachername: req.body.teachername,
        departmentname: req.body.departmentname,
        teacherid: req.body.teacherid,
        phonenumber: req.body.phonenumber,
        email: req.body.email,
        qualification: req.body.qualification,
        experience: req.body.experience,
        subjects: req.body.subjects,
        salary: req.body.salary,
        address: req.body.address,
        isActive: req.body.isActive
      },
      { new: true } // Return updated document
    );

    if (!data) {
      return res.status(404).send("Teacher not found");
    }

    res.send(data);
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).send("Error updating teacher");
  }
});

// Delete teacher
app.delete("/deleteteacher/:id", async (req, res) => {
  try {
    let data = await Teacher.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).send("Teacher not found");
    }
    res.send("Teacher Deleted Successfully");
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).send("Error deleting teacher");
  }
});

// Soft delete teacher (set isActive to false)
app.patch("/teacher/:id/deactivate", async (req, res) => {
  try {
    let data = await Teacher.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!data) {
      return res.status(404).send("Teacher not found");
    }

    res.send("Teacher Deactivated Successfully");
  } catch (error) {
    console.error("Error deactivating teacher:", error);
    res.status(500).send("Error deactivating teacher");
  }
});

// Get teachers by department
app.get("/teachers/department/:department", async (req, res) => {
  try {
    let data = await Teacher.find({ 
      departmentname: req.params.department,
      isActive: true 
    });
    res.send(data);
  } catch (error) {
    console.error("Error fetching teachers by department:", error);
    res.status(500).send("Error fetching teachers by department");
  }
});

// Get teacher statistics
app.get("/teacherstats", async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ isActive: true });
    const departments = await Teacher.distinct('departmentname');
    
    res.send({
      totalTeachers,
      activeTeachers,
      inactiveTeachers: totalTeachers - activeTeachers,
      totalDepartments: departments.length,
      departments
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    res.status(500).send("Error fetching teacher stats");
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});