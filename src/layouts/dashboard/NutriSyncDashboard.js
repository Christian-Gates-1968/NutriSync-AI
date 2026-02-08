import React, { useState, useEffect } from "react";
import { useTheme } from "context/ThemeContext";
import {
  IoWalkSharp,
  IoTimeSharp,
  IoHeartSharp,
  IoFootsteps,
  IoTrendingUp,
  IoTrendingDown,
  IoFlame,
  IoFitness,
  IoNutrition,
  IoBuild,
  IoWallet,
  IoSparkles,
  IoChevronForward,
} from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import { useHistory } from "react-router-dom";

// Re-use existing chart components
import LineChart from "examples/Charts/LineCharts/LineChart";
import BarChart from "examples/Charts/BarCharts/BarChart";
import { lineChartOptionsDashboard } from "layouts/dashboard/data/lineChartOptions";
import { barChartOptionsDashboard } from "layouts/dashboard/data/barChartOptions";

/* ───────────── Sub-components ───────────── */

function StatCard({ icon: Icon, label, value, trend, trendLabel, color, isDark }) {
  const colorMap = {
    blue:   { bg: "bg-health-blue/10",   text: "text-health-blue",   glow: "shadow-glow-blue"   },
    green:  { bg: "bg-health-green/10",   text: "text-health-green",  glow: "shadow-glow-green"  },
    red:    { bg: "bg-health-red/10",     text: "text-health-red",    glow: ""                   },
    purple: { bg: "bg-health-purple/10",  text: "text-health-purple", glow: "shadow-glow-purple" },
    amber:  { bg: "bg-health-amber/10",   text: "text-health-amber",  glow: ""                   },
    cyan:   { bg: "bg-health-cyan/10",    text: "text-health-cyan",   glow: ""                   },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
        isDark
          ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark hover:" + c.glow
          : "bg-white border-surface-200 shadow-card-light"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon size={24} className={c.text} />
        </div>
        {trend !== undefined && (
          <span
            className={`stat-badge ${
              trend >= 0
                ? "bg-health-green/10 text-health-green"
                : "bg-health-red/10 text-health-red"
            }`}
          >
            {trend >= 0 ? <IoTrendingUp size={12} /> : <IoTrendingDown size={12} />}
            {trendLabel || `${Math.abs(trend)}%`}
          </span>
        )}
      </div>
      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${
        isDark ? "text-surface-400" : "text-surface-500"
      }`}>
        {label}
      </p>
      <p className={`text-2xl font-bold font-display ${isDark ? "text-white" : "text-surface-900"}`}>
        {value}
      </p>
    </div>
  );
}

function WelcomeBanner({ name, isDark }) {
  const history = useHistory();
  return (
    <div
      className={`relative overflow-hidden p-6 sm:p-8 rounded-2xl border ${
        isDark
          ? "bg-gradient-to-br from-medical-700/40 via-surface-800/60 to-health-purple/10 border-medical-600/20"
          : "bg-gradient-to-br from-medical-50 via-white to-health-purple/5 border-medical-200/50"
      }`}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-health-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-health-purple/10 rounded-full blur-3xl" />

      <div className="relative">
        <p className={`text-sm font-medium mb-1 ${isDark ? "text-surface-400" : "text-surface-500"}`}>
          Welcome back,
        </p>
        <h2 className={`text-2xl sm:text-3xl font-bold font-display mb-2 ${
          isDark ? "text-white" : "text-surface-900"
        }`}>
          {name || "User"} 👋
        </h2>
        <p className={`text-sm mb-5 max-w-lg ${isDark ? "text-surface-300" : "text-surface-600"}`}>
          Track your progress, get AI-powered insights, and take control of your
          health journey. Your weekly stats are looking great!
        </p>
        <button
          onClick={() => history.push("/ai-predictions")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-medical-600 to-health-purple text-white
            shadow-glow-blue hover:shadow-glow-purple transition-all duration-300 hover:scale-105"
        >
          <IoSparkles size={16} />
          View AI Predictions
          <IoChevronForward size={14} />
        </button>
      </div>
    </div>
  );
}

function WorkoutSummaryCard({ isDark }) {
  const stats = [
    { icon: IoWallet, label: "Workouts", value: "32", pct: 60 },
    { icon: IoFlame, label: "Calories", value: "2,420", pct: 75 },
    { icon: FaShoppingCart, label: "Reps", value: "240", pct: 55 },
    { icon: IoBuild, label: "Laps", value: "32", pct: 48 },
  ];

  return (
    <div
      className={`p-5 rounded-2xl border ${
        isDark
          ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
          : "bg-white border-surface-200 shadow-card-light"
      }`}
    >
      <h3 className={`text-base font-bold font-display mb-1 ${isDark ? "text-white" : "text-surface-900"}`}>
        Workout Count & Calorie Count
      </h3>
      <p className={`text-xs mb-5 ${isDark ? "text-surface-400" : "text-surface-500"}`}>
        <span className="text-health-green font-semibold">(+23)</span> than last week
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md bg-health-blue/10 flex items-center justify-center">
                <s.icon size={12} className="text-health-blue" />
              </div>
              <span className={`text-xs font-medium ${isDark ? "text-surface-300" : "text-surface-600"}`}>
                {s.label}
              </span>
            </div>
            <p className={`text-lg font-bold font-display mb-2 ${isDark ? "text-white" : "text-surface-900"}`}>
              {s.value}
            </p>
            <div className={`h-1.5 rounded-full ${isDark ? "bg-surface-700" : "bg-surface-200"}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-health-blue to-health-cyan transition-all duration-500"
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Main Dashboard ───────────── */

export default function NutriSyncDashboard(props) {
  const { isDark } = useTheme();

  // ── keep existing data-fetching logic ──
  const { getRequestHeaders, getWeeklyData } = require("../../Utility/DataRequestManager.js");
  const [weekData, setWeekData] = useState([]);
  const accessToken = props.user ? props.user.accessToken : "";
  let selected = [0, 1, 2, 3, 4, 5, 6];

  const callBack = (state) => setWeekData(state);
  const requestHeaders = getRequestHeaders(accessToken);
  const timeRightNow = new Date().getTime();
  getWeeklyData(timeRightNow, requestHeaders, callBack, weekData);

  if (selected.length === 0) selected = [0, 1, 2, 3, 4, 5, 6];

  const aggData = { Calories: 0, Heart: 0, Move: 0, Steps: 0 };
  const lineWeekData = { Move: [100, 200], Steps: [100, 300], Calories: [300, 400] };
  let i = 0;

  if (weekData.length > 0) {
    selected.forEach((idx) => {
      aggData.Calories += weekData[idx].Calories;
      aggData.Heart += weekData[idx].Heart;
      aggData.Move += weekData[idx].Move;
      aggData.Steps += weekData[idx].Steps;
      lineWeekData.Move[i] = weekData[idx].Move;
      lineWeekData.Steps[i] = weekData[idx].Steps;
      lineWeekData.Calories[i] = weekData[idx].Calories;
      i += 1;
    });
  }

  // Pass calorie data to parent (for meal planner)
  var datee = new Date().getDay();
  if (props.setCal) {
    props.setCal(lineWeekData.Calories[datee - 1]);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold font-display ${
            isDark ? "text-white" : "text-surface-900"
          }`}
        >
          Dashboard
        </h1>
        <p className={`text-sm ${isDark ? "text-surface-400" : "text-surface-500"}`}>
          Your weekly health overview at a glance
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={IoWalkSharp}
          label="Calories Burnt"
          value={aggData.Calories.toLocaleString()}
          trend={55}
          trendLabel="+55%"
          color="amber"
          isDark={isDark}
        />
        <StatCard
          icon={IoTimeSharp}
          label="Move Minutes"
          value={aggData.Move.toLocaleString()}
          trend={3}
          trendLabel="+3%"
          color="blue"
          isDark={isDark}
        />
        <StatCard
          icon={IoHeartSharp}
          label="Heart Points"
          value={aggData.Heart.toLocaleString()}
          trend={-2}
          trendLabel="-2%"
          color="red"
          isDark={isDark}
        />
        <StatCard
          icon={IoFootsteps}
          label="Weekly Steps"
          value={aggData.Steps.toLocaleString()}
          trend={5}
          trendLabel="+5%"
          color="green"
          isDark={isDark}
        />
      </div>

      {/* Welcome Banner + Quick Links */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <WelcomeBanner name={props.user ? props.user.name : ""} isDark={isDark} />
        </div>
        <div className="xl:col-span-2">
          <div
            className={`h-full p-5 rounded-2xl border ${
              isDark
                ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
                : "bg-white border-surface-200 shadow-card-light"
            }`}
          >
            <h3 className={`text-base font-bold font-display mb-4 ${isDark ? "text-white" : "text-surface-900"}`}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: IoNutrition, label: "Log Meal", color: "text-health-green", bg: "bg-health-green/10" },
                { icon: IoFitness, label: "Log Workout", color: "text-health-blue", bg: "bg-health-blue/10" },
                { icon: IoSparkles, label: "AI Insights", color: "text-health-purple", bg: "bg-health-purple/10" },
                { icon: IoHeartSharp, label: "Vitals", color: "text-health-red", bg: "bg-health-red/10" },
              ].map((a) => (
                <button
                  key={a.label}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200 ${
                    isDark
                      ? "bg-surface-800/40 hover:bg-surface-700/60 border border-surface-700/30"
                      : "bg-surface-50 hover:bg-surface-100 border border-surface-200"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${a.bg}`}>
                    <a.icon size={18} className={a.color} />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? "text-surface-200" : "text-surface-700"}`}>
                    {a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
        {/* Line Chart */}
        <div
          className={`xl:col-span-4 p-5 rounded-2xl border ${
            isDark
              ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
              : "bg-white border-surface-200 shadow-card-light"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-base font-bold font-display ${isDark ? "text-white" : "text-surface-900"}`}>
              Weekly Progress Overview
            </h3>
            <span className={`text-xs ${isDark ? "text-surface-400" : "text-surface-500"}`}>
              1 min/Move · 100 steps/Unit
            </span>
          </div>
          <div className="h-72">
            <LineChart
              lineChartData={[
                {
                  name: "Move Minutes",
                  data: [
                    lineWeekData.Move[0], lineWeekData.Move[1], lineWeekData.Move[2],
                    lineWeekData.Move[3], lineWeekData.Move[4], lineWeekData.Move[5],
                    lineWeekData.Move[6],
                  ],
                },
                {
                  name: "Steps",
                  data: [
                    parseInt(`${lineWeekData.Steps[0]}`) / 100,
                    parseInt(`${lineWeekData.Steps[1]}`) / 100,
                    parseInt(`${lineWeekData.Steps[2]}`) / 100,
                    parseInt(`${lineWeekData.Steps[3]}`) / 100,
                    parseInt(`${lineWeekData.Steps[4]}`) / 100,
                    parseInt(`${lineWeekData.Steps[5]}`) / 100,
                    parseInt(`${lineWeekData.Steps[6]}`) / 100,
                  ],
                },
              ]}
              lineChartOptions={lineChartOptionsDashboard}
            />
          </div>
        </div>

        {/* Bar Chart */}
        <div
          className={`xl:col-span-3 p-5 rounded-2xl border ${
            isDark
              ? "bg-surface-800/60 border-surface-700/50 shadow-card-dark"
              : "bg-white border-surface-200 shadow-card-light"
          }`}
        >
          <h3 className={`text-base font-bold font-display mb-2 ${isDark ? "text-white" : "text-surface-900"}`}>
            Calories Burnt (Weekly)
          </h3>
          <div className="h-52 rounded-xl overflow-hidden mb-4">
            {lineWeekData.Move[3] ? (
              <BarChart
                barChartData={[
                  {
                    name: "Calories Burnt",
                    data: [
                      lineWeekData.Calories[0], lineWeekData.Calories[1], lineWeekData.Calories[2],
                      lineWeekData.Calories[3], lineWeekData.Calories[4], lineWeekData.Calories[5],
                      lineWeekData.Calories[6],
                    ],
                  },
                ]}
                barChartOptions={barChartOptionsDashboard}
              />
            ) : null}
          </div>
          <WorkoutSummaryCard isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
