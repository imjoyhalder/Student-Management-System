const mongoose = require("mongoose")
const { Schema } = mongoose;

const bookSchema = new Schema({
    name: String,
    department: String,
    writer: String,
    serial: String,
    url: String
})

module.exports = mongoose.model("Book",bookSchema)