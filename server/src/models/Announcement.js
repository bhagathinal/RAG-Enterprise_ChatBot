const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  indicator: {
    type: String,
    enum: ['primary', 'green', 'orange', 'blue'],
    default: 'primary'
  },
  date: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
