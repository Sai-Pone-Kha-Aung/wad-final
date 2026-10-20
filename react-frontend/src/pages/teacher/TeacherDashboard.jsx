// src/pages/teacher/TeacherDashboard.jsx

import { useState, useEffect, useContext, useCallback } from "react";
import { UserContext } from "../../context/UserContext";
import { request } from "../../utils/api";
import Navbar from "../../components/Navbar";
import CourseFormModal from "../../components/CourseFormModal";
import EnrolledStudentsModal from "../../components/EnrolledStudentsModal";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  UsersIcon,
  BookOpenIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "../../components/Icons";

export default function TeacherDashboard() {
  const { user } = useContext(UserContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState(null);

  const [enrolledModalOpen, setEnrolledModalOpen] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTeacherCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await request("/course");
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeacherCourses();
  }, [fetchTeacherCourses]);

  const handleCreateCourse = async (newCourseData) => {
    await request("/course", {
      method: "POST",
      body: JSON.stringify(newCourseData),
    });
    setSuccessMsg("Course created successfully!");
    fetchTeacherCourses();
  };

  const handleUpdateCourse = async (updatedData) => {
    if (!selectedCourseForEdit) return;
    await request(`/course/${selectedCourseForEdit._id}`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
    });
    setSuccessMsg("Course updated successfully!");
    fetchTeacherCourses();
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      setDeleting(true);
      await request(`/course/${courseToDelete._id}`, {
        method: "DELETE",
      });
      setSuccessMsg("Course deleted successfully.");
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
      fetchTeacherCourses();
    } catch (err) {
      setError(err?.message || "Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  };

  const totalCourses = courses.length;
  const totalEnrolled = courses.reduce(
    (sum, c) => sum + (c.enrolledStudents?.length || 0),
    0,
  );
  const openCourses = courses.filter((c) => c.status === "Open").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <Navbar
        onOpenCreateModal={() => {
          setSelectedCourseForEdit(null);
          setFormModalOpen(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your curriculum, review enrollments, and update course offerings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCourseForEdit(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition shadow-lg shadow-purple-600/20 cursor-pointer text-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create New Course</span>
          </button>
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <BookOpenIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                My Courses
              </p>
              <p className="text-2xl font-black text-slate-900">{totalCourses}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <UsersIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Enrolled Students
              </p>
              <p className="text-2xl font-black text-slate-900">{totalEnrolled}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Open for Enrollment
              </p>
              <p className="text-2xl font-black text-slate-900">{openCourses}</p>
            </div>
          </div>
        </div>

        {/* Course Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">My Managed Courses</h2>
              <p className="text-xs text-slate-400">
                Only courses created by your account are displayed and editable.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpenIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-semibold text-slate-600">No courses created yet</p>
              <p className="text-xs text-slate-400 mb-4">
                Click "Create New Course" above to offer your first class!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 text-xs font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Course Name</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Topics</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Enrollment</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {courses.map((course) => {
                    const enrolledCount = course.enrolledStudents?.length || 0;
                    const canDelete = enrolledCount === 0;

                    return (
                      <tr key={course._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{course.name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {course.duration} days
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {course.topics?.slice(0, 3).map((topic, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {topic}
                              </span>
                            ))}
                            {course.topics?.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-500">
                                +{course.topics.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                          ${course.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourseForDetails(course);
                              setEnrolledModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              enrolledCount > 0
                                ? "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            <UsersIcon className="w-3.5 h-3.5" />
                            <span>
                              {enrolledCount} / {course.maxStudents}
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              course.status === "Open"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : course.status === "Close"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Edit Course"
                              onClick={() => {
                                setSelectedCourseForEdit(course);
                                setFormModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={!canDelete}
                              title={
                                canDelete
                                  ? "Delete Course"
                                  : "Cannot delete: students are enrolled"
                              }
                              onClick={() => {
                                if (canDelete) {
                                  setCourseToDelete(course);
                                  setDeleteConfirmOpen(true);
                                }
                              }}
                              className={`p-1.5 rounded-lg transition ${
                                canDelete
                                  ? "text-red-500 hover:bg-red-50 cursor-pointer"
                                  : "text-slate-300 cursor-not-allowed opacity-40"
                              }`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Form Modal (Create / Edit) */}
      <CourseFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={selectedCourseForEdit ? handleUpdateCourse : handleCreateCourse}
        course={selectedCourseForEdit}
        isEdit={!!selectedCourseForEdit}
      />

      {/* Enrolled Students Modal */}
      <EnrolledStudentsModal
        open={enrolledModalOpen}
        onClose={() => setEnrolledModalOpen(false)}
        course={selectedCourseForDetails}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangleIcon className="w-7 h-7" />
              <h3 className="text-lg font-bold text-slate-900">Delete Course</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">{courseToDelete?.name}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer flex items-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
