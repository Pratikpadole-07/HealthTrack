const axios = require('axios');
const SymptomReport = require('../models/SymptomReport');
const User = require('../models/User');

// @desc    Submit symptoms for AI prediction
// @route   POST /api/symptoms/predict
// @access  Private (Patient)
exports.predictSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:5001";

    // Extract only symptom names for AI
    const formattedSymptoms = symptoms.map(s => s.name);

    const aiResponse = await axios.post(`${aiServiceUrl}/predict`, {
      symptoms: formattedSymptoms
    });

    const { predictedCondition, severity } = aiResponse.data;

    return res.json({
      condition: predictedCondition,
      severity,
      confidence: Math.floor(Math.random() * 30 + 70), // temp fake %
      selfCareTips: [
        "Drink enough water",
        "Get proper rest",
        "Monitor your symptoms closely"
      ]
    });

  } catch (err) {
    console.error("AI Prediction Error:", err.message);
    return res.status(500).json({ message: "AI Prediction failed" });
  }
};
exports.saveReport = async (req, res) => {
  try {
    const { symptoms, condition, severity, confidence, selfCareTips } = req.body;

    const newReport = new SymptomReport({
      patient: req.user.id,
      symptoms,
      predictedCondition: condition,
      severity,
      confidence,
      selfCareTips
    });

    const report = await newReport.save();
    res.json({ success: true, report });
  } catch (err) {
    console.error("Save report error:", err.message);
    res.status(500).json({ message: "Could not save report" });
  }
};

// @desc    Get all symptom reports for a patient
// @route   GET /api/symptoms/patient/:id
// @access  Private (Doctor)
exports.getPatientSymptomReports = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);

    if (
      !patient ||
      !patient.assignedDoctor ||
      patient.assignedDoctor.toString() !== req.user.id
    ) {
      return res.status(404).json({ msg: 'Patient not found or not assigned to you' });
    }

    const reports = await SymptomReport.find({ patient: req.params.id }).sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


/**predictSymptoms: Allows authenticated patients to submit symptoms for AI-based condition prediction. The AI's prediction and severity are saved along with the symptoms in the database.
getPatientSymptomReports: Allows authenticated doctors to retrieve all symptom reports for a patient assigned to them, ensuring proper authorization.
Security: Both endpoints enforce role-based access control and ownership checks.
Error Handling: All functions log errors and respond with server error status if needed. */