const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createAppointment,
  acceptAppointment,
  rejectAppointment,
  cancelByPatient,
  getMyAppointments,
  getDoctorAppointments
} = require("../controllers/appointmentController");

/* ================= PATIENT ROUTES ================= */

// Create appointment (slot-based)
router.post(
  "/",
  auth,
  role("PATIENT"),
  createAppointment
);

// Patient views own appointments
router.get(
  "/my",
  auth,
  role("PATIENT"),
  getMyAppointments
);

// Patient cancels own appointment
router.post(
  "/:appointmentId/cancel",
  auth,
  role("PATIENT"),
  cancelByPatient
);

/* ================= DOCTOR ROUTES ================= */

// Doctor views own appointments
router.get(
  "/doctor",
  auth,
  role("DOCTOR"),
  getDoctorAppointments
);

// Doctor accepts appointment
router.post(
  "/:appointmentId/accept",
  auth,
  role("DOCTOR"),
  acceptAppointment
);

// Doctor rejects appointment
router.post(
  "/:appointmentId/reject",
  auth,
  role("DOCTOR"),
  rejectAppointment
);

module.exports = router;
