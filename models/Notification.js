const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['alumin', 'student', 'admin']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'info-circle'
    },
    read: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['announcement', 'event', 'job', 'general', 'system'],
        default: 'general'
    },
    link: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, userModel, title, message, options = {}) {
    const notification = new this({
        userId,
        userModel,
        title,
        message,
        icon: options.icon || 'info-circle',
        type: options.type || 'general',
        link: options.link || null
    });
    return await notification.save();
};

// Static method to mark notification as read
notificationSchema.statics.markAsRead = async function(notificationId) {
    return await this.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    );
};

// Static method to mark all user notifications as read
notificationSchema.statics.markAllAsRead = async function(userId) {
    return await this.updateMany(
        { userId, read: false },
        { read: true }
    );
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function(userId, limit = 50) {
    return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({ userId, read: false });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
