const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const buildUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  assignedDoctor: user.assignedDoctor
});

/* ================= REGISTER ================= */
exports.registerUser = async (req, res) => {
  const { name, email, password, role, assignedDoctor } = req.body;

  try {
    if (!["PATIENT", "DOCTOR"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let assignedDoctorId = null;

    if (role === "PATIENT" && assignedDoctor) {
      const doctor = await User.findOne({
        _id: assignedDoctor,
        role: "DOCTOR"
      });

      if (!doctor) {
        return res.status(400).json({
          message: "Assigned doctor not found"
        });
      }

      assignedDoctorId = doctor._id;
    }

    const user = new User({
      name,
      email,
      password,
      role,
      assignedDoctor: assignedDoctorId
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    return res.json({
      token,
      user: buildUserResponse(user)
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    return res.json({
      token,
      user: buildUserResponse(user)
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ASSIGNED PATIENTS ================= */
exports.getAssignedPatients = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({ message: "Doctor access only" });
    }

    const patients = await User.find({
      assignedDoctor: req.user.id,
      role: "PATIENT"
    }).select("-password");

    return res.json(patients);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    return res.json({ user: buildUserResponse(user) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= CHANGE PASSWORD ================= */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
