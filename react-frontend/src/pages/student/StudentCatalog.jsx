// src/pages/student/StudentCatalog.jsx

import { useState, useEffect, useContext, useCallback } from "react";
import { UserContext } from "../../context/UserContext";
import { request } from "../../utils/api";
import Navbar from "../../components/Navbar";
import {
  SearchIcon,
  SchoolIcon,
  ClockIcon,
  CheckCircleIcon,
  BanIcon,
  InfoIcon,
  XIcon,
} from "../../components/Icons";

export default function StudentCatalog() {
  const { user } = useContext(UserContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");

  // Enrollment in progress
  const [enrollingId, setEnrollingId] = useState(null);

  // Selected course for detail modal
  const [detailCourse, setDetailCourse] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (nameFilter.trim()) params.append("name", nameFilter.trim());
      if (teacherFilter.trim()) params.append("teacher", teacherFilter.trim());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const data = await request(`/course${queryString}`);

      // Safeguard: Never display Cancel status courses to students
      const validCourses = Array.isArray(data)
        ? data.filter((c) => c.status !== "Cancel")
        : [];
      setCourses(validCourses);
    } catch (err) {
      setError(err?.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, [nameFilter, teacherFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      setError("");
      setSuccessMsg("");

      const res = await request(`/course/${courseId}/enroll`, {
        method: "POST",
      });

      setSuccessMsg(res?.message || "Successfully enrolled in course!");
      fetchCourses();
    } catch (err) {
      setError(err?.message || "Enrollment failed.");
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Banner */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Explore Available Courses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover courses taught by certified instructors and advance your technical skills.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-800 text-lg leading-none cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
            <span>{successMsg}</span>
            <button
              type="button"
              onClick={() => setSuccessMsg("")}
              className="text-emerald-500 hover:text-emerald-800 text-lg leading-none cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs mb-8">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <SearchIcon className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by course name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <SearchIcon className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Filter by teacher name..."
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <SchoolIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-600">No matching courses found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search keywords or clear the filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const enrolledCount = course.enrolledStudents?.length || 0;
              const maxStudents = course.maxStudents || 0;
              const seatsAvailable = Math.max(0, maxStudents - enrolledCount);
              const isFull = seatsAvailable === 0;

              const isEnrolled = course.enrolledStudents?.some(
                (s) => s.studentId === user?.id || s.email === user?.email,
              );

              const isOpen = course.status === "Open";
              const canEnroll = isOpen && !isFull && !isEnrolled;

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition duration-150"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-sky-600">
                        Instructor: {course.teacherName || "Certified Teacher"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isOpen
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                      {course.name}
                    </h2>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mb-3">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{course.duration} Days</span>
                      </div>
                      <span>•</span>
                      <span className="text-sky-600 font-bold">${course.price?.toFixed(2)}</span>
                    </div>

                    {/* Topic chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.topics?.slice(0, 4).map((topic, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Capacity pill */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Capacity</span>
                        <span className="font-bold text-slate-800">
                          {enrolledCount} / {maxStudents} enrolled
                        </span>
                      </div>
                      <p
                        className={`text-xs font-bold ${
                          isFull ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {isFull ? "Course full" : `${seatsAvailable} seats remaining`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDetailCourse(course)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      <InfoIcon className="w-4 h-4" />
                      <span>Details</span>
                    </button>

                    {isEnrolled ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Enrolled</span>
                      </span>
                    ) : !isOpen ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-400">
                        <BanIcon className="w-4 h-4" />
                        <span>Closed</span>
                      </span>
                    ) : isFull ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-400">
                        Course Full
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrollingId === course._id}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {enrollingId === course._id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Enroll Now"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Course Detail Modal */}
      {detailCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h2 className="text-lg font-bold">{detailCourse.name}</h2>
              <button
                type="button"
                onClick={() => setDetailCourse(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Instructor</p>
                <p className="text-sm font-bold text-slate-800">
                  {detailCourse.teacherName} ({detailCourse.teacherEmail})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Duration</span>
                  <p className="text-sm font-bold text-slate-800">{detailCourse.duration} Days</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Tuition</span>
                  <p className="text-sm font-bold text-sky-600">
                    ${detailCourse.price?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Status</span>
                  <p className="text-sm font-bold text-emerald-600">{detailCourse.status}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Seats</span>
                  <p className="text-sm font-bold text-slate-800">
                    {Math.max(
                      0,
                      (detailCourse.maxStudents || 0) -
                        (detailCourse.enrolledStudents?.length || 0),
                    )}{" "}
                    seats left
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">
                  Curriculum Topics
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detailCourse.topics?.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDetailCourse(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
