// src/components/CourseFormModal.jsx

import { useState, useEffect } from "react";
import { XIcon } from "./Icons";

export default function CourseFormModal({ open, onClose, onSubmit, course, isEdit = false }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [topics, setTopics] = useState("");
  const [price, setPrice] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [status, setStatus] = useState("Open");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (course && isEdit) {
      setName(course.name || "");
      setDuration(course.duration || "");
      setTopics(Array.isArray(course.topics) ? course.topics.join(", ") : "");
      setPrice(course.price !== undefined ? course.price : "");
      setMaxStudents(course.maxStudents || "");
      setStatus(course.status || "Open");
    } else {
      setName("");
      setDuration("");
      setTopics("");
      setPrice("");
      setMaxStudents("");
      setStatus("Open");
    }
    setError("");
  }, [course, isEdit, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Course name is required.");
      return;
    }

    const dur = Number(duration);
    if (isNaN(dur) || dur <= 0) {
      setError("Duration must be a positive number of days.");
      return;
    }

    const topicList = topics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (topicList.length === 0) {
      setError("Please provide at least one topic (separated by commas).");
      return;
    }

    const p = Number(price);
    if (isNaN(p) || p < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }

    const maxS = parseInt(maxStudents, 10);
    if (isNaN(maxS) || maxS <= 0) {
      setError("Max Students must be a positive integer.");
      return;
    }

    if (isEdit && course?.enrolledStudents?.length > maxS) {
      setError(
        `Cannot reduce Max Students below currently enrolled students count (${course.enrolledStudents.length}).`,
      );
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        name: name.trim(),
        duration: dur,
        topics: topicList,
        price: p,
        maxStudents: maxS,
        status,
      });
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to save course.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <h2 className="text-lg font-bold">
            {isEdit ? "Update Course" : "Create New Course"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Full-Stack Web Development"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Duration (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                disabled={submitting}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                disabled={submitting}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="199.99"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Max Students <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                disabled={submitting}
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                placeholder="20"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              {isEdit && course?.enrolledStudents?.length > 0 && (
                <p className="text-[11px] text-purple-600 mt-1 font-semibold">
                  Enrolled students: {course.enrolledStudents.length}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                disabled={submitting}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
              >
                <option value="Open">Open</option>
                <option value="Close">Close</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Topics <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="React, Next.js, Tailwind CSS"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <p className="text-xs text-slate-400 mt-1">Separate multiple topics with commas</p>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
