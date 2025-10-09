const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema({
    alumniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'alumini',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Create compound index to prevent duplicate RSVPs
rsvpSchema.index({ alumniId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("Rsvp", rsvpSchema);
