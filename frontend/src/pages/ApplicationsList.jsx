import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsApi, notifyDataChanged } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  Search,
  Filter,
  Plus,
  Columns3,
  Table as TableIcon,
  Trash2,
  Edit2,
  CalendarCheck,
  FileText,
  MapPin,
  DollarSign,
  Download,
  Calendar,
  X,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const STAGES = [
  { id: 'APPLIED', title: 'Applied', color: 'border-blue-500/30 bg-blue-500/5', barColor: 'bg-blue-500' },
  { id: 'ASSESSMENT', title: 'Assessment', color: 'border-amber-500/30 bg-amber-500/5', barColor: 'bg-amber-500' },
  { id: 'INTERVIEW', title: 'Interview', color: 'border-purple-500/30 bg-purple-500/5', barColor: 'bg-purple-500' },
  { id: 'OFFER', title: 'Offer Received', color: 'border-emerald-500/30 bg-emerald-500/5', barColor: 'bg-emerald-500' },
  { id: 'REJECTED', title: 'Rejected', color: 'border-rose-500/30 bg-rose-500/5', barColor: 'bg-rose-500' },
];

export const ApplicationsList = ({
  defaultView = 'kanban',
  onOpenAddModal,
  onSelectApplication,
  onScheduleInterview,
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(defaultView);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL'); // ALL, 7D, 30D, 90D
  const [deadlineFilter, setDeadlineFilter] = useState('ALL'); // ALL, APPROACHING, HAS_DEADLINE, OVERDUE, NONE
  const [hasInterviewFilter, setHasInterviewFilter] = useState('ALL'); // ALL, YES, NO
  const [sortBy, setSortBy] = useState('DATE_DESC'); // DATE_DESC, DATE_ASC, COMPANY_ASC, SALARY_DESC, DEADLINE_ASC

  // Drag and Drop State
  const [draggedAppId, setDraggedAppId] = useState(null);

  // Sync viewMode if prop changes
  useEffect(() => {
    setViewMode(defaultView);
  }, [defaultView]);

  const fetchApplications = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (workTypeFilter) params.workType = workTypeFilter;

      const res = await applicationsApi.getAll(params);
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  // Live real-time listener for cross-component dynamic updates
  useEffect(() => {
    fetchApplications();

    const handleDataChange = () => {
      fetchApplications();
    };

    window.addEventListener('jobtracker-data-changed', handleDataChange);
    return () => {
      window.removeEventListener('jobtracker-data-changed', handleDataChange);
    };
  }, []);

  // Debounced search and filter query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications();
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, priorityFilter, workTypeFilter]);

  // Client-side additional filtering and sorting
  const filteredAndSortedApps = useMemo(() => {
    let result = [...applications];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 1. Date Range Filter
    if (dateRangeFilter !== 'ALL') {
      const days = dateRangeFilter === '7D' ? 7 : dateRangeFilter === '30D' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 86400000);
      result = result.filter((app) => {
        if (!app.dateApplied) return false;
        return new Date(app.dateApplied) >= cutoff;
      });
    }

    // 2. Deadline Filter
    if (deadlineFilter !== 'ALL') {
      result = result.filter((app) => {
        if (deadlineFilter === 'NONE') return !app.deadline;
        if (!app.deadline) return false;
        const d = new Date(app.deadline);
        d.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((d - now) / 86400000);

        if (deadlineFilter === 'APPROACHING') return diffDays >= 0 && diffDays <= 7;
        if (deadlineFilter === 'OVERDUE') return diffDays < 0;
        if (deadlineFilter === 'HAS_DEADLINE') return Boolean(app.deadline);
        return true;
      });
    }

    // 3. Has Interview Filter
    if (hasInterviewFilter !== 'ALL') {
      result = result.filter((app) => {
        const hasInterviews = app.interviews && app.interviews.length > 0;
        return hasInterviewFilter === 'YES' ? hasInterviews : !hasInterviews;
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        return new Date(b.dateApplied || 0) - new Date(a.dateApplied || 0);
      }
      if (sortBy === 'DATE_ASC') {
        return new Date(a.dateApplied || 0) - new Date(b.dateApplied || 0);
      }
      if (sortBy === 'COMPANY_ASC') {
        return (a.companyName || '').localeCompare(b.companyName || '');
      }
      if (sortBy === 'DEADLINE_ASC') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'SALARY_DESC') {
        const getSalaryNum = (str) => {
          if (!str) return 0;
          const match = str.match(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{2,6})/);
          return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
        };
        return getSalaryNum(b.salaryRange) - getSalaryNum(a.salaryRange);
      }
      return 0;
    });

    return result;
  }, [applications, dateRangeFilter, deadlineFilter, hasInterviewFilter, sortBy]);

  // Active filters count
  const activeFiltersCount = [
    searchTerm,
    statusFilter,
    priorityFilter,
    workTypeFilter,
    dateRangeFilter !== 'ALL' ? dateRangeFilter : null,
    deadlineFilter !== 'ALL' ? deadlineFilter : null,
    hasInterviewFilter !== 'ALL' ? hasInterviewFilter : null,
    sortBy !== 'DATE_DESC' ? sortBy : null,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setWorkTypeFilter('');
    setDateRangeFilter('ALL');
    setDeadlineFilter('ALL');
    setHasInterviewFilter('ALL');
    setSortBy('DATE_DESC');
  };

  // Instant optimistic stage update
  const handleStatusChange = async (appId, newStatus) => {
    // 1. Instant local state update
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    // 2. Persist in background
    try {
      await applicationsApi.updateStatus(appId, newStatus);
    } catch (err) {
      console.error('Failed to sync status update', err);
    }
  };

  // Quick move to next/prev stage
  const handleMoveStage = (app, direction) => {
    const stageOrder = ['APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'];
    const currentIndex = stageOrder.indexOf(app.status);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < stageOrder.length) {
      handleStatusChange(app.id, stageOrder[nextIndex]);
    }
  };

  const handleDelete = async (appId, companyName) => {
    if (!confirm(`Are you sure you want to delete application for ${companyName}?`)) return;
    setApplications((prev) => prev.filter((app) => app.id !== appId));
    try {
      await applicationsApi.delete(appId);
    } catch (err) {
      console.error('Failed to delete application', err);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', String(appId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const appId = Number(draggedAppId || e.dataTransfer.getData('text/plain'));
    if (appId) {
      handleStatusChange(appId, targetStatus);
    }
    setDraggedAppId(null);
  };

  // Export to CSV Functionality
  const handleExportCSV = () => {
    const list = filteredAndSortedApps.length > 0 ? filteredAndSortedApps : applications;
    if (list.length === 0) {
      alert('No applications to export.');
      return;
    }

    const headers = [
      'ID',
      'Company Name',
      'Job Title',
      'Status',
      'Priority',
      'Work Type',
      'Salary Range',
      'Date Applied',
      'Deadline',
      'Location',
      'Job URL',
      'Contact Person',
      'Contact Email',
      'Notes',
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map((a) => [
      a.id,
      escapeCsv(a.companyName),
      escapeCsv(a.jobTitle),
      escapeCsv(a.status),
      escapeCsv(a.priority),
      escapeCsv(a.workType),
      escapeCsv(a.salaryRange || ''),
      escapeCsv(a.dateApplied || ''),
      escapeCsv(a.deadline || ''),
      escapeCsv(a.location || ''),
      escapeCsv(a.jobUrl || ''),
      escapeCsv(a.contactName || ''),
      escapeCsv(a.contactEmail || ''),
      escapeCsv(a.notes || ''),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `job_applications_export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Job Applications</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700">
              {filteredAndSortedApps.length} opportunities
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic pipeline management across the full recruitment lifecycle.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* View toggle (Board vs Table) */}
          <div className="p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center">
            <button
              onClick={() => {
                setViewMode('kanban');
                navigate('/kanban');
              }}
              className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'kanban'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns3 className="w-4 h-4" />
              <span>Board</span>
            </button>
            <button
              onClick={() => {
                setViewMode('table');
                navigate('/applications');
              }}
              className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm group"
            title="Export filtered applications to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
            <span>Export CSV</span>
          </button>

          {/* Add Application Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        {/* Row 1: Search & Core Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search company, title, location, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Core Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer Received</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="">All Work Types</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">Onsite</option>
            </select>
          </div>
        </div>

        {/* Row 2: Secondary Filters (Date Range, Deadline Urgency, Sort, Clear) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Applied:</span>
            </div>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Time</option>
              <option value="7D">Past 7 Days</option>
              <option value="30D">Past 30 Days</option>
              <option value="90D">Past 90 Days</option>
            </select>

            <div className="flex items-center gap-1.5 text-slate-400 ml-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Deadlines:</span>
            </div>
            <select
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Deadlines</option>
              <option value="APPROACHING">Closing Soon (≤ 7 Days)</option>
              <option value="OVERDUE">Overdue Only</option>
              <option value="HAS_DEADLINE">Has Any Deadline</option>
              <option value="NONE">No Deadline</option>
            </select>

            <div className="flex items-center gap-1.5 text-slate-400 ml-1">
              <CalendarCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Interviews:</span>
            </div>
            <select
              value={hasInterviewFilter}
              onChange={(e) => setHasInterviewFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Applications</option>
              <option value="YES">Has Active Rounds</option>
              <option value="NO">No Rounds Scheduled</option>
            </select>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="DATE_DESC">Newest Applied</option>
                <option value="DATE_ASC">Oldest Applied</option>
                <option value="COMPANY_ASC">Company (A-Z)</option>
                <option value="SALARY_DESC">Highest Salary</option>
                <option value="DEADLINE_ASC">Closest Deadline</option>
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold border border-rose-500/30 flex items-center gap-1 transition"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View: Kanban or Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAndSortedApps.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
            {applications.length === 0 ? <Plus className="w-6 h-6 text-emerald-400" /> : <Search className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-white">
            {applications.length === 0 ? 'No applications tracked yet' : 'No applications match your filters'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {applications.length === 0
              ? 'Start tracking your career journey by adding your first job application.'
              : 'Try adjusting your search query, clearing active filters, or adding a new application.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
              >
                Clear All Filters
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow"
            >
              New Application
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageApps = filteredAndSortedApps.filter((app) => app.status === stage.id);
            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`p-3.5 rounded-2xl border ${stage.color} min-w-[270px] flex flex-col gap-3 min-h-[540px] transition-colors`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.barColor}`} />
                    <span className="font-bold text-white text-sm">{stage.title}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-700">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onClick={() => onSelectApplication(app)}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md hover:shadow-xl transition cursor-grab active:cursor-grabbing group space-y-3 relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition">
                              {app.companyName}
                            </h4>
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-500 hover:text-emerald-400"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium">{app.jobTitle}</p>
                        </div>
                        <PriorityBadge priority={app.priority} />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {app.location.split(',')[0]}
                          </span>
                        )}
                        {app.salaryRange && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <DollarSign className="w-3 h-3" />
                            {app.salaryRange}
                          </span>
                        )}
                      </div>

                      {/* Attachments / Interview counts */}
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                        {app.documents && app.documents.length > 0 && (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <FileText className="w-3 h-3" />
                            {app.documents.length} files
                          </span>
                        )}
                        {app.interviews && app.interviews.length > 0 && (
                          <span className="flex items-center gap-1 text-purple-400 font-medium">
                            <CalendarCheck className="w-3 h-3" />
                            {app.interviews.length} rounds
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-slate-500">
                          {app.dateApplied}
                        </span>
                      </div>

                      {/* Action Bar & Quick Stage Transition */}
                      <div
                        className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Quick arrow move buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveStage(app, 'prev')}
                            disabled={stage.id === 'APPLIED'}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            title="Move to previous stage"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveStage(app, 'next')}
                            disabled={stage.id === 'REJECTED'}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            title="Move to next stage"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Inline selector */}
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="ASSESSMENT">Assessment</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="OFFER">Offer</option>
                          <option value="REJECTED">Rejected</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onScheduleInterview(app)}
                            className="p-1 text-purple-400 hover:bg-purple-500/10 rounded"
                            title="Schedule Interview Round"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id, app.companyName)}
                            className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                            title="Delete Application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-slate-800/80 rounded-2xl text-slate-600 text-xs">
                      Drag cards here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Company &amp; Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Work Type</th>
                <th className="pb-3">Salary</th>
                <th className="pb-3">Date Applied</th>
                <th className="pb-3">Deadline</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAndSortedApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => onSelectApplication(app)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white group-hover:text-emerald-400 transition text-sm">
                        {app.companyName}
                      </p>
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-500 hover:text-emerald-400"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{app.jobTitle}</p>
                  </td>
                  <td className="py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="ASSESSMENT">Assessment</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFER">Offer</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="py-4">
                    <PriorityBadge priority={app.priority} />
                  </td>
                  <td className="py-4 text-slate-300 font-medium">{app.workType}</td>
                  <td className="py-4 text-emerald-400 font-medium">
                    {app.salaryRange || '—'}
                  </td>
                  <td className="py-4 text-slate-400">{app.dateApplied}</td>
                  <td className="py-4 text-slate-400">{app.deadline || '—'}</td>
                  <td className="py-4 pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onScheduleInterview(app)}
                        className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10 transition"
                        title="Schedule Interview Round"
                      >
                        <CalendarCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit Application"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id, app.companyName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
