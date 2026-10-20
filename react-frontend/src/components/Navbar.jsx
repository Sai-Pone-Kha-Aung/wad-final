// src/components/Navbar.jsx

import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import {
  SchoolIcon,
  BookOpenIcon,
  BookmarkIcon,
  PlusIcon,
  LogoutIcon,
  UserIcon,
} from "./Icons";

export default function Navbar({ onOpenCreateModal }) {
  const { user, logout, role } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isTeacher = role === "Teacher";

  return (
    <nav className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div
              className={`p-2 rounded-xl text-white shadow-sm transition ${
                isTeacher ? "bg-purple-600 group-hover:bg-purple-500" : "bg-sky-600 group-hover:bg-sky-500"
              }`}
            >
              <SchoolIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                CourseHub
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Course Management</span>
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {isTeacher ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      location.pathname === "/dashboard"
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">My Courses</span>
                  </Link>

                  {onOpenCreateModal && (
                    <button
                      type="button"
                      onClick={onOpenCreateModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 transition shadow-sm cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>New Course</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      location.pathname === "/dashboard"
                        ? "bg-sky-600/20 text-sky-300 border border-sky-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Explore Courses</span>
                  </Link>

                  <Link
                    to="/enrolled"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      location.pathname === "/enrolled"
                        ? "bg-sky-600/20 text-sky-300 border border-sky-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    <span>My Enrolled</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Profile & Logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-right">
                <div>
                  <p className="text-xs font-bold text-slate-200 leading-tight">{user.username}</p>
                  <p className="text-[11px] text-slate-400">{user.email}</p>
                </div>
              </div>

              {/* Role badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isTeacher
                    ? "bg-purple-950/60 border-purple-500/40 text-purple-300"
                    : "bg-sky-950/60 border-sky-500/40 text-sky-300"
                }`}
              >
                {user.role}
              </span>

              {/* Logout button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-300 border border-red-500/30 hover:bg-red-500/10 transition cursor-pointer"
              >
                <LogoutIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
