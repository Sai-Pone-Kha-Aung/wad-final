// src/pages/student/StudentEnrolled.jsx

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { request } from "../../utils/api";
import Navbar from "../../components/Navbar";
import { BookmarkIcon, ClockIcon, BookOpenIcon } from "../../components/Icons";

export default function StudentEnrolled() {
  const { user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        setLoading(true);
        setError("");
        const data = await request("/course/enrolled");
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to load enrolled courses.");
      } finally {
        setLoading(false);
      }
    }
    fetchEnrolledCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              My Enrolled Courses
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track all active classes you are currently enrolled in.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition"
          >
            <span>Browse More Courses</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <BookmarkIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-600">
              You haven't enrolled in any courses yet
            </p>
            <p className="text-xs text-slate-400 mb-5">
              Explore available courses and enroll to start learning today!
            </p>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-700 transition shadow-sm text-sm"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const myEnrollment = course.enrolledStudents?.find(
                (s) => s.studentId === user?.id || s.email === user?.email,
              );

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-sky-600">
                        Instructor: {course.teacherName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Enrolled
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                      {course.name}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mb-3">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{course.duration} Days</span>
                      </div>
                      <span>•</span>
                      <span>${course.price?.toFixed(2)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.topics?.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Enrolled on:{" "}
                      <strong className="text-slate-800">
                        {myEnrollment?.enrolledAt
                          ? new Date(myEnrollment.enrolledAt).toLocaleDateString()
                          : "Recently"}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
