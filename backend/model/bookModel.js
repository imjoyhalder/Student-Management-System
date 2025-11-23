const mongoose = require("mongoose")
const { Schema } = mongoose;

const bookSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    writer: {
        type: String,
        required: true,
        trim: true
    },
    serial: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    url: {
        type: String,
        required: true
    }
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("Book", bookSchema);