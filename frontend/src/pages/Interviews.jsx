import React, { useState, useEffect } from 'react';
import { interviewsApi } from '../api/client';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import {
  CalendarCheck,
  Plus,
  Video,
  User,
  Clock,
  Building,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Download,
} from 'lucide-react';

const OUTCOME_STYLES = {
  PENDING: { label: 'Pending', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  PASSED: { label: 'Passed 🎉', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  FAILED: { label: 'Not Selected', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export const Interviews = ({ onOpenInterviewModal, onEditInterview }) => {
  const [interviews, setInterviews] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UPCOMING', 'PAST'
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const res = await interviewsApi.getAll();
      setInterviews(res.data);
    } catch (err) {
      console.error('Failed to load interviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();

    const handleDataChange = () => {
      fetchInterviews();
    };

    window.addEventListener('jobtracker-data-changed', handleDataChange);
    return () => window.removeEventListener('jobtracker-data-changed', handleDataChange);
  }, []);

  const handleDelete = async (id, companyName) => {
    if (!confirm(`Are you sure you want to delete this interview round for ${companyName}?`)) return;
    try {
      await interviewsApi.delete(id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert('Failed to delete interview round');
    }
  };

  const now = new Date();
  const filteredInterviews = interviews.filter((i) => {
    const itemDate = new Date(i.scheduledAt);
    if (filter === 'UPCOMING') return itemDate >= now;
    if (filter === 'PAST') return itemDate < now;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Interview Schedule
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Keep track of technical assessments, system design rounds, and hiring manager chats.
          </p>
        </div>

        <button
          onClick={() => onOpenInterviewModal(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Round</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['ALL', 'UPCOMING', 'PAST'].map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === mode
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {mode === 'ALL' ? 'All Rounds' : mode === 'UPCOMING' ? 'Upcoming' : 'Past Rounds'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No interviews found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You don't have any interviews matching this filter. Schedule a new round to track your
            progress.
          </p>
          <button
            onClick={() => onOpenInterviewModal(null)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow"
          >
            Schedule Interview
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterviews.map((item) => {
            const outcomeConfig = OUTCOME_STYLES[item.outcome] || OUTCOME_STYLES.PENDING;
            const interviewDate = new Date(item.scheduledAt);
            const isFuture = interviewDate >= now;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{item.companyName}</h3>
                      <p className="text-xs text-slate-400 font-medium">{item.jobTitle}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${outcomeConfig.bg}`}
                    >
                      {outcomeConfig.label}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-purple-300 font-semibold">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[11px]">
                        {item.roundType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {interviewDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {interviewDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isFuture && (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {item.interviewer && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.interviewer}</span>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-slate-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40 mt-2">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.meetingLink && (
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    )}

                    {/* Google Calendar Link */}
                    <a
                      href={generateGoogleCalendarUrl({
                        title: `${item.companyName} - ${item.roundType.replace('_', ' ')} Interview`,
                        scheduledAt: item.scheduledAt,
                        details: `Interview for ${item.jobTitle} at ${item.companyName}.\nInterviewer: ${item.interviewer || 'N/A'}\nMeeting: ${item.meetingLink || 'N/A'}\nNotes: ${item.notes || ''}`,
                        location: item.meetingLink || 'Online',
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700/60"
                      title="Add to Google Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Google Cal</span>
                    </a>

                    {/* iCal / Outlook .ics download */}
                    <button
                      onClick={() =>
                        downloadIcsFile({
                          title: `${item.companyName} - ${item.roundType.replace('_', ' ')} Interview`,
                          scheduledAt: item.scheduledAt,
                          details: `Interview for ${item.jobTitle} at ${item.companyName}.\nInterviewer: ${item.interviewer || 'N/A'}\nMeeting: ${item.meetingLink || 'N/A'}\nNotes: ${item.notes || ''}`,
                          location: item.meetingLink || 'Online',
                          companyName: item.companyName,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700/60"
                      title="Download .ics for Apple / Outlook Calendar"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>.ics</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditInterview(item)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Edit Round"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.companyName)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete Round"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
