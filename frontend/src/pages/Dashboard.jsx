import React, { useState, useEffect } from 'react';
import { applicationsApi, analyticsApi, interviewsApi, remindersApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  Briefcase,
  Users,
  Trophy,
  XCircle,
  TrendingUp,
  Clock,
  CalendarCheck,
  Plus,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = ({ onOpenAddModal, onSelectApplication, onScheduleInterview }) => {
  const [summary, setSummary] = useState(null);
  const [allApps, setAllApps] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [sumRes, appsRes, intRes, deadRes] = await Promise.all([
        analyticsApi.getSummary(),
        applicationsApi.getAll(),
        interviewsApi.getUpcoming(),
        remindersApi.getDeadlines(),
      ]);

      const appsList = appsRes.data || [];
      setSummary(sumRes.data);
      setAllApps(appsList);
      setRecentApps(appsList.slice(0, 5));
      setUpcomingInterviews(intRes.data.slice(0, 4));
      setDeadlines(deadRes.data.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleDataChange = () => {
      loadDashboardData();
    };

    window.addEventListener('jobtracker-data-changed', handleDataChange);
    return () => window.removeEventListener('jobtracker-data-changed', handleDataChange);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const urgentDeadlines = deadlines.filter((d) => d.urgency === 'OVERDUE' || d.urgency === 'TODAY' || d.urgency === 'URGENT');

  const stageCounts = {
    APPLIED: allApps.filter((a) => a.status === 'APPLIED').length,
    ASSESSMENT: allApps.filter((a) => a.status === 'ASSESSMENT').length,
    INTERVIEW: allApps.filter((a) => a.status === 'INTERVIEW').length,
    OFFER: allApps.filter((a) => a.status === 'OFFER').length,
    REJECTED: allApps.filter((a) => a.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Career Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your pipeline velocity, interview schedules, and conversion metrics.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Urgent Deadlines Banner */}
      {urgentDeadlines.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                Action Required: {urgentDeadlines.length} Upcoming Application Deadlines
              </h4>
              <p className="text-xs text-amber-400/80 mt-0.5">
                {urgentDeadlines[0].companyName} ({urgentDeadlines[0].jobTitle}) is due{' '}
                {urgentDeadlines[0].urgency === 'TODAY'
                  ? 'today'
                  : urgentDeadlines[0].urgency === 'OVERDUE'
                  ? 'and overdue!'
                  : `in ${urgentDeadlines[0].daysRemaining} days`}
              </p>
            </div>
          </div>
          <Link
            to="/deadlines"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition whitespace-nowrap"
          >
            Review Deadlines →
          </Link>
        </div>
      )}

      {/* Welcome Banner for New Users (0 Applications) */}
      {(!summary || summary.totalApplications === 0) && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-cyan-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Welcome to your Career Dashboard! 🚀</h3>
            <p className="text-xs text-slate-400">
              Your tracker is ready with zero clutter. Add your first job application to track your pipeline from Applied to Offer.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition whitespace-nowrap"
          >
            + Add First Application
          </button>
        </div>
      )}

      {/* Visual Pipeline Progression (Applied → Assessment → Interview → Offer / Rejected) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-bold text-white text-base">
              Application Pipeline Stages
            </h3>
            <span className="text-xs text-slate-500 hidden md:inline">
              (Applied → Assessment → Interview → Offer / Rejected)
            </span>
          </div>
          <Link
            to="/kanban"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>Open Pipeline Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/kanban"
            className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition group"
          >
            <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-1">
              <span>1. Applied</span>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-white group-hover:text-blue-300 transition">
              {stageCounts.APPLIED}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Initial submission</p>
          </Link>

          <Link
            to="/kanban"
            className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition group"
          >
            <div className="flex items-center justify-between text-amber-400 text-xs font-semibold mb-1">
              <span>2. Assessment</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-white group-hover:text-amber-300 transition">
              {stageCounts.ASSESSMENT}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Take-home / OA</p>
          </Link>

          <Link
            to="/kanban"
            className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition group"
          >
            <div className="flex items-center justify-between text-purple-400 text-xs font-semibold mb-1">
              <span>3. Interview</span>
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <p className="text-2xl font-extrabold text-white group-hover:text-purple-300 transition">
              {stageCounts.INTERVIEW}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active interview rounds</p>
          </Link>

          <Link
            to="/kanban"
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition group"
          >
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
              <span>4. Offer Received</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 group-hover:text-emerald-300 transition">
              {stageCounts.OFFER}
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">Offers won 🎉</p>
          </Link>

          <Link
            to="/kanban"
            className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-rose-400 text-xs font-semibold mb-1">
              <span>5. Rejected</span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </div>
            <p className="text-2xl font-extrabold text-white group-hover:text-rose-300 transition">
              {stageCounts.REJECTED}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Archived / closed</p>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Applied</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{summary?.totalApplications || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all companies</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Interviews</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{summary?.activeInterviews || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-purple-400 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{summary?.interviewRate || 0}% rate</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Offers Won</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{summary?.offersCount || 0}</p>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">
            {summary?.offerRate || 0}% offer rate
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Rejections</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">{summary?.rejectedCount || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">{summary?.rejectionRate || 0}% rejection</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Deadlines</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">
            {summary?.upcomingDeadlinesCount || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Pending action</p>
        </div>
      </div>

      {/* Grid: Upcoming Interviews & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Interviews */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">Next Interview Rounds</h3>
            </div>
            <Link
              to="/interviews"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingInterviews.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No interviews scheduled yet. Click an application to book a round.
              </p>
            ) : (
              upcomingInterviews.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{item.companyName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300">
                        {item.roundType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{item.jobTitle}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(item.scheduledAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {item.meetingLink ? (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No link</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">Application Deadlines</h3>
            </div>
            <Link
              to="/deadlines"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {deadlines.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No approaching deadlines found.
              </p>
            ) : (
              deadlines.map((item) => (
                <div
                  key={item.applicationId}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white text-sm">{item.companyName}</p>
                    <p className="text-xs text-slate-400">{item.jobTitle}</p>
                    <p className="text-[11px] text-slate-500">Deadline: {item.deadline}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.urgency === 'OVERDUE'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.urgency === 'TODAY'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.urgency === 'OVERDUE'
                      ? 'Overdue'
                      : item.urgency === 'TODAY'
                      ? 'Due Today'
                      : `${item.daysRemaining} days left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-base">Recent Applications</h3>
          <Link
            to="/applications"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>Full pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Company &amp; Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Work Type</th>
                <th className="pb-3">Applied Date</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentApps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500 text-xs">
                    No applications added yet. Click{' '}
                    <button
                      onClick={onOpenAddModal}
                      className="text-emerald-400 font-semibold underline hover:text-emerald-300"
                    >
                      New Application
                    </button>{' '}
                    to track your first opportunity!
                  </td>
                </tr>
              ) : (
                recentApps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => onSelectApplication(app)}
                >
                  <td className="py-3.5 pl-2">
                    <p className="font-semibold text-white group-hover:text-emerald-400 transition">
                      {app.companyName}
                    </p>
                    <p className="text-slate-400 text-[11px]">{app.jobTitle}</p>
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-3.5">
                    <PriorityBadge priority={app.priority} />
                  </td>
                  <td className="py-3.5 text-slate-300 font-medium">
                    {app.workType}
                  </td>
                  <td className="py-3.5 text-slate-400">{app.dateApplied}</td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApplication(app);
                      }}
                      className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/80 transition"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
