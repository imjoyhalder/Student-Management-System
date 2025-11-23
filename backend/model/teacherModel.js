const mongoose = require("mongoose")
const { Schema } = mongoose;

const teacherSchema = new Schema({
    teachername: {
        type: String,
        required: [true, "Teacher name is required"],
        trim: true
    },
    departmentname: {
        type: String,
        required: [true, "Department name is required"],
        trim: true
    },
    teacherid: {
        type: String,
        required: [true, "Teacher ID is required"],
        unique: true,
        trim: true
    },
    phonenumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    qualification: {
        type: String,
        trim: true,
        default: ""
    },
    experience: {
        type: Number,
        default: 0
    },
    subjects: [{
        type: String,
        trim: true
    }],
    joiningDate: {
        type: Date,
        default: Date.now
    },
    salary: {
        type: Number,
        default: 0
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
teacherSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update the updatedAt field before updating
teacherSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// Static method to find active teachers
teacherSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};

// Instance method to get teacher's full info
teacherSchema.methods.getTeacherInfo = function() {
    return {
        name: this.teachername,
        department: this.departmentname,
        teacherId: this.teacherid,
        email: this.email,
        phone: this.phonenumber,
        experience: this.experience,
        qualification: this.qualification
    };
};

// Virtual for teacher's full address
teacherSchema.virtual('fullAddress').get(function() {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.zipCode}`;
});

// Ensure virtual fields are serialized
teacherSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Teacher", teacherSchema);