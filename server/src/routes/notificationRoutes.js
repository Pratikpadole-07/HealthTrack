const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

// GET logged-in user notifications
router.get("/", auth, async (req, res) => {
  const notes = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 });
  res.json(notes);
});

// Mark as read
router.put("/:id/read", auth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: "Marked as read" });
});

module.exports = router;
