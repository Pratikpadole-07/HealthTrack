const mongoose = require("mongoose");

const APPOINTMENT_STATUS = [
  "CREATED",
  "PENDING_DOCTOR",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED_BY_PATIENT"
];

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorAvailability",
      required: true
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUS,
      default: "PENDING_DOCTOR"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
