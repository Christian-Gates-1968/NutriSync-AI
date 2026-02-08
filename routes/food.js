const express = require("express");
const router = express.Router();
const FoodLog = require("../models/FoodLog");
const { authenticate } = require("../middleware/auth");

// All food log routes require authentication
router.use(authenticate);

// GET /api/food/logs — get current user's food logs
router.get("/logs", async (req, res) => {
  try {
    const { page = 1, limit = 50, from, to, mealType } = req.query;
    const filter = { user: req.user._id };

    if (from || to) {
      filter.loggedAt = {};
      if (from) filter.loggedAt.$gte = new Date(from);
      if (to) filter.loggedAt.$lte = new Date(to);
    }
    if (mealType) filter.mealType = mealType;

    const logs = await FoodLog.find(filter)
      .sort({ loggedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await FoodLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Food logs error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/food/log — manually log a meal
router.post("/log", async (req, res) => {
  try {
    const { food, calories, protein, carbs, fat, mealType } = req.body;

    if (!food) return res.status(400).json({ error: "Food name is required" });

    const log = await FoodLog.create({
      user: req.user._id,
      food,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      mealType: mealType || "snack",
      source: "manual",
    });

    res.status(201).json({ log });
  } catch (err) {
    console.error("Food log create error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/food/logs/:id — delete a food log (own logs only)
router.delete("/logs/:id", async (req, res) => {
  try {
    const log = await FoodLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!log) return res.status(404).json({ error: "Log not found" });

    res.json({ message: "Log deleted" });
  } catch (err) {
    console.error("Food log delete error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/food/summary — daily/weekly summary for current user
router.get("/summary", async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [todaySummary, weekSummary] = await Promise.all([
      FoodLog.aggregate([
        { $match: { user: req.user._id, loggedAt: { $gte: todayStart } } },
        {
          $group: {
            _id: null,
            totalMeals: { $sum: 1 },
            calories: { $sum: "$calories" },
            protein: { $sum: "$protein" },
            carbs: { $sum: "$carbs" },
            fat: { $sum: "$fat" },
          },
        },
      ]),
      FoodLog.aggregate([
        { $match: { user: req.user._id, loggedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$loggedAt" } },
            meals: { $sum: 1 },
            calories: { $sum: "$calories" },
            protein: { $sum: "$protein" },
            carbs: { $sum: "$carbs" },
            fat: { $sum: "$fat" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      today: todaySummary[0] || { totalMeals: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
      weekByDay: weekSummary,
    });
  } catch (err) {
    console.error("Food summary error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
