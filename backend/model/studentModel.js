const mongoose = require("mongoose")
const { Schema } = mongoose;

const studentSchema = new Schema({
    studentname: {
        type: String,
        required: [true, "Student name is required"],
        trim: true,
        minlength: [2, "Student name must be at least 2 characters long"],
        maxlength: [100, "Student name cannot exceed 100 characters"]
    },
    departmentname: {
        type: String,
        required: [true, "Department name is required"],
        trim: true
    },
    studentid: {
        type: String,
        required: [true, "Student ID is required"],
        unique: true,
        trim: true,
        uppercase: true
    },
    phonenumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^[0-9]{10,15}$/, "Please enter a valid phone number"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"]
    },
    profileImage: {
        type: String,
        default: "" // Will store the file path
    },
    dateOfBirth: {
        type: Date,
        required: [true, "Date of birth is required"]
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    fatherName: {
        type: String,
        required: [true, "Father's name is required"],
        trim: true
    },
    motherName: {
        type: String,
        required: [true, "Mother's name is required"],
        trim: true
    },
    parentPhone: {
        type: String,
        trim: true,
        // match: [/^[0-9]{10,15}$/, "Please enter a valid phone number"]
    },
    address: {
        street: {
            type: String,
            required: [true, "Street address is required"],
            trim: true
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, "ZIP code is required"],
            trim: true
        },
        country: {
            type: String,
            default: "Bangladesh",
            trim: true
        }
    },
    admissionDate: {
        type: Date,
        required: [true, "Admission date is required"],
        default: Date.now
    },
    semester: {
        type: String,
        required: [true, "Semester is required"],
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
    },
    batch: {
        type: String,
        required: [true, "Batch is required"],
        trim: true
    },
    rollNumber: {
        type: String,
        required: [true, "Roll number is required"],
        unique: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple nulls but enforces uniqueness for non-null
        trim: true
    },
    courseDuration: {
        type: String,
        required: [true, "Course duration is required"],
        default: "4 Years"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended', 'Graduated', 'Dropout'],
        default: 'Active'
    },
    emergencyContact: {
        name: {
            type: String,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[0-9]{10,15}$/, "Please enter a valid phone number"]
        }
    },
    academicInfo: {
        previousSchool: {
            type: String,
            trim: true
        },
        previousGrade: {
            type: String,
            trim: true
        },
        admissionTestScore: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    documents: {
        birthCertificate: {
            type: String,
            default: ""
        },
        academicTranscript: {
            type: String,
            default: ""
        },
        photoId: {
            type: String,
            default: ""
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Virtual for student's full address
studentSchema.virtual('fullAddress').get(function() {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.zipCode}, ${this.address.country}`;
});

// Virtual for student's age
studentSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Instance method to get student's basic info
studentSchema.methods.getBasicInfo = function() {
    return {
        name: this.studentname,
        studentId: this.studentid,
        department: this.departmentname,
        semester: this.semester,
        rollNumber: this.rollNumber,
        email: this.email,
        phone: this.phonenumber
    };
};

// Static method to find active students
studentSchema.statics.findActive = function() {
    return this.find({ isActive: true, status: 'Active' });
};

// Static method to find students by department
studentSchema.statics.findByDepartment = function(department) {
    return this.find({ departmentname: department, isActive: true });
};

// Pre-save middleware to generate registration number if not provided
studentSchema.pre('save', function(next) {
    if (!this.registrationNumber) {
        // Generate registration number: DEPT-YEAR-ROLL (e.g., CSE-2023-001)
        const year = new Date().getFullYear();
        const deptCode = this.departmentname.substring(0, 3).toUpperCase();
        this.registrationNumber = `${deptCode}-${year}-${this.rollNumber.padStart(3, '0')}`;
    }
    next();
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Index for better query performance
studentSchema.index({ studentid: 1 });
studentSchema.index({ departmentname: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ isActive: 1 });

module.exports = mongoose.model("Student", studentSchema);