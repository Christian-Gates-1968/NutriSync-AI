const mongoose = require("mongoose");

const foodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    food: { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    confidence: { type: String, enum: ["high", "medium", "low", null], default: null },
    details: { type: String, default: null },
    source: { type: String, enum: ["groq", "mock", "manual"], default: "manual" },
    imageFilename: { type: String, default: null },
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], default: "snack" },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for efficient per-user date-range queries
foodLogSchema.index({ user: 1, loggedAt: -1 });

module.exports = mongoose.model("FoodLog", foodLogSchema);
