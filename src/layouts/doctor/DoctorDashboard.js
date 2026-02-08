import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "context/AuthContext";

const API_BASE = "http://localhost:9000/api";

function PatientCard({ patient, onView }) {
  return (
    <div
      className="dark:bg-surface-800/80 bg-white rounded-2xl border dark:border-surface-700/50 border-surface-200 p-5 cursor-pointer
        hover:border-medical-500/50 hover:shadow-glow-blue transition-all duration-200"
      onClick={() => onView(patient._id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-medical-500 to-health-purple flex items-center justify-center text-white font-bold text-lg">
          {patient.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold dark:text-white text-surface-900 text-sm truncate">{patient.name}</p>
          <p className="text-xs dark:text-surface-400 text-surface-500 truncate">{patient.email}</p>
        </div>
        <span className="text-xs dark:text-surface-500 text-surface-400">
          {patient.lastLogin ? `Active ${new Date(patient.lastLogin).toLocaleDateString()}` : "Never logged in"}
        </span>
      </div>
    </div>
  );
}

function MacroBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium dark:text-surface-400 text-surface-500 w-16">{label}</span>
      <div className="flex-1 h-2 rounded-full dark:bg-surface-700 bg-surface-200 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold dark:text-white text-surface-900 w-12 text-right">{Math.round(value)}g</span>
    </div>
  );
}

export default function DoctorDashboard() {
  const { getAuthHeaders } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Patient detail view
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLogs, setPatientLogs] = useState([]);
  const [patientSummary, setPatientSummary] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const headers = getAuthHeaders();

  useEffect(() => {
    fetch(`${API_BASE}/doctor/patients`, { headers })
      .then((r) => r.json())
      .then((data) => setPatients(data.patients || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const viewPatient = useCallback(async (patientId) => {
    setDetailLoading(true);
    setSelectedPatient(patientId);

    try {
      const [logsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/doctor/patients/${patientId}/logs?limit=30`, { headers }),
        fetch(`${API_BASE}/doctor/patients/${patientId}/summary`, { headers }),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setPatientLogs(data.logs || []);
      }
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setPatientSummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display dark:text-white text-surface-900">
          🩺 Doctor Dashboard
        </h1>
        <p className="text-sm dark:text-surface-400 text-surface-500 mt-1">
          View your assigned patients' food logs and AI nutrition audits
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient list */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold dark:text-surface-400 text-surface-500 uppercase tracking-wider">
            Assigned Patients ({patients.length})
          </h2>
          {patients.length === 0 ? (
            <div className="dark:bg-surface-800/80 bg-white rounded-2xl border dark:border-surface-700/50 border-surface-200 p-8 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="dark:text-surface-300 text-surface-600 text-sm">No patients assigned yet.</p>
              <p className="dark:text-surface-500 text-surface-400 text-xs mt-1">
                Ask an admin to assign patients to your account.
              </p>
            </div>
          ) : (
            patients.map((p) => (
              <PatientCard
                key={p._id}
                patient={p}
                onView={viewPatient}
              />
            ))
          )}
        </div>

        {/* Patient detail */}
        <div className="lg:col-span-2">
          {!selectedPatient ? (
            <div className="dark:bg-surface-800/80 bg-white rounded-2xl border dark:border-surface-700/50 border-surface-200 p-12 text-center">
              <p className="text-5xl mb-4">👈</p>
              <p className="dark:text-surface-300 text-surface-600">Select a patient to view their data</p>
            </div>
          ) : detailLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary card */}
              {patientSummary && (
                <div className="dark:bg-surface-800/80 bg-white rounded-2xl border dark:border-surface-700/50 border-surface-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold dark:text-white text-surface-900">{patientSummary.patient?.name}</h3>
                      <p className="text-xs dark:text-surface-400 text-surface-500">{patientSummary.patient?.email} · Last 7 days</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-medical-500/20 text-medical-400">
                      {patientSummary.summary.totalMeals} meals
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    <div className="text-center">
                      <p className="text-2xl font-bold dark:text-white text-surface-900">
                        {Math.round(patientSummary.summary.avgCalories)}
                      </p>
                      <p className="text-xs dark:text-surface-400 text-surface-500">Avg Cal/Meal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-health-green">
                        {Math.round(patientSummary.summary.totalCalories)}
                      </p>
                      <p className="text-xs dark:text-surface-400 text-surface-500">Total Calories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-health-blue">
                        {Math.round(patientSummary.summary.avgProtein)}g
                      </p>
                      <p className="text-xs dark:text-surface-400 text-surface-500">Avg Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-health-amber">
                        {Math.round(patientSummary.summary.avgFat)}g
                      </p>
                      <p className="text-xs dark:text-surface-400 text-surface-500">Avg Fat</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <MacroBar label="Protein" value={patientSummary.summary.avgProtein} max={60} color="bg-health-green" />
                    <MacroBar label="Carbs" value={patientSummary.summary.avgCarbs} max={100} color="bg-health-blue" />
                    <MacroBar label="Fat" value={patientSummary.summary.avgFat} max={50} color="bg-health-amber" />
                  </div>
                </div>
              )}

              {/* Food logs table */}
              <div className="dark:bg-surface-800/80 bg-white rounded-2xl border dark:border-surface-700/50 border-surface-200 p-5">
                <h3 className="font-bold dark:text-white text-surface-900 mb-4">
                  Recent Food Logs <span className="text-xs font-normal dark:text-surface-400 text-surface-500">(read-only)</span>
                </h3>
                {patientLogs.length === 0 ? (
                  <p className="text-sm dark:text-surface-400 text-surface-500 text-center py-6">No food logs yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="dark:text-surface-400 text-surface-500 text-xs uppercase tracking-wider border-b dark:border-surface-700 border-surface-200">
                          <th className="px-3 py-2">Food</th>
                          <th className="px-3 py-2">Cal</th>
                          <th className="px-3 py-2">P</th>
                          <th className="px-3 py-2">C</th>
                          <th className="px-3 py-2">F</th>
                          <th className="px-3 py-2">Source</th>
                          <th className="px-3 py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientLogs.map((log) => (
                          <tr key={log._id} className="dark:hover:bg-surface-700/30 hover:bg-surface-50 transition-colors">
                            <td className="px-3 py-2 dark:text-white text-surface-900 font-medium">{log.food}</td>
                            <td className="px-3 py-2 dark:text-surface-300 text-surface-600">{log.calories}</td>
                            <td className="px-3 py-2 text-health-green">{log.protein}g</td>
                            <td className="px-3 py-2 text-health-blue">{log.carbs}g</td>
                            <td className="px-3 py-2 text-health-amber">{log.fat}g</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                log.source === "groq"
                                  ? "bg-health-purple/20 text-health-purple"
                                  : "bg-surface-200 dark:bg-surface-600 dark:text-surface-300 text-surface-600"
                              }`}>
                                {log.source === "groq" ? "AI" : log.source}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs dark:text-surface-400 text-surface-500">
                              {new Date(log.loggedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
