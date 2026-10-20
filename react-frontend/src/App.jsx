// src/App.jsx

import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentEnrolled from "./pages/student/StudentEnrolled";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Route (adapts to Teacher or Student) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher Dedicated Route */}
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowedRoles={["Teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Dedicated Enrolled Courses Route */}
        <Route
          path="/enrolled"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentEnrolled />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
