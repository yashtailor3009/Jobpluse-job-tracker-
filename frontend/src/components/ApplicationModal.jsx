import React, { useState, useEffect } from 'react';
import { applicationsApi, documentsApi } from '../api/client';
import {
  X,
  Building,
  Briefcase,
  Globe,
  MapPin,
  DollarSign,
  Calendar,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Trash2,
  Clock,
  User,
  Mail,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export const ApplicationModal = ({
  isOpen,
  onClose,
  application = null,
  onSaved,
  onScheduleInterview,
}) => {
  const isEditing = Boolean(application && application.id);

  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobUrl: '',
    location: '',
    workType: 'REMOTE',
    salaryRange: '',
    dateApplied: new Date().toISOString().split('T')[0],
    deadline: '',
    status: 'APPLIED',
    priority: 'MEDIUM',
    notes: '',
    contactName: '',
    contactEmail: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('RESUME');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({
        companyName: application.companyName || '',
        jobTitle: application.jobTitle || '',
        jobUrl: application.jobUrl || '',
        location: application.location || '',
        workType: application.workType || 'REMOTE',
        salaryRange: application.salaryRange || '',
        dateApplied: application.dateApplied || new Date().toISOString().split('T')[0],
        deadline: application.deadline || '',
        status: application.status || 'APPLIED',
        priority: application.priority || 'MEDIUM',
        notes: application.notes || '',
        contactName: application.contactName || '',
        contactEmail: application.contactEmail || '',
      });
      setDocuments(application.documents || []);
    } else {
      setFormData({
        companyName: '',
        jobTitle: '',
        jobUrl: '',
        location: '',
        workType: 'REMOTE',
        salaryRange: '',
        dateApplied: new Date().toISOString().split('T')[0],
        deadline: '',
        status: 'APPLIED',
        priority: 'MEDIUM',
        notes: '',
        contactName: '',
        contactEmail: '',
      });
      setDocuments([]);
    }
    setError('');
    setSelectedFile(null);
  }, [application, isOpen]);

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
        deadline: formData.deadline ? formData.deadline : null,
      };

      let savedApp;
      if (isEditing) {
        const res = await applicationsApi.update(application.id, payload);
        savedApp = res.data;
      } else {
        const res = await applicationsApi.create(payload);
        savedApp = res.data;
      }

      onSaved(savedApp);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save application. Please verify the input values.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !application?.id) return;

    setUploadingDoc(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('docType', docType);

      const res = await applicationsApi.uploadDocument(application.id, uploadData);
      setDocuments((prev) => [...prev, res.data]);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to upload file: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentsApi.delete(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-400" />
            {isEditing ? 'Edit Job Application' : 'New Job Application'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isEditing
              ? `Manage details, stages, and files for ${application.companyName}`
              : 'Track a new opportunity in your career pipeline'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company Name *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Stripe, Google"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Title *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="url"
                  name="jobUrl"
                  value={formData.jobUrl}
                  onChange={handleChange}
                  placeholder="https://company.com/jobs/123"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco / Remote"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Work Type & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Type</label>
              <select
                name="workType"
                value={formData.workType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Salary / Compensation
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  placeholder="e.g. $160,000 - $185,000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Application Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="APPLIED">Applied</option>
                <option value="ASSESSMENT">Assessment / Take-Home</option>
                <option value="INTERVIEW">Interview Round</option>
                <option value="OFFER">Offer Received 🎉</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date Applied *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="date"
                  name="dateApplied"
                  value={formData.dateApplied}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Application Deadline
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Recruiter / Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact Person / Recruiter
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="jane.doe@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes & Research</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Key notes, interview questions asked, referral info, technology stack..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Application'}
            </button>
          </div>
        </form>

        {/* If creating new, show helpful tip */}
        {!isEditing && (
          <div className="mt-6 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center gap-3 text-xs text-cyan-300">
            <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              💡 <strong>Resume &amp; Cover Letter:</strong> Once saved, you can attach versioned Resumes, tailored Cover Letters, and Portfolios directly to this application.
            </span>
          </div>
        )}

        {/* If editing, show File Attachments & Interview section */}
        {isEditing && (
          <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
            {/* Document Attachments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Resume &amp; Cover Letter Attachments
                </h3>
              </div>

              {/* Upload form */}
              <form onSubmit={handleFileUpload} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center gap-3 mb-4">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="RESUME">Resume</option>
                  <option value="COVER_LETTER">Cover Letter</option>
                  <option value="PORTFOLIO">Portfolio</option>
                  <option value="OTHER">Other</option>
                </select>

                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
                />

                <button
                  type="submit"
                  disabled={!selectedFile || uploadingDoc}
                  className="ml-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingDoc ? 'Uploading...' : 'Upload File'}
                </button>
              </form>

              {/* Document List */}
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No files attached yet.</p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 text-[10px]">
                          {doc.docType.replace('_', ' ')}
                        </span>
                        <div>
                          <p className="font-medium text-slate-200">{doc.originalFileName}</p>
                          <p className="text-[10px] text-slate-500">
                            {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => documentsApi.download(doc.id, doc.originalFileName)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Interview Schedule Link */}
            {onScheduleInterview && (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-purple-300">Schedule Interview Round</h4>
                  <p className="text-[11px] text-purple-400/80 mt-0.5">
                    Plan technical screens, system designs, or hiring manager rounds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onScheduleInterview(application);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
                >
                  Schedule Round +
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
