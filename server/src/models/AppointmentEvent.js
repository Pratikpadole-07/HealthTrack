const mongoose = require("mongoose");

const appointmentEventSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },
  action: {
    type: String,
    required: true
  },
  actorRole: {
    type: String,
    enum: ["PATIENT", "DOCTOR", "SYSTEM"],
    required: true
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "AppointmentEvent",
  appointmentEventSchema
);
