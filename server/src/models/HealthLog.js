const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  bloodPressure: { type: String }, // e.g., "120/80"
  bloodSugar: { type: Number },
  sleepHours: { type: Number },
  exerciseMinutes: { type: Number },
  dietNotes: { type: String }
});

module.exports = mongoose.model('HealthLog', healthLogSchema);