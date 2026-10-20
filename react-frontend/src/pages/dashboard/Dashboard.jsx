// src/pages/dashboard/Dashboard.jsx

import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import TeacherDashboard from "../teacher/TeacherDashboard";
import StudentCatalog from "../student/StudentCatalog";

export default function Dashboard() {
  const { role, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (role === "Teacher") {
    return <TeacherDashboard />;
  }

  return <StudentCatalog />;
}
