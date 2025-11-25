const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/userModel");
const Student = require("./model/studentModel");
const Teacher = require("./model/teacherModel"); // Import Teacher model
const Result = require("./model/resultModel"); // Import Teacher model
var cors = require("cors");
const app = express();
const multer = require("multer");
const bookModel = require("./model/bookModel");
const dotenv = require('dotenv')

app.use(cors({
  origin: [
    'https://student-management-system-sandy-two.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://edumanage-hub.vercel.app'
  ],
  credentials: true
}));

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
    cb(null, uniqueSuffix + "-" + file.originalname);
    console.log(file)
  },
});

// Add multer configuration for student images
const studentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/students");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "student-" + uniqueSuffix + "-" + file.originalname);
  },
});

const studentUpload = multer({
  storage: studentStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});



// home routes

app.get('/', (req, res)=>{
  res.send("Sever is running 🚀🚀")
})


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

app.get("/allbook", async (req, res) => {
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
// Create student with profile image
// Create student with profile image
app.post("/createstudent", studentUpload.single("profileImage"), async (req, res) => {
  try {
    // Check if student with same ID or email already exists
    const existingStudent = await Student.findOne({
      $or: [
        { studentid: req.body.studentid },
        { email: req.body.email },
        { rollNumber: req.body.rollNumber }
      ]
    });

    if (existingStudent) {
      return res.status(400).send("Student ID, Email or Roll Number already exists");
    }

    let student = new Student({
      studentname: req.body.studentname,
      departmentname: req.body.departmentname,
      studentid: req.body.studentid,
      phonenumber: req.body.phonenumber,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      bloodGroup: req.body.bloodGroup,
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      parentPhone: req.body.parentPhone,
      address: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country || "Bangladesh"
      },
      semester: req.body.semester,
      batch: req.body.batch,
      rollNumber: req.body.rollNumber,
      courseDuration: req.body.courseDuration,
      emergencyContact: {
        name: req.body.emergencyContactName,
        relationship: req.body.emergencyContactRelationship,
        phone: req.body.emergencyContactPhone
      },
      academicInfo: {
        previousSchool: req.body.previousSchool,
        previousGrade: req.body.previousGrade,
        admissionTestScore: req.body.admissionTestScore
      },
      profileImage: req.file ? req.file.path : ""
    });

    await student.save();
    res.status(201).send("Student Created Successfully");
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).send("Error creating student");
  }
});

// Update student with optional profile image
app.patch("/updatestudent/:id", studentUpload.single("profileImage"), async (req, res) => {
  try {
    const updateData = {
      studentname: req.body.studentname,
      departmentname: req.body.departmentname,
      studentid: req.body.studentid,
      phonenumber: req.body.phonenumber,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      bloodGroup: req.body.bloodGroup,
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      parentPhone: req.body.parentPhone,
      address: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country
      },
      semester: req.body.semester,
      batch: req.body.batch,
      rollNumber: req.body.rollNumber,
      courseDuration: req.body.courseDuration,
      isActive: req.body.isActive,
      status: req.body.status,
      emergencyContact: {
        name: req.body.emergencyContactName,
        relationship: req.body.emergencyContactRelationship,
        phone: req.body.emergencyContactPhone
      },
      academicInfo: {
        previousSchool: req.body.previousSchool,
        previousGrade: req.body.previousGrade,
        admissionTestScore: req.body.admissionTestScore
      }
    };

    // If new profile image is uploaded, update the path
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    let data = await Student.findByIdAndUpdate(
      { _id: req.params.id },
      updateData,
      { new: true }
    );

    if (!data) {
      return res.status(404).send("Student not found");
    }

    res.send(data);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).send("Error updating student");
  }
});


// Get student by ID with full details
app.get("/student/:id", async (req, res) => {
  try {
    let data = await Student.findById(req.params.id);
    if (!data) {
      return res.status(404).send("Student not found");
    }
    res.send(data);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).send("Error fetching student");
  }
});

// Get all students
app.get("/allstudent", async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).send(students);
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).send("Error fetching students");
  }
});

// Get students statistics
app.get("/studentstats", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const departments = await Student.distinct('departmentname');
    const semesters = await Student.distinct('semester');

    // Count by gender
    const maleStudents = await Student.countDocuments({ gender: 'Male', isActive: true });
    const femaleStudents = await Student.countDocuments({ gender: 'Female', isActive: true });

    // Count by department
    const departmentStats = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$departmentname', count: { $sum: 1 } } }
    ]);

    res.send({
      totalStudents,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
      totalDepartments: departments.length,
      totalSemesters: semesters.length,
      genderDistribution: {
        male: maleStudents,
        female: femaleStudents,
        other: activeStudents - maleStudents - femaleStudents
      },
      departmentStats,
      departments
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    res.status(500).send("Error fetching student stats");
  }
});

// Upload student document
app.post("/student/:id/upload-document", studentUpload.single("document"), async (req, res) => {
  try {
    const { documentType } = req.body; // birthCertificate, academicTranscript, photoId
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).send("Student not found");
    }

    if (req.file && documentType) {
      student.documents[documentType] = req.file.path;
      await student.save();
      res.send("Document uploaded successfully");
    } else {
      res.status(400).send("Document type and file are required");
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).send("Error uploading document");
  }
});

// Delete student by ID
app.delete("/deletestudent/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student first to get the profile image path
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).send("Student not found");
    }

    // Delete the student from database
    await Student.findByIdAndDelete(studentId);

    // Also delete this id's student results 

    await Result.findByIdAndDelete(studentId)

    // If student had a profile image, delete it from the file system
    if (student.profileImage) {
      const fs = require('fs');
      const path = require('path');
      
      const imagePath = path.join(__dirname, student.profileImage);
      
      // Check if file exists and delete it
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Deleted profile image: ${student.profileImage}`);
      }
    }

    res.status(200).send("Student deleted successfully");
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).send("Error deleting student");
  }
});

// Bulk delete students
app.post("/deletestudents/bulk", async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).send("Student IDs array is required");
    }

    // Find all students to get their profile image paths
    const students = await Student.find({ _id: { $in: studentIds } });
    
    if (students.length === 0) {
      return res.status(404).send("No students found with the provided IDs");
    }

    // Delete profile images from file system
    const fs = require('fs');
    const path = require('path');
    
    students.forEach(student => {
      if (student.profileImage) {
        const imagePath = path.join(__dirname, student.profileImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted profile image: ${student.profileImage}`);
        }
      }
    });

    // Delete students from database
    const result = await Student.deleteMany({ _id: { $in: studentIds } });

    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} students`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error bulk deleting students:", error);
    res.status(500).send("Error deleting students");
  }
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


// ==================== RESULT ROUTES ====================

// Create a new result
// Create a new result
app.post("/createresult", async (req, res) => {
  try {
    // Check if result already exists for this student and semester
    const existingResult = await Result.findOne({
      studentId: req.body.studentId,
      semester: req.body.semester
    });

    if (existingResult) {
      return res.status(400).send("Result already exists for this student and semester");
    }

    // Calculate grades for each subject
    const subjectsWithGrades = req.body.subjects.map(subject => ({
      ...subject,
      grade: calculateGrade(subject.marks)
    }));

    // Calculate totals
    const totalMarks = subjectsWithGrades.length * 100;
    const obtainedMarks = subjectsWithGrades.reduce((sum, subject) => sum + subject.marks, 0);
    const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2);
    const cgpa = calculateCGPA(subjectsWithGrades);

    // Determine overall status
    const failedSubjects = subjectsWithGrades.filter(subject => subject.grade === 'F').length;
    const status = failedSubjects === 0 ? 'Pass' : failedSubjects <= 2 ? 'Supplementary' : 'Fail';

    let result = new Result({
      studentId: req.body.studentId,
      studentName: req.body.studentName,
      department: req.body.department,
      semester: req.body.semester,
      subjects: subjectsWithGrades,
      totalMarks: totalMarks,
      obtainedMarks: obtainedMarks,
      percentage: percentage,
      cgpa: cgpa,
      grade: calculateOverallGrade(percentage),
      status: status,
      examType: req.body.examType || 'Regular',
      examDate: req.body.examDate || Date.now(),
      published: req.body.published || false
    });

    await result.save();
    res.status(201).send("Result created successfully");
  } catch (error) {
    console.error("Error creating result:", error);
    res.status(500).send("Error creating result: " + error.message);
  }
});

// Helper functions
function calculateGrade(marks) {
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B';
  if (marks >= 50) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}

function calculateCGPA(subjects) {
  const gradePoints = {
    'A+': 4.0,
    'A': 3.75,
    'B': 3.25,
    'C': 2.75,
    'D': 2.25,
    'F': 0.0
  };

  let totalCredits = 0;
  let totalGradePoints = 0;

  subjects.forEach(subject => {
    const gradePoint = gradePoints[subject.grade] || 0;
    totalGradePoints += (gradePoint * subject.credit);
    totalCredits += subject.credit;
  });

  return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
}

function calculateOverallGrade(percentage) {
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}
// Get all results
app.get("/allresults", async (req, res) => {
  try {
    let data = await Result.find({}).sort({ createdAt: -1 });
    res.send(data);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).send("Error fetching results");
  }
});

// Get single result by ID
app.get("/result/:id", async (req, res) => {
  try {
    let data = await Result.findById(req.params.id);
    if (!data) {
      return res.status(404).send("Result not found");
    }
    res.send(data);
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).send("Error fetching result");
  }
});

// Get results by student ID
app.get("/results/student/:studentId", async (req, res) => {
  try {
    let data = await Result.find({ studentId: req.params.studentId }).sort({ semester: 1 });
    res.send(data);
  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).send("Error fetching student results");
  }
});

// Get results by department
app.get("/results/department/:department", async (req, res) => {
  try {
    let data = await Result.find({ department: req.params.department }).sort({ semester: 1 });
    res.send(data);
  } catch (error) {
    console.error("Error fetching department results:", error);
    res.status(500).send("Error fetching department results");
  }
});

// Get results by semester
app.get("/results/semester/:semester", async (req, res) => {
  try {
    let data = await Result.find({ semester: req.params.semester }).sort({ studentId: 1 });
    res.send(data);
  } catch (error) {
    console.error("Error fetching semester results:", error);
    res.status(500).send("Error fetching semester results");
  }
});

// Update result
app.patch("/updateresult/:id", async (req, res) => {
  try {
    let data = await Result.findByIdAndUpdate(
      { _id: req.params.id },
      {
        studentId: req.body.studentId,
        studentName: req.body.studentName,
        department: req.body.department,
        semester: req.body.semester,
        subjects: req.body.subjects,
        examType: req.body.examType,
        examDate: req.body.examDate,
        published: req.body.published
      },
      { new: true }
    );

    if (!data) {
      return res.status(404).send("Result not found");
    }

    res.send(data);
  } catch (error) {
    console.error("Error updating result:", error);
    res.status(500).send("Error updating result");
  }
});

// Delete result
app.delete("/deleteresult/:id", async (req, res) => {
  try {
    let data = await Result.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).send("Result not found");
    }
    res.send("Result Deleted Successfully");
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).send("Error deleting result");
  }
});

// Publish/Unpublish result
app.patch("/result/:id/publish", async (req, res) => {
  try {
    let data = await Result.findByIdAndUpdate(
      req.params.id,
      { published: req.body.published },
      { new: true }
    );

    if (!data) {
      return res.status(404).send("Result not found");
    }

    res.send(`Result ${req.body.published ? 'published' : 'unpublished'} successfully`);
  } catch (error) {
    console.error("Error publishing result:", error);
    res.status(500).send("Error publishing result");
  }
});

// Get result statistics
app.get("/resultstats", async (req, res) => {
  try {
    const totalResults = await Result.countDocuments();
    const publishedResults = await Result.countDocuments({ published: true });
    const departments = await Result.distinct('department');
    const semesters = await Result.distinct('semester');

    // Calculate pass percentage
    const passResults = await Result.countDocuments({ status: 'Pass' });
    const passPercentage = totalResults > 0 ? ((passResults / totalResults) * 100).toFixed(2) : 0;

    res.send({
      totalResults,
      publishedResults,
      unpublishedResults: totalResults - publishedResults,
      totalDepartments: departments.length,
      totalSemesters: semesters.length,
      passPercentage,
      departments,
      semesters
    });
  } catch (error) {
    console.error("Error fetching result stats:", error);
    res.status(500).send("Error fetching result stats");
  }
});

// Search results
app.get("/results/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    let data = await Result.find({
      $or: [
        { studentId: { $regex: query, $options: 'i' } },
        { studentName: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { semester: { $regex: query, $options: 'i' } }
      ]
    });
    res.send(data);
  } catch (error) {
    console.error("Error searching results:", error);
    res.status(500).send("Error searching results");
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});