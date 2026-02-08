const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FoodLog = require("../models/FoodLog");
const { authenticate, authorize } = require("../middleware/auth");

// All doctor routes require authentication + doctor role
router.use(authenticate, authorize("doctor"));

// GET /api/doctor/patients — list patients assigned to this doctor
router.get("/patients", async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).populate(
      "assignedPatients",
      "name email profilePicture lastLogin createdAt"
    );

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json({ patients: doctor.assignedPatients || [] });
  } catch (err) {
    console.error("Doctor patients error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/doctor/patients/:id/logs — view a patient's food logs (read-only)
router.get("/patients/:id/logs", async (req, res) => {
  try {
    const patientId = req.params.id;

    // Verify this patient is assigned to the requesting doctor
    const doctor = await User.findById(req.user._id);
    if (!doctor.assignedPatients.map(String).includes(patientId)) {
      return res.status(403).json({ error: "This patient is not assigned to you" });
    }

    const { page = 1, limit = 50, from, to } = req.query;
    const filter = { user: patientId };

    if (from || to) {
      filter.loggedAt = {};
      if (from) filter.loggedAt.$gte = new Date(from);
      if (to) filter.loggedAt.$lte = new Date(to);
    }

    const logs = await FoodLog.find(filter)
      .sort({ loggedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await FoodLog.countDocuments(filter);

    // Also get patient info
    const patient = await User.findById(patientId).select("name email");

    res.json({
      patient,
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Doctor patient logs error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/doctor/patients/:id/summary — patient nutrition summary
router.get("/patients/:id/summary", async (req, res) => {
  try {
    const patientId = req.params.id;

    // Verify assignment
    const doctor = await User.findById(req.user._id);
    if (!doctor.assignedPatients.map(String).includes(patientId)) {
      return res.status(403).json({ error: "This patient is not assigned to you" });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const summary = await FoodLog.aggregate([
      { $match: { user: require("mongoose").Types.ObjectId(patientId), loggedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null,
          totalMeals: { $sum: 1 },
          avgCalories: { $avg: "$calories" },
          avgProtein: { $avg: "$protein" },
          avgCarbs: { $avg: "$carbs" },
          avgFat: { $avg: "$fat" },
          totalCalories: { $sum: "$calories" },
        },
      },
    ]);

    const patient = await User.findById(patientId).select("name email");

    res.json({
      patient,
      period: "7 days",
      summary: summary[0] || {
        totalMeals: 0,
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        totalCalories: 0,
      },
    });
  } catch (err) {
    console.error("Doctor patient summary error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
