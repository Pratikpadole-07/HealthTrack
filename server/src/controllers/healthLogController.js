const HealthLog = require('../models/HealthLog');
const User = require('../models/User');

exports.createHealthLog = async (req, res) => {
  const { bloodPressure, bloodSugar, sleepHours, exerciseMinutes, dietNotes } = req.body;

  try {
    const newLog = new HealthLog({
      patient: req.user.id,
      bloodPressure,
      bloodSugar,
      sleepHours,
      exerciseMinutes,
      dietNotes,
    });

    const log = await newLog.save();
    res.json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.getPatientLogs = async (req, res) => {
  try {
    const logs = await HealthLog.find({ patient: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.getLogById = async (req, res) => {
  try {
    const log = await HealthLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ msg: 'Log not found' });
    }

    // Ensure the log belongs to the authenticated user's patient
    if (req.user.role === 'patient' && log.patient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to view this log' });
    }

    if (req.user.role === 'doctor') {
      const patient = await User.findById(log.patient);
      if (
        !patient ||
        !patient.assignedDoctor ||
        patient.assignedDoctor.toString() !== req.user.id
      ) {
        return res.status(401).json({ msg: 'Not authorized to view this log' });
      }
    }

    res.json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


/**createHealthLog: Allows authenticated patients to create new health logs with various health metrics.
getPatientLogs: Retrieves all health logs for the authenticated patient, sorted by most recent.
getLogById: Retrieves a specific health log by ID, ensuring only the owning patient or their assigned doctor can access it.
Security: Authorization checks prevent unauthorized access to health logs.
Error Handling: All functions log errors and respond with server error status if needed. */