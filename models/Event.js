const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue_name: {
        type: String,
        required: true
    },
    venue_link: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    organizer_name: {
        type: String,
        required: true
    },
    organizer_contact: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Upcoming',
        enum: ['Upcoming', 'Completed', 'Cancelled']
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Event", eventSchema);
