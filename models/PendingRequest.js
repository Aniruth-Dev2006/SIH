const mongoose = require("mongoose");

const pendingRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'Alumni'
    },
    rno: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    requestDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("pendingRequest", pendingRequestSchema);
