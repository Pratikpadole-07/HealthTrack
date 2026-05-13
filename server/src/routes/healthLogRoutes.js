const express = require('express');
const router = express.Router();
const HealthLog = require('../models/HealthLog');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// @route   POST api/logs
// @desc    Create a new health log
router.post('/', auth, role('patient'), async (req, res) => {
  const { bloodPressure, bloodSugar, sleepHours, exerciseMinutes, dietNotes } = req.body;
  try {
    const newLog = new HealthLog({
      patient: req.user.id,
      bloodPressure,
      bloodSugar,
      sleepHours,
      exerciseMinutes,
      dietNotes
    });
    const log = await newLog.save();
    res.json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logs/patient/me
// @desc    Get all logs for the current patient
router.get('/patient/me', auth, role('patient'), async (req, res) => {
  try {
    const logs = await HealthLog.find({ patient: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logs/patient/:patientId
// @desc    Get health logs for a specific patient (for doctors)
router.get('/patient/:patientId', auth, role('doctor'), async (req, res) => {
  try {
    const logs = await HealthLog.find({ patient: req.params.patientId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logs/:id
// @desc    Get a specific health log by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await HealthLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ msg: 'Log not found' });
    }

    // Check if user is the patient or a doctor
    if (log.patient.toString() !== req.user.id && req.user.role !== 'doctor') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(log);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Log not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
