const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Helper function to create notifications
const createNotification = async (recipientId, recipientRole, senderId, senderRole, senderName, appointmentId, type, title, message, appointmentDate, appointmentTime) => {
  try {
    const notification = new Notification({
      recipientId,
      recipientRole,
      senderId,
      senderRole,
      senderName,
      appointmentId,
      type,
      title,
      message,
      appointmentDate,
      appointmentTime,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// 🔹 Get Notifications for User
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const notifications = await Notification.find({ 
      recipientId: userId, 
      recipientRole: role 
    })
    .populate("appointmentId")
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
});

// 🔹 Mark Notification as Read
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read", error: error.message });
  }
});

// 🔹 Mark All Notifications as Read
router.put("/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    await Notification.updateMany(
      { recipientId: userId, recipientRole: role, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Failed to mark all notifications as read", error: error.message });
  }
});

module.exports = { router, createNotification };
