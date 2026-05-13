const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/DoctorAvailability");
const AppointmentEvent = require("../models/AppointmentEvent");
const STATE_TRANSITIONS = require("../utils/appointmentStateMachine");

/* ================= CREATE APPOINTMENT ================= */
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, slotId } = req.body;

    const slot = await DoctorAvailability.findOneAndUpdate(
      { _id: slotId, isBooked: false },
      { isBooked: true },
      { new: true }
    );

    if (!slot) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      slotId,
      status: "PENDING_DOCTOR"
    });

    await AppointmentEvent.create({
      appointmentId: appointment._id,
      action: "CREATED",
      actorRole: "PATIENT",
      actorId: req.user.id
    });

    return res.status(201).json(appointment);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create appointment" });
  }
};

exports.getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({
    patientId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(appointments);
};

exports.getDoctorAppointments = async (req, res) => {
  const appointments = await Appointment.find({
    doctorId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(appointments);
};

/* ================= ACCEPT APPOINTMENT ================= */
exports.acceptAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (appointment.doctorId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!STATE_TRANSITIONS[appointment.status].includes("ACCEPTED")) {
    return res.status(400).json({
      message: `Invalid transition from ${appointment.status}`
    });
  }

  appointment.status = "ACCEPTED";
  await appointment.save();

  await AppointmentEvent.create({
    appointmentId: appointment._id,
    action: "ACCEPTED",
    actorRole: "DOCTOR",
    actorId: req.user.id
  });

  return res.json({ message: "Appointment accepted" });
};

/* ================= REJECT APPOINTMENT ================= */
exports.rejectAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (appointment.doctorId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!STATE_TRANSITIONS[appointment.status].includes("REJECTED")) {
    return res.status(400).json({
      message: `Invalid transition from ${appointment.status}`
    });
  }

  appointment.status = "REJECTED";
  await appointment.save();

  await DoctorAvailability.findByIdAndUpdate(
    appointment.slotId,
    { isBooked: false }
  );

  await AppointmentEvent.create({
    appointmentId: appointment._id,
    action: "REJECTED",
    actorRole: "DOCTOR",
    actorId: req.user.id
  });

  return res.json({ message: "Appointment rejected" });
};

/* ================= CANCEL BY PATIENT ================= */
exports.cancelByPatient = async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (appointment.patientId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!STATE_TRANSITIONS[appointment.status].includes("CANCELLED_BY_PATIENT")) {
    return res.status(400).json({
      message: `Invalid transition from ${appointment.status}`
    });
  }

  appointment.status = "CANCELLED_BY_PATIENT";
  await appointment.save();

  await DoctorAvailability.findByIdAndUpdate(
    appointment.slotId,
    { isBooked: false }
  );

  await AppointmentEvent.create({
    appointmentId: appointment._id,
    action: "CANCELLED_BY_PATIENT",
    actorRole: "PATIENT",
    actorId: req.user.id
  });

  return res.json({ message: "Appointment cancelled" });
};
