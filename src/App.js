
import { useState, useEffect, useMemo } from "react";

// react-router components
import { Route, Switch, Redirect, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Vision UI Dashboard React themes
import theme from "assets/theme";

// Vision UI Dashboard React contexts
import { useVisionUIController } from "context";

/////**************ADDED THIS***********/
import { React } from "react";
import { AuthProvider, useAuth } from "context/AuthContext";
import AuthPage from "layouts/authentication/AuthPage";
import NutriSyncDashboard from "layouts/dashboard/NutriSyncDashboard";
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Tables2 from "layouts/tables2";
import Billing from "layouts/billing";
import NutriSyncLayout from "components/NutriSyncLayout";
import AIPredictions from "layouts/ai-predictions";
import NutritionalAudit from "layouts/nutritional-audit";
import AdminDashboard from "layouts/admin/AdminDashboard";
import DoctorDashboard from "layouts/doctor/DoctorDashboard";

import "react-datepicker/dist/react-datepicker.css";

function AppContent() {
  const { user, loading, isAuthenticated, isAdmin, isDoctor, isPatient, logout } = useAuth();

  const [controller] = useVisionUIController();
  const { direction } = controller;
  const { pathname } = useLocation();

  const [cal, setCal] = useState("2500");

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      }}>
        <div style={{
          width: 40, height: 40, border: "3px solid rgba(99,102,241,0.3)",
          borderTopColor: "#6366f1", borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }} />
      </div>
    );
  }

  // Not authenticated → show login/register
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Authenticated → role-based app
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      </ThemeProvider>
      <NutriSyncLayout>
        {/* Logout button */}
        <div style={{ position: "fixed", top: 12, right: 16, zIndex: 50 }}>
          <button
            onClick={logout}
            style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", padding: "6px 16px", borderRadius: 10, fontSize: 13,
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.target.style.background = "rgba(239,68,68,0.25)"; }}
            onMouseOut={(e) => { e.target.style.background = "rgba(239,68,68,0.15)"; }}
          >
            Logout
          </button>
        </div>

        <Switch>
          {/* ── Patient routes ── */}
          {(isPatient || isAdmin) && (
            <>
              <Route exact path="/dashboard" render={(props) => <NutriSyncDashboard {...props} user={{ name: user.name }} setCal={setCal} />} />
              <Route exact path="/ai-predictions" component={AIPredictions} />
              <Route exact path="/nutritional-audit" component={NutritionalAudit} />
              <Route exact path="/tables" render={(props) => <Tables {...props} cal={cal} />} />
              <Route exact path="/tables2" render={(props) => <Tables2 {...props} />} />
              <Route exact path="/billing" render={(props) => <Billing {...props} />} />
            </>
          )}

          {/* ── Doctor routes ── */}
          {(isDoctor || isAdmin) && (
            <Route exact path="/doctor" component={DoctorDashboard} />
          )}

          {/* ── Admin routes ── */}
          {isAdmin && (
            <Route exact path="/admin" component={AdminDashboard} />
          )}

          {/* Default redirect based on role */}
          <Redirect
            from="*"
            to={isAdmin ? "/dashboard" : isDoctor ? "/doctor" : "/dashboard"}
          />
        </Switch>
      </NutriSyncLayout>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
