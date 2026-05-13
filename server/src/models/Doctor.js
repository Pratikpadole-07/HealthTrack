const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  phone: { type: String, required: true },
  hospital: { type: String, required: true },
  relatedConditions: [{ type: String, required: true }] // Condition from AI Prediction
});

module.exports = mongoose.model("Doctor", doctorSchema);
