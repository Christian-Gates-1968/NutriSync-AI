import React from "react";
import NutriSyncSidebar from "components/NutriSyncSidebar";
import { useTheme } from "context/ThemeContext";

/**
 * NutriSyncLayout — responsive wrapper with sidebar + main content area.
 * Respects dark/light mode from ThemeContext.
 */
export default function NutriSyncLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-medical text-white"
          : "bg-surface-50 text-surface-900"
      }`}
    >
      <NutriSyncSidebar />

      {/* Main content area — offset by sidebar width */}
      <main className="lg:ml-72 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
