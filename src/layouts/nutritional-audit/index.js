import React, { useState } from "react";
import { useTheme } from "context/ThemeContext";
import {
  IoAnalytics,
  IoNutrition,
  IoWater,
  IoLeaf,
  IoFlame,
  IoChevronDown,
  IoChevronUp,
  IoCheckmarkCircle,
  IoWarning,
  IoCloseCircle,
  IoTrendingUp,
  IoTrendingDown,
  IoSearch,
} from "react-icons/io5";

/* ───────────── Helpers ───────────── */

function GradeRing({ grade, size = 80, isDark }) {
  const gradeColors = {
    A: "text-health-green",
    B: "text-health-blue",
    C: "text-health-amber",
    D: "text-health-red",
    F: "text-health-red",
  };
  const gradeTrack = {
    A: "stroke-health-green",
    B: "stroke-health-blue",
    C: "stroke-health-amber",
    D: "stroke-health-red",
    F: "stroke-health-red",
  };
  const pct = { A: 95, B: 78, C: 60, D: 40, F: 20 };
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * (pct[grade] || 50)) / 100;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
          className={isDark ? "stroke-surface-700" : "stroke-surface-200"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={`${gradeTrack[grade]} transition-all duration-700`}
        />
      </svg>
      <span className={`absolute text-2xl font-bold font-display ${gradeColors[grade]}`}>
        {grade}
      </span>
    </div>
  );
}

function NutrientRow({ name, current, target, unit, status, isDark }) {
  const pct = Math.min((current / target) * 100, 100);
  const statusIcon =
    status === "good" ? (
      <IoCheckmarkCircle className="text-health-green" size={16} />
    ) : status === "warning" ? (
      <IoWarning className="text-health-amber" size={16} />
    ) : (
      <IoCloseCircle className="text-health-red" size={16} />
    );
  const barColor =
    status === "good" ? "bg-health-green" : status === "warning" ? "bg-health-amber" : "bg-health-red";

  return (
    <div
      className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-colors ${
        isDark ? "hover:bg-surface-800/40" : "hover:bg-surface-50"
      }`}
    >
      <div className="w-5 flex-shrink-0">{statusIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${isDark ? "text-white" : "text-surface-900"}`}>
            {name}
          </span>
          <span className={`text-xs font-semibold ${isDark ? "text-surface-300" : "text-surface-600"}`}>
            {current}/{target} {unit}
          </span>
        </div>
        <div className={`h-1.5 rounded-full ${isDark ? "bg-surface-700" : "bg-surface-200"}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ───────────── Main Page ───────────── */

export default function NutritionalAudit() {
  const { isDark } = useTheme();
  const [expandedMeal, setExpandedMeal] = useState(null);

  const overallGrade = "B";

  const macros = [
    { name: "Protein", current: 125, target: 150, unit: "g", status: "warning" },
    { name: "Carbohydrates", current: 220, target: 250, unit: "g", status: "good" },
    { name: "Healthy Fats", current: 58, target: 65, unit: "g", status: "good" },
    { name: "Fiber", current: 18, target: 30, unit: "g", status: "bad" },
    { name: "Sugar", current: 42, target: 50, unit: "g", status: "good" },
    { name: "Sodium", current: 2100, target: 2300, unit: "mg", status: "warning" },
  ];

  const micros = [
    { name: "Vitamin D", current: 400, target: 600, unit: "IU", status: "bad" },
    { name: "Iron", current: 14, target: 18, unit: "mg", status: "warning" },
    { name: "Calcium", current: 950, target: 1000, unit: "mg", status: "good" },
    { name: "Vitamin B12", current: 2.2, target: 2.4, unit: "mcg", status: "good" },
    { name: "Omega-3", current: 1.1, target: 1.6, unit: "g", status: "bad" },
    { name: "Potassium", current: 3200, target: 3500, unit: "mg", status: "warning" },
  ];

  const meals = [
    {
      name: "Breakfast",
      time: "8:00 AM",
      calories: 420,
      grade: "A",
      items: ["Oatmeal with berries", "Greek yogurt", "Green tea"],
    },
    {
      name: "Lunch",
      time: "12:30 PM",
      calories: 680,
      grade: "B",
      items: ["Grilled chicken salad", "Whole grain bread", "Apple"],
    },
    {
      name: "Snack",
      time: "3:30 PM",
      calories: 180,
      grade: "C",
      items: ["Protein bar", "Black coffee"],
    },
    {
      name: "Dinner",
      time: "7:00 PM",
      calories: 750,
      grade: "B",
      items: ["Salmon with quinoa", "Steamed broccoli", "Mixed nuts"],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-health-green/10">
            <IoAnalytics size={24} className="text-health-green" />
          </div>
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-bold font-display ${
                isDark ? "text-white" : "text-surface-900"
              }`}
            >
              Nutritional Audit
            </h1>
            <p className={`text-sm ${isDark ? "text-surface-400" : "text-surface-500"}`}>
              Comprehensive breakdown of your daily nutrition
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            isDark
              ? "bg-surface-800/60 border-surface-700/50"
              : "bg-white border-surface-200"
          }`}
        >
          <IoSearch size={16} className={isDark ? "text-surface-400" : "text-surface-500"} />
          <input
            type="text"
            placeholder="Search nutrients..."
            className={`bg-transparent text-sm outline-none w-40 ${
              isDark
                ? "text-white placeholder-surface-500"
                : "text-surface-900 placeholder-surface-400"
            }`}
          />
        </div>
      </div>

      {/* Top Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Grade */}
        <div
          className={`p-6 rounded-2xl border text-center ${
            isDark
              ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
              : "bg-white border-surface-200 shadow-card-light"
          }`}
        >
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
            isDark ? "text-surface-400" : "text-surface-500"
          }`}>
            Overall Nutrition Grade
          </p>
          <GradeRing grade={overallGrade} size={90} isDark={isDark} />
          <p className={`text-sm mt-3 ${isDark ? "text-surface-300" : "text-surface-600"}`}>
            Good — minor improvements needed
          </p>
        </div>

        {/* Calorie Summary */}
        <div
          className={`p-6 rounded-2xl border ${
            isDark
              ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
              : "bg-white border-surface-200 shadow-card-light"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? "text-surface-400" : "text-surface-500"
            }`}>
              Calorie Budget
            </p>
            <span className="stat-badge bg-health-green/10 text-health-green">
              <IoTrendingUp size={12} /> On Track
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className={`text-3xl font-bold font-display ${isDark ? "text-white" : "text-surface-900"}`}>
                2,030
              </span>
              <span className={`text-sm ${isDark ? "text-surface-400" : "text-surface-500"}`}>
                / 2,500 kcal
              </span>
            </div>
            <div className={`h-2.5 rounded-full ${isDark ? "bg-surface-700" : "bg-surface-200"}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-health-green to-health-teal transition-all duration-500"
                style={{ width: "81%" }}
              />
            </div>
            <p className={`text-xs ${isDark ? "text-surface-400" : "text-surface-500"}`}>
              470 kcal remaining today
            </p>
          </div>
        </div>

        {/* Water Intake */}
        <div
          className={`p-6 rounded-2xl border ${
            isDark
              ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
              : "bg-white border-surface-200 shadow-card-light"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? "text-surface-400" : "text-surface-500"
            }`}>
              Hydration
            </p>
            <IoWater className="text-health-blue" size={20} />
          </div>
          <div className="flex items-end gap-1 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
              <div
                key={glass}
                className={`flex-1 rounded-t-md transition-colors duration-300 ${
                  glass <= 5
                    ? "bg-health-blue"
                    : isDark
                    ? "bg-surface-700"
                    : "bg-surface-200"
                }`}
                style={{ height: `${20 + glass * 4}px` }}
              />
            ))}
          </div>
          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-surface-900"}`}>
            5 / 8 glasses
          </p>
          <p className={`text-xs ${isDark ? "text-surface-400" : "text-surface-500"}`}>
            3 more glasses to reach your daily goal
          </p>
        </div>
      </div>

      {/* Macronutrients & Micronutrients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Macros */}
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark
              ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
              : "bg-white border-surface-200 shadow-card-light"
          }`}
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b dark:border-surface-700/50 border-surface-200">
            <IoFlame className="text-health-amber" size={18} />
            <h2 className={`text-base font-bold font-display ${isDark ? "text-white" : "text-surface-900"}`}>
              Macronutrients
            </h2>
          </div>
          <div className="divide-y dark:divide-surface-700/30 divide-surface-100">
            {macros.map((n) => (
              <NutrientRow key={n.name} {...n} isDark={isDark} />
            ))}
          </div>
        </div>

        {/* Micros */}
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark
              ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
              : "bg-white border-surface-200 shadow-card-light"
          }`}
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b dark:border-surface-700/50 border-surface-200">
            <IoLeaf className="text-health-green" size={18} />
            <h2 className={`text-base font-bold font-display ${isDark ? "text-white" : "text-surface-900"}`}>
              Micronutrients
            </h2>
          </div>
          <div className="divide-y dark:divide-surface-700/30 divide-surface-100">
            {micros.map((n) => (
              <NutrientRow key={n.name} {...n} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>

      {/* Meal Breakdown */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark
            ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
            : "bg-white border-surface-200 shadow-card-light"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b dark:border-surface-700/50 border-surface-200">
          <IoNutrition className="text-health-teal" size={18} />
          <h2 className={`text-base font-bold font-display ${isDark ? "text-white" : "text-surface-900"}`}>
            Today's Meal Breakdown
          </h2>
        </div>
        <div className="divide-y dark:divide-surface-700/30 divide-surface-100">
          {meals.map((meal, idx) => (
            <div key={idx}>
              <button
                onClick={() => setExpandedMeal(expandedMeal === idx ? null : idx)}
                className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
                  isDark ? "hover:bg-surface-800/40" : "hover:bg-surface-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GradeRing grade={meal.grade} size={36} isDark={isDark} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-surface-900"}`}>
                      {meal.name}
                    </p>
                    <p className={`text-xs ${isDark ? "text-surface-400" : "text-surface-500"}`}>
                      {meal.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${isDark ? "text-surface-200" : "text-surface-700"}`}>
                    {meal.calories} kcal
                  </span>
                  {expandedMeal === idx ? (
                    <IoChevronUp size={16} className={isDark ? "text-surface-400" : "text-surface-500"} />
                  ) : (
                    <IoChevronDown size={16} className={isDark ? "text-surface-400" : "text-surface-500"} />
                  )}
                </div>
              </button>
              {expandedMeal === idx && (
                <div className={`px-5 pb-4 animate-fade-in`}>
                  <ul className="space-y-1 ml-12">
                    {meal.items.map((item, i) => (
                      <li
                        key={i}
                        className={`text-sm flex items-center gap-2 ${
                          isDark ? "text-surface-300" : "text-surface-600"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-health-teal flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
