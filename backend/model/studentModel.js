const mongoose = require("mongoose")
const { Schema } = mongoose;

const studentSchema = new Schema({
    studentname: String,
    departmentname: String,
    studentid: String,
    phonenumber: String
})

module.exports = mongoose.model("Student",studentSchema)