const mongoose = require("mongoose");

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    slotStart: {
      type: String,
      required: true
    },
    slotEnd: {
      type: String,
      required: true
    },
    isBooked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DoctorAvailability",
  doctorAvailabilitySchema
);
