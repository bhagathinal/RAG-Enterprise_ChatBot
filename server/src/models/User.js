const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  
  // HR Shared Stats
  leavesRemaining: {
    sick: { type: Number, default: 4 },
    casual: { type: Number, default: 8 }
  },
  tenure: { type: Number, default: 0 }, // In years
  attendanceRate: { type: Number, default: 100 }, // Percentage
  pendingApprovals: { type: Number, default: 0 },
  jobTitle: { type: String, default: 'Employee' },
  profileCompletion: { type: Number, default: 65 },
  joinedAt: { type: Date, default: '2026-04-01' }

}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
