// src/pages/auth/LoginPage.jsx

import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import {
  SchoolIcon,
  EmailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
} from "../../components/Icons";

const TEST_ACCOUNTS = [
  { label: "Teacher 1", identifier: "teacher1@example.com", pass: "Teacher123!", role: "Teacher" },
  { label: "Teacher 2", identifier: "teacher2@example.com", pass: "Teacher123!", role: "Teacher" },
  { label: "Student 1", identifier: "student1@example.com", pass: "Student123!", role: "Student" },
  { label: "Student 2", identifier: "student2@example.com", pass: "Student123!", role: "Student" },
];

export default function LoginPage() {
  const { login, isAuthenticated } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter both email/username and password.");
      return;
    }

    try {
      setLoading(true);
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (acc) => {
    setIdentifier(acc.identifier);
    setPassword(acc.pass);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100">
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 mb-3 text-white">
            <SchoolIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">CourseHub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to manage courses or enroll as a student
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-200 ml-2 text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <EmailIcon className="w-5 h-5" />
              </span>
              <input
                type="text"
                autoFocus
                disabled={loading}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="teacher1@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <LockIcon className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.99] transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Quick presets for grading */}
        <div className="mt-6 pt-5 border-t border-slate-700/80">
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Testing & Grading Presets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => handleQuickFill(acc)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  acc.role === "Teacher"
                    ? "bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40"
                    : "bg-sky-950/40 border-sky-500/40 text-sky-300 hover:bg-sky-900/40"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{acc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
