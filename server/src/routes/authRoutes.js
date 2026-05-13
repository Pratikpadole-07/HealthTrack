const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAssignedPatients, updateProfile, changePassword } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/patients', auth, roleMiddleware('doctor'), getAssignedPatients);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;




