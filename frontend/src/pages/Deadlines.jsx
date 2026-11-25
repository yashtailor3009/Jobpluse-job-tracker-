import React, { useState, useEffect } from 'react';
import { remindersApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Building,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const Deadlines = ({ onSelectApplicationId }) => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = async () => {
    try {
      const res = await remindersApi.getDeadlines();
      setDeadlines(res.data);
    } catch (err) {
      console.error('Failed to load deadline reminders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();

    const handleDataChange = () => {
      fetchDeadlines();
    };

    window.addEventListener('jobtracker-data-changed', handleDataChange);
    return () => window.removeEventListener('jobtracker-data-changed', handleDataChange);
  }, []);

  const overdue = deadlines.filter((d) => d.urgency === 'OVERDUE');
  const today = deadlines.filter((d) => d.urgency === 'TODAY');
  const urgent = deadlines.filter((d) => d.urgency === 'URGENT');
  const upcoming = deadlines.filter((d) => d.urgency === 'UPCOMING');

  const renderSection = (title, items, badgeColor, iconColor) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${iconColor}`} />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {title} ({items.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.applicationId}
              onClick={() => onSelectApplicationId(item.applicationId)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer shadow-sm space-y-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white group-hover:text-emerald-400 transition text-base">
                    {item.companyName}
                  </h3>
                  <p className="text-xs text-slate-400">{item.jobTitle}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}
                >
                  {item.urgency === 'OVERDUE'
                    ? `${Math.abs(item.daysRemaining)}d overdue`
                    : item.urgency === 'TODAY'
                    ? 'Due Today'
                    : `${item.daysRemaining} days left`}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Due {item.deadline}
                </span>

                <StatusBadge status={item.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Application Deadlines &amp; Reminders
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Stay on top of upcoming closing dates, assessment submissions, and offer deadlines.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : deadlines.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">All caught up!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You don't have any pending deadlines or overdue applications right now.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderSection(
            'Overdue Deadlines',
            overdue,
            'bg-rose-500/20 text-rose-300 border-rose-500/30',
            'text-rose-400'
          )}
          {renderSection(
            'Due Today',
            today,
            'bg-amber-500/20 text-amber-300 border-amber-500/30',
            'text-amber-400'
          )}
          {renderSection(
            'Closing Soon (Next 3 Days)',
            urgent,
            'bg-amber-500/15 text-amber-300 border-amber-500/20',
            'text-amber-400'
          )}
          {renderSection(
            'Upcoming Deadlines',
            upcoming,
            'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
            'text-emerald-400'
          )}
        </div>
      )}
    </div>
  );
};
