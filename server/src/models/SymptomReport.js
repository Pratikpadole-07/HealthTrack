const mongoose = require("mongoose");

const SymptomReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symptoms: {
    type: [String], // allow simple list of strings
    required: true,
  },
  predictedCondition: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["mild", "see-doctor", "emergency"],
    default: "mild",
  },
  confidence: {
    type: Number,
    default: null,
  },
  selfCareTips: {
    type: [String],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("SymptomReport", SymptomReportSchema);
