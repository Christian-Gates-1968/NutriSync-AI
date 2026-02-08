import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "context/AuthContext";

const API_BASE = "http://localhost:9000/api";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="dark:bg-surface-800/80 bg-white rounded-2xl border dark:border-surface-700/50 border-surface-200 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>{label}</span>
      </div>
      <p className="text-3xl font-bold dark:text-white text-surface-900">{value}</p>
    </div>
  );
}

function UserRow({ user, onRoleChange, onDelete, currentUserId }) {
  const [roleLoading, setRoleLoading] = useState(false);

  return (
    <tr className="dark:hover:bg-surface-700/30 hover:bg-surface-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-semibold dark:text-white text-surface-900 text-sm">{user.name}</p>
          <p className="text-xs dark:text-surface-400 text-surface-500">{user.email}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          onChange={async (e) => {
            setRoleLoading(true);
            await onRoleChange(user._id, e.target.value);
            setRoleLoading(false);
          }}
          disabled={roleLoading || user._id === currentUserId}
          className="text-xs font-medium px-2 py-1 rounded-lg dark:bg-surface-700 bg-surface-100 dark:text-white text-surface-800 border dark:border-surface-600 border-surface-300 cursor-pointer"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-4 py-3 text-xs dark:text-surface-400 text-surface-500">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
      </td>
      <td className="px-4 py-3 text-xs dark:text-surface-400 text-surface-500">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        {user._id !== currentUserId && (
          <button
            onClick={() => onDelete(user._id)}
            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}

export default function AdminDashboard() {
  const { user, getAuthHeaders } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Assign patient to doctor state
  const [assignDoctor, setAssignDoctor] = useState("");
  const [assignPatient, setAssignPatient] = useState("");
  const [assignMsg, setAssignMsg] = useState("");

  const headers = getAuthHeaders();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error("Stats error:", err); }
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`${API_BASE}/admin/users?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (err) { console.error("Users error:", err); }
  }, [search, roleFilter]);

  useEffect(() => {
    Promise.all([fetchStats(), fetchUsers()]).then(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers(pagination.page);
      fetchStats();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user and all their data?")) return;
    try {
      await fetch(`${API_BASE}/admin/users/${userId}`, { method: "DELETE", headers });
      fetchUsers(pagination.page);
      fetchStats();
    } catch (err) { console.error(err); }
  };

  const handleAssign = async () => {
    if (!assignDoctor || !assignPatient) { setAssignMsg("Select both a doctor and patient"); return; }
    try {
      const res = await fetch(`${API_BASE}/admin/assign-patient`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: assignDoctor, patientId: assignPatient }),
      });
      const data = await res.json();
      setAssignMsg(res.ok ? "✅ Patient assigned!" : data.error);
    } catch (err) { setAssignMsg("Error assigning patient"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const doctors = users.filter(u => u.role === "doctor");
  const patients = users.filter(u => u.role === "patient");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display dark:text-white text-surface-900">
          Admin Dashboard
        </h1>
        <p className="text-sm dark:text-surface-400 text-surface-500 mt-1">
          System health, user management, and API monitoring
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Users" value={stats.users.total} icon="👥" color="bg-medical-500/20 text-medical-400" />
          <StatCard label="Patients" value={stats.users.patients} icon="🧑‍💻" color="bg-health-green/20 text-health-green" />
          <StatCard label="Doctors" value={stats.users.doctors} icon="🩺" color="bg-health-blue/20 text-health-blue" />
          <StatCard label="Admins" value={stats.users.admins} icon="🛡️" color="bg-health-purple/20 text-health-purple" />
          <StatCard label="Food Logs" value={stats.foodLogs.total} icon="🍽️" color="bg-health-amber/20 text-health-amber" />
          <StatCard label="Today's Logs" value={stats.foodLogs.today} icon="📊" color="bg-health-cyan/20 text-health-cyan" />
          <StatCard label="API Calls (24h)" value={stats.apiUsage.last24h} icon="⚡" color="bg-health-teal/20 text-health-teal" />
          <StatCard label="Groq Errors" value={stats.apiUsage.groq.errors} icon="⚠️" color="bg-health-red/20 text-health-red" />
        </div>
      )}

      {/* Assign Patient to Doctor */}
      <div className="dark:bg-surface-800/80 bg-white rounded-2xl border dark:border-surface-700/50 border-surface-200 p-5">
        <h2 className="text-lg font-bold dark:text-white text-surface-900 mb-4">Assign Patient → Doctor</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-medium dark:text-surface-400 text-surface-500 block mb-1">Doctor</label>
            <select value={assignDoctor} onChange={(e) => setAssignDoctor(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg dark:bg-surface-700 bg-surface-100 dark:text-white text-surface-800 border dark:border-surface-600 border-surface-300">
              <option value="">Select doctor...</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.email})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium dark:text-surface-400 text-surface-500 block mb-1">Patient</label>
            <select value={assignPatient} onChange={(e) => setAssignPatient(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg dark:bg-surface-700 bg-surface-100 dark:text-white text-surface-800 border dark:border-surface-600 border-surface-300">
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
            </select>
          </div>
          <button onClick={handleAssign}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-medical-600 to-medical-500 rounded-lg hover:shadow-glow-blue transition-all">
            Assign
          </button>
          {assignMsg && <span className="text-xs dark:text-surface-400 text-surface-500">{assignMsg}</span>}
        </div>
      </div>

      {/* User Management Table */}
      <div className="dark:bg-surface-800/80 bg-white rounded-2xl border dark:border-surface-700/50 border-surface-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold dark:text-white text-surface-900">User Management</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg dark:bg-surface-700 bg-surface-100 dark:text-white text-surface-800 border dark:border-surface-600 border-surface-300 w-56"
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg dark:bg-surface-700 bg-surface-100 dark:text-white text-surface-800 border dark:border-surface-600 border-surface-300">
              <option value="">All roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="dark:text-surface-400 text-surface-500 text-xs uppercase tracking-wider border-b dark:border-surface-700 border-surface-200">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Last Login</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u._id}
                  user={u}
                  onRoleChange={handleRoleChange}
                  onDelete={handleDelete}
                  currentUserId={user.id}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-surface-700 border-surface-200">
            <span className="text-xs dark:text-surface-400 text-surface-500">
              {pagination.total} users total
            </span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchUsers(i + 1)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    pagination.page === i + 1
                      ? "bg-medical-500 text-white"
                      : "dark:bg-surface-700 bg-surface-100 dark:text-surface-300 text-surface-600 hover:bg-medical-500/20"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
