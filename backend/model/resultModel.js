// models/resultModel.js
const mongoose = require("mongoose")
const { Schema } = mongoose;

const resultSchema = new Schema({
    studentId: {
        type: String,
        required: true,
        trim: true
    },
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    subjects: [{
        subjectName: {
            type: String,
            required: true,
            trim: true
        },
        subjectCode: {
            type: String,
            required: true,
            trim: true
        },
        marks: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        grade: {
            type: String,
            required: true,
            trim: true
        },
        credit: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        }
    }],
    totalMarks: {
        type: Number,
        required: true
    },
    obtainedMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    cgpa: {
        type: Number,
        required: true,
        min: 0,
        max: 4.0
    },
    grade: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pass', 'Fail', 'Supplementary'],
        default: 'Pass'
    },
    examType: {
        type: String,
        enum: ['Regular', 'Supplementary', 'Improvement'],
        default: 'Regular'
    },
    examDate: {
        type: Date,
        default: Date.now
    },
    published: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Calculate grade based on marks
resultSchema.methods.calculateGrade = function(marks) {
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
};

// Calculate CGPA
resultSchema.methods.calculateCGPA = function(subjects) {
    let totalCredits = 0;
    let totalGradePoints = 0;

    subjects.forEach(subject => {
        const gradePoint = this.getGradePoint(subject.grade);
        totalGradePoints += (gradePoint * subject.credit);
        totalCredits += subject.credit;
    });

    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
};

// Get grade point
resultSchema.methods.getGradePoint = function(grade) {
    const gradePoints = {
        'A+': 4.0,
        'A': 3.75,
        'B': 3.25,
        'C': 2.75,
        'D': 2.25,
        'F': 0.0
    };
    return gradePoints[grade] || 0;
};

// Pre-save middleware to calculate totals
resultSchema.pre('save', function(next) {
    // Calculate total marks and obtained marks
    this.totalMarks = this.subjects.length * 100;
    this.obtainedMarks = this.subjects.reduce((sum, subject) => sum + subject.marks, 0);
    
    // Calculate percentage
    this.percentage = ((this.obtainedMarks / this.totalMarks) * 100).toFixed(2);
    
    // Calculate CGPA
    this.cgpa = this.calculateCGPA(this.subjects);
    
    // Determine overall status
    const failedSubjects = this.subjects.filter(subject => subject.grade === 'F').length;
    this.status = failedSubjects === 0 ? 'Pass' : failedSubjects <= 2 ? 'Supplementary' : 'Fail';
    
    next();
});

module.exports = mongoose.model("Result", resultSchema);