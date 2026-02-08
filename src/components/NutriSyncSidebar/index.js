import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useTheme } from "context/ThemeContext";
import {
  IoHome,
  IoStatsChart,
  IoNutrition,
  IoFitness,
  IoMedkit,
  IoPerson,
  IoChevronForward,
  IoChevronBack,
  IoSunny,
  IoMoon,
  IoSparkles,
  IoAnalytics,
  IoMenu,
  IoClose,
} from "react-icons/io5";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: IoHome,
  },
  {
    label: "AI Predictions",
    path: "/ai-predictions",
    icon: IoSparkles,
    badge: "AI",
  },
  {
    label: "Nutritional Audit",
    path: "/nutritional-audit",
    icon: IoAnalytics,
    badge: "New",
  },
  { type: "divider", label: "Trackers" },
  {
    label: "Meal Tracker",
    path: "/tables",
    icon: IoNutrition,
  },
  {
    label: "Medicine Tracker",
    path: "/tables2",
    icon: IoMedkit,
  },
  {
    label: "Workout Tracker",
    path: "/billing",
    icon: IoFitness,
  },
  { type: "divider", label: "Account" },
  {
    label: "Profile",
    path: "/profile",
    icon: IoPerson,
  },
];

export default function NutriSyncSidebar() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const history = useHistory();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    history.push(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl
          dark:bg-surface-800 dark:text-white bg-white text-surface-900
          shadow-lg border dark:border-surface-700 border-surface-200
          transition-all duration-200 hover:scale-105"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40 flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-72"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          dark:bg-gradient-sidebar dark:border-r dark:border-surface-700/50
          bg-white border-r border-surface-200
          shadow-xl
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-5 py-6 border-b dark:border-surface-700/50 border-surface-200">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow-blue">
            <IoFitness size={22} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold font-display dark:text-white text-surface-900 leading-tight">
                NutriSync
              </h1>
              <p className="text-[10px] font-semibold tracking-widest uppercase dark:text-medical-400 text-medical-600">
                AI Health Platform
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item, idx) => {
            if (item.type === "divider") {
              return (
                <div key={idx} className="pt-4 pb-2">
                  {!collapsed && (
                    <p className="px-3 text-[10px] font-bold tracking-widest uppercase dark:text-surface-500 text-surface-400">
                      {item.label}
                    </p>
                  )}
                  {collapsed && <hr className="dark:border-surface-700 border-surface-200" />}
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${collapsed ? "justify-center" : ""}
                  ${
                    active
                      ? "bg-gradient-to-r from-medical-600 to-medical-500 text-white shadow-glow-blue"
                      : "dark:text-surface-300 text-surface-600 dark:hover:bg-surface-800 hover:bg-surface-100 dark:hover:text-white hover:text-surface-900"
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-white" : "dark:text-surface-400 text-surface-500"
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="animate-fade-in">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.badge === "AI"
                            ? "bg-health-purple/20 text-health-purple"
                            : "bg-health-green/20 text-health-green"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium
                      dark:bg-surface-700 dark:text-white bg-surface-800 text-white
                      shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity duration-200 whitespace-nowrap z-50"
                  >
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t dark:border-surface-700/50 border-surface-200 space-y-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              dark:text-surface-300 text-surface-600
              dark:hover:bg-surface-800 hover:bg-surface-100
              ${collapsed ? "justify-center" : ""}
            `}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <IoSunny size={20} className="text-health-amber flex-shrink-0" />
            ) : (
              <IoMoon size={20} className="text-medical-600 flex-shrink-0" />
            )}
            {!collapsed && (
              <span className="animate-fade-in">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            )}
            {!collapsed && (
              <div
                className={`ml-auto w-10 h-5 rounded-full flex items-center px-0.5 transition-colors duration-300 ${
                  isDark ? "bg-surface-600" : "bg-medical-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    isDark
                      ? "translate-x-5 bg-health-amber"
                      : "translate-x-0 bg-medical-600"
                  }`}
                />
              </div>
            )}
          </button>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              dark:text-surface-400 text-surface-500
              dark:hover:bg-surface-800 hover:bg-surface-100
              justify-center"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <IoChevronForward size={18} /> : <IoChevronBack size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
