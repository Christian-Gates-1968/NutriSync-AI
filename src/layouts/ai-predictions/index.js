import React from "react";
import { useTheme } from "context/ThemeContext";
import {
  IoSparkles,
  IoTrendingUp,
  IoTrendingDown,
  IoHeart,
  IoFitness,
  IoNutrition,
  IoFlash,
  IoTime,
  IoCheckmarkCircle,
  IoAlertCircle,
} from "react-icons/io5";

/* ───────────── Small reusable sub-components ───────────── */

function MetricCard({ icon: Icon, label, value, trend, color, isDark }) {
  const colors = {
    blue:   { bg: "bg-health-blue/10",   text: "text-health-blue",   border: "border-health-blue/20"   },
    green:  { bg: "bg-health-green/10",   text: "text-health-green",  border: "border-health-green/20"  },
    purple: { bg: "bg-health-purple/10",  text: "text-health-purple", border: "border-health-purple/20" },
    red:    { bg: "bg-health-red/10",     text: "text-health-red",    border: "border-health-red/20"    },
    amber:  { bg: "bg-health-amber/10",   text: "text-health-amber",  border: "border-health-amber/20"  },
    cyan:   { bg: "bg-health-cyan/10",    text: "text-health-cyan",   border: "border-health-cyan/20"   },
  };
  const c = colors[color] || colors.blue;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
        isDark
          ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
          : "bg-white border-surface-200 shadow-card-light"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          <Icon size={22} className={c.text} />
        </div>
        {trend && (
          <span
            className={`stat-badge ${
              trend > 0
                ? "bg-health-green/10 text-health-green"
                : "bg-health-red/10 text-health-red"
            }`}
          >
            {trend > 0 ? <IoTrendingUp size={12} /> : <IoTrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={`text-xs font-medium mb-1 ${isDark ? "text-surface-400" : "text-surface-500"}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold font-display ${isDark ? "text-white" : "text-surface-900"}`}>
        {value}
      </p>
    </div>
  );
}

function PredictionCard({ title, confidence, status, detail, isDark }) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isDark
          ? "bg-surface-800/40 border-surface-700/40"
          : "bg-surface-50 border-surface-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-sm font-semibold ${isDark ? "text-white" : "text-surface-900"}`}>
          {title}
        </h4>
        {status === "good" ? (
          <IoCheckmarkCircle className="text-health-green" size={18} />
        ) : (
          <IoAlertCircle className="text-health-amber" size={18} />
        )}
      </div>
      <p className={`text-xs mb-3 ${isDark ? "text-surface-400" : "text-surface-500"}`}>
        {detail}
      </p>
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 h-1.5 rounded-full ${isDark ? "bg-surface-700" : "bg-surface-200"}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              confidence >= 80
                ? "bg-health-green"
                : confidence >= 50
                ? "bg-health-amber"
                : "bg-health-red"
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${isDark ? "text-surface-300" : "text-surface-600"}`}>
          {confidence}%
        </span>
      </div>
    </div>
  );
}

/* ───────────── Main Page ───────────── */

export default function AIPredictions() {
  const { isDark } = useTheme();

  const predictions = [
    {
      title: "Calorie Goal Achievement",
      confidence: 87,
      status: "good",
      detail: "Based on your 7-day trend, you're likely to hit your daily calorie target.",
    },
    {
      title: "Hydration Level",
      confidence: 62,
      status: "warning",
      detail: "Water intake has been below recommended levels for 3 consecutive days.",
    },
    {
      title: "Sleep Quality Forecast",
      confidence: 74,
      status: "warning",
      detail: "Late workout sessions may affect tonight's deep sleep duration.",
    },
    {
      title: "Protein Intake",
      confidence: 91,
      status: "good",
      detail: "Current protein consumption aligns well with your fitness goals.",
    },
    {
      title: "Heart Rate Variability",
      confidence: 83,
      status: "good",
      detail: "HRV trending upward — indicates good recovery and low stress.",
    },
    {
      title: "Workout Consistency",
      confidence: 55,
      status: "warning",
      detail: "Missed 2 planned sessions this week. Consider adjusting your schedule.",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-health-purple/10">
            <IoSparkles size={24} className="text-health-purple" />
          </div>
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-bold font-display ${
                isDark ? "text-white" : "text-surface-900"
              }`}
            >
              AI Predictions
            </h1>
            <p className={`text-sm ${isDark ? "text-surface-400" : "text-surface-500"}`}>
              Machine learning insights from your health data
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={IoFlash}
          label="Prediction Accuracy"
          value="94.2%"
          trend={3.1}
          color="purple"
          isDark={isDark}
        />
        <MetricCard
          icon={IoHeart}
          label="Health Score"
          value="82/100"
          trend={5}
          color="green"
          isDark={isDark}
        />
        <MetricCard
          icon={IoFitness}
          label="Risk Factors"
          value="Low"
          trend={-12}
          color="cyan"
          isDark={isDark}
        />
        <MetricCard
          icon={IoTime}
          label="Next Checkup"
          value="14 days"
          color="amber"
          isDark={isDark}
        />
      </div>

      {/* AI Insight Banner */}
      <div
        className={`p-5 rounded-2xl border relative overflow-hidden ${
          isDark
            ? "bg-gradient-to-r from-health-purple/10 to-health-blue/10 border-health-purple/20"
            : "bg-gradient-to-r from-health-purple/5 to-health-blue/5 border-health-purple/10"
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-health-purple/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <IoSparkles className="text-health-purple" size={18} />
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-health-purple" : "text-health-purple"
            }`}>
              AI Insight of the Day
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${isDark ? "text-surface-200" : "text-surface-700"}`}>
            Your metabolic rate shows a <strong>12% improvement</strong> over the last 30 days.
            Combining your current workout intensity with your meal plan, our model predicts you'll
            reach your target weight within <strong>6-8 weeks</strong>. Keep up the excellent
            consistency!
          </p>
        </div>
      </div>

      {/* Prediction Cards Grid */}
      <div>
        <h2
          className={`text-lg font-bold font-display mb-4 ${
            isDark ? "text-white" : "text-surface-900"
          }`}
        >
          Active Predictions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((p, i) => (
            <PredictionCard key={i} {...p} isDark={isDark} />
          ))}
        </div>
      </div>

      {/* Recommendation Section */}
      <div
        className={`p-6 rounded-2xl border ${
          isDark
            ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
            : "bg-white border-surface-200 shadow-card-light"
        }`}
      >
        <h2
          className={`text-lg font-bold font-display mb-4 ${
            isDark ? "text-white" : "text-surface-900"
          }`}
        >
          Personalized Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: IoNutrition,
              title: "Increase Fiber",
              desc: "Add 5g more daily fiber to improve digestion score.",
              color: "text-health-green",
              bg: "bg-health-green/10",
            },
            {
              icon: IoFitness,
              title: "Morning Workouts",
              desc: "Shifting to AM sessions may boost your metabolism 15%.",
              color: "text-health-blue",
              bg: "bg-health-blue/10",
            },
            {
              icon: IoHeart,
              title: "Stress Management",
              desc: "10-min daily meditation can improve your HRV by 20%.",
              color: "text-health-purple",
              bg: "bg-health-purple/10",
            },
          ].map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                isDark
                  ? "bg-surface-800/40 border-surface-700/30"
                  : "bg-surface-50 border-surface-200"
              }`}
            >
              <div className={`p-2 rounded-lg ${rec.bg} inline-flex mb-3`}>
                <rec.icon size={20} className={rec.color} />
              </div>
              <h3 className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-surface-900"}`}>
                {rec.title}
              </h3>
              <p className={`text-xs ${isDark ? "text-surface-400" : "text-surface-500"}`}>
                {rec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
