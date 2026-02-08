const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FoodLog = require("../models/FoodLog");
const ApiUsage = require("../models/ApiUsage");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication + admin role
router.use(authenticate, authorize("admin"));

// GET /api/admin/users — list all users with pagination + search
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin users error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/admin/users/:id/role — change a user's role
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Admin role change error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/admin/users/:id — delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Also remove their food logs
    await FoodLog.deleteMany({ user: req.params.id });

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Admin delete error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/assign-patient — assign a patient to a doctor
router.post("/assign-patient", async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(400).json({ error: "Invalid doctor" });
    }
    if (!patient || patient.role !== "patient") {
      return res.status(400).json({ error: "Invalid patient" });
    }

    // Add patient to doctor's list (avoid duplicates)
    if (!doctor.assignedPatients.includes(patientId)) {
      doctor.assignedPatients.push(patientId);
      await doctor.save();
    }

    // Set patient's assigned doctor
    patient.assignedDoctor = doctorId;
    await patient.save();

    res.json({ message: "Patient assigned to doctor" });
  } catch (err) {
    console.error("Admin assign error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/stats — system health & API usage stats
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalPatients, totalDoctors, totalAdmins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "admin" }),
    ]);

    const totalFoodLogs = await FoodLog.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayFoodLogs = await FoodLog.countDocuments({ createdAt: { $gte: todayStart } });

    // API usage stats (last 24h and total)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalApiCalls, recentApiCalls, groqCalls, groqErrors] = await Promise.all([
      ApiUsage.countDocuments(),
      ApiUsage.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      ApiUsage.countDocuments({ service: "groq" }),
      ApiUsage.countDocuments({ service: "groq", success: false }),
    ]);

    // Recent API usage breakdown by service
    const usageByService = await ApiUsage.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      { $group: { _id: "$service", count: { $sum: 1 }, errors: { $sum: { $cond: ["$success", 0, 1] } } } },
    ]);

    res.json({
      users: { total: totalUsers, patients: totalPatients, doctors: totalDoctors, admins: totalAdmins },
      foodLogs: { total: totalFoodLogs, today: todayFoodLogs },
      apiUsage: {
        total: totalApiCalls,
        last24h: recentApiCalls,
        groq: { total: groqCalls, errors: groqErrors },
        byService: usageByService,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
