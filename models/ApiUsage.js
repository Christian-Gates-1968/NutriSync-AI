const mongoose = require("mongoose");

const apiUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    endpoint: { type: String, required: true },
    service: { type: String, enum: ["groq", "twilio", "internal"], required: true },
    success: { type: Boolean, default: true },
    responseTime: { type: Number, default: 0 }, // ms
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

apiUsageSchema.index({ createdAt: -1 });
apiUsageSchema.index({ service: 1, createdAt: -1 });

module.exports = mongoose.model("ApiUsage", apiUsageSchema);
