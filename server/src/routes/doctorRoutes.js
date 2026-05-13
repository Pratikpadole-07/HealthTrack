const express = require("express");
const router = express.Router();
const User = require("../models/User");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

/* ================= PUBLIC ROUTES ================= */

// Get all doctors (public doctor discovery)
router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "DOCTOR" })
      .select("-password");

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PROTECTED DOCTOR ROUTES ================= */

// Get patients assigned to logged-in doctor
router.get(
  "/patients",
  auth,
  role("DOCTOR"),
  async (req, res) => {
    try {
      const patients = await User.find({
        assignedDoctor: req.user.id
      }).select("-password");

      res.json(patients);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= SPECIALTY-BASED DISCOVERY ================= */

// Get doctors by specialty (AI-compatible route)
router.get(
  "/by-specialty/:specialty",
  async (req, res) => {
    try {
      const specialty = req.params.specialty;

      const doctors = await User.find({
        role: "DOCTOR",
        specialty: { $regex: specialty, $options: "i" }
      }).select("-password");

      res.json(doctors);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
