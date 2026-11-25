import React, { useState, useEffect } from 'react';
import { interviewsApi, applicationsApi } from '../api/client';
import {
  X,
  CalendarCheck,
  Video,
  User,
  FileText,
  Clock,
  Building,
  AlertCircle,
} from 'lucide-react';

export const InterviewModal = ({
  isOpen,
  onClose,
  interview = null,
  initialApplication = null,
  onSaved,
}) => {
  const isEditing = Boolean(interview && interview.id);

  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    jobApplicationId: '',
    roundType: 'TECHNICAL',
    scheduledAt: '',
    meetingLink: '',
    interviewer: '',
    notes: '',
    outcome: 'PENDING',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await applicationsApi.getAll();
        setApplications(res.data);
      } catch (err) {
        console.error('Failed to load applications for interview scheduling', err);
      }
    };
    if (isOpen) {
      fetchApps();
    }
  }, [isOpen]);

  useEffect(() => {
    if (interview) {
      setFormData({
        jobApplicationId: interview.jobApplicationId || '',
        roundType: interview.roundType || 'TECHNICAL',
        scheduledAt: interview.scheduledAt ? interview.scheduledAt.substring(0, 16) : '',
        meetingLink: interview.meetingLink || '',
        interviewer: interview.interviewer || '',
        notes: interview.notes || '',
        outcome: interview.outcome || 'PENDING',
      });
    } else {
      const defaultDate = new Date(Date.now() + 86400000 * 2);
      defaultDate.setMinutes(0);
      setFormData({
        jobApplicationId: initialApplication ? initialApplication.id : '',
        roundType: 'TECHNICAL',
        scheduledAt: defaultDate.toISOString().substring(0, 16),
        meetingLink: '',
        interviewer: '',
        notes: '',
        outcome: 'PENDING',
      });
    }
    setError('');
  }, [interview, initialApplication, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        jobApplicationId: Number(formData.jobApplicationId),
        scheduledAt: formData.scheduledAt ? `${formData.scheduledAt}:00` : '',
      };

      let saved;
      if (isEditing) {
        const res = await interviewsApi.update(interview.id, payload);
        saved = res.data;
      } else {
        const res = await interviewsApi.create(payload);
        saved = res.data;
      }

      onSaved(saved);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save interview round.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-purple-400" />
            {isEditing ? 'Edit Interview Round' : 'Schedule Interview Round'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Keep prep notes, meeting URLs, and round outcomes organized
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Application selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Job Application *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <select
                name="jobApplicationId"
                value={formData.jobApplicationId}
                onChange={handleChange}
                required
                disabled={isEditing || Boolean(initialApplication)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition disabled:opacity-70"
              >
                <option value="">Select an application...</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.companyName} — {app.jobTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Round Type & Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Round Type *
              </label>
              <select
                name="roundType"
                value={formData.roundType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
              >
                <option value="HR_SCREENING">HR / Recruiter Screen</option>
                <option value="TECHNICAL">Technical / Coding</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="BEHAVIORAL">Behavioral / Culture</option>
                <option value="MANAGERIAL">Managerial Round</option>
                <option value="FINAL">Final Executive Round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Round Outcome
              </label>
              <select
                name="outcome"
                value={formData.outcome}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
              >
                <option value="PENDING">Pending / Scheduled</option>
                <option value="PASSED">Passed 🎉</option>
                <option value="FAILED">Not Selected</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Scheduled Date &amp; Time *
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Meeting Link & Interviewer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Meeting URL
              </label>
              <div className="relative">
                <Video className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Interviewer(s)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  name="interviewer"
                  value={formData.interviewer}
                  onChange={handleChange}
                  placeholder="e.g. David Chen (Staff Eng)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Prep Notes &amp; Topics
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="System design focus, key questions prepared, algorithms to brush up..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Schedule Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
