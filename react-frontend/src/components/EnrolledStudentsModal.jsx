// src/components/EnrolledStudentsModal.jsx

import { XIcon, UsersIcon } from "./Icons";

export default function EnrolledStudentsModal({ open, onClose, course }) {
  if (!open || !course) return null;

  const enrolledStudents = course.enrolledStudents || [];
  const enrolledCount = enrolledStudents.length;
  const maxStudents = course.maxStudents || 0;
  const seatsAvailable = Math.max(0, maxStudents - enrolledCount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h2 className="text-lg font-bold leading-tight">{course.name}</h2>
            <p className="text-xs text-slate-400">Course ID: {course._id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                course.status === "Open"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : course.status === "Close"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {course.status}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Duration</p>
              <p className="text-base font-bold text-slate-800">{course.duration} Days</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Price</p>
              <p className="text-base font-bold text-indigo-600">${course.price?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Enrolled</p>
              <p className="text-base font-bold text-purple-600">
                {enrolledCount} / {maxStudents}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Remaining</p>
              <p
                className={`text-base font-bold ${
                  seatsAvailable === 0 ? "text-red-500" : "text-emerald-600"
                }`}
              >
                {seatsAvailable} seats
              </p>
            </div>
          </div>

          {/* Topics */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {course.topics?.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Enrolled Students Table */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Enrolled Students ({enrolledCount})
              </h3>
            </div>

            {enrolledCount === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <UsersIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No students enrolled yet</p>
                <p className="text-xs text-slate-400">
                  When students enroll in this course, their details will show up here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">Username</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Enrollment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {enrolledStudents.map((student, idx) => (
                      <tr key={student.studentId || idx} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-2.5 text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">
                          {student.username || "N/A"}
                        </td>
                        <td className="px-4 py-2.5">{student.email || "N/A"}</td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {student.enrolledAt
                            ? new Date(student.enrolledAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
