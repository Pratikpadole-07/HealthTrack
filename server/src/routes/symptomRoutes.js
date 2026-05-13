const express = require("express");
const router = express.Router();
const axios = require("axios");
const SymptomReport = require("../models/SymptomReport");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const mongoose = require("mongoose");

// 🔹 AI Prediction (NO DB SAVE)
router.post("/predict", auth, role("PATIENT"), async (req, res) => {
  try {
    const { symptoms } = req.body;
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:5001";

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: "Symptoms required" });
    }

    const formattedSymptoms = symptoms.map((s) =>
      typeof s === "string" ? s : s.name
    );

    const aiResponse = await axios.post(`${aiServiceUrl}/predict`, {
      symptoms: formattedSymptoms,
    });

    const { condition, severity, confidence, selfCareTips } = aiResponse.data;

    return res.json({
      condition,
      severity,
      confidence: confidence || 0.7,
      selfCareTips,
    });

  } catch (err) {
    console.error("AI Error =>", err.response?.data || err.message);
    return res.status(500).json({ message: "AI Prediction failed" });
  }
});

// 🔹 SAVE SYMPTOM REPORT
// 🔹 Save final condition report
router.post("/", auth, role("patient"), async (req, res) => {
  try {
    console.log("📥 Incoming Save Request:", req.body);

    const {
      symptoms = [],
      predictedCondition,
      condition, // fallback name from frontend
      severity = "normal",
      confidence = 0.7,
      selfCareTips = []
    } = req.body;

    if (!predictedCondition && !condition) {
      return res.status(400).json({ message: "predictedCondition missing" });
    }

    const formattedSymptoms = symptoms.map(s =>
      typeof s === "string" ? s : s.name
    );

    const report = new SymptomReport({
      patient: req.user.id,
      predictedCondition: predictedCondition || condition, // pick whichever exists
      symptoms: formattedSymptoms,
      severity,
      confidence,
      selfCareTips,
    });

    await report.save();

    console.log("✔ Saved Report:", report);

    res.json({ success: true, report });

  } catch (err) {
    console.error("🔥 Save Report Error:", err.message);
    res.status(500).json({ message: "Failed to save report", error: err.message });
  }
});


// 🔹 Patient gets their own history
router.get("/patient/me", auth, role("patient"), async (req, res) => {
  try {
    const reports = await SymptomReport.find({
      patient: new mongoose.Types.ObjectId(req.user.id),
    }).sort({ date: -1 });

    console.log("📌 HISTORY DB =>", reports);
    return res.json(reports);
  } catch (err) {
    console.error("❌ Fetch Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// 🔹 Doctor views assigned patient's history
router.get("/patient/:patientId", auth, role("doctor"), async (req, res) => {
  try {
    const reports = await SymptomReport.find({
      user: req.params.patientId,
    }).sort({ date: -1 });

    return res.json(reports);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
