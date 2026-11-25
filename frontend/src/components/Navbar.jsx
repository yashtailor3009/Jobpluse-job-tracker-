import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { remindersApi } from '../api/client';
import { Briefcase, Bell, LogOut, User, Calendar, ExternalLink, Menu, X, Sparkles, MailCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar, onOpenSmartImport }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deadlines, setDeadlines] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const res = await remindersApi.getDeadlines();
        setDeadlines(res.data || []);
      } catch (err) {
        console.error('Failed to load deadline reminders', err);
      }
    };
    fetchDeadlines();

    window.addEventListener('jobtracker-data-changed', fetchDeadlines);
    return () => window.removeEventListener('jobtracker-data-changed', fetchDeadlines);
  }, []);

  const urgentCount = deadlines.filter((d) => d.urgency === 'OVERDUE' || d.urgency === 'TODAY' || d.urgency === 'URGENT').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              JobPulse
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
              PRO
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Email Sync Hub Shortcut */}
        <Link
          to="/email-sync"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold transition shadow-sm"
          title="Email Sync & Automated Recruiter Ingestion"
        >
          <MailCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Email Sync</span>
        </Link>

        {/* Smart 1-Click Job Importer */}
        {onOpenSmartImport && (
          <button
            onClick={onOpenSmartImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition shadow-sm"
            title="Import Job from LinkedIn/Indeed/Text"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Smart Import</span>
          </button>
        )}

        {/* Deadlines Notification Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Application Deadlines"
          >
            <Bell className="w-5 h-5" />
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {urgentCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-700 bg-slate-850 p-4 shadow-2xl z-50 bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Upcoming Deadlines</span>
                </div>
                <span className="text-xs text-slate-400">{deadlines.length} total</span>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {deadlines.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No upcoming deadlines.</p>
                ) : (
                  deadlines.slice(0, 5).map((d) => (
                    <div
                      key={d.applicationId}
                      className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{d.companyName}</p>
                        <p className="text-slate-400 text-[11px]">{d.jobTitle}</p>
                        <p className="text-slate-500 text-[10px] mt-1">Due: {d.deadline}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.urgency === 'OVERDUE'
                            ? 'bg-rose-500/20 text-rose-400'
                            : d.urgency === 'TODAY'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {d.urgency === 'OVERDUE'
                          ? 'Overdue'
                          : d.urgency === 'TODAY'
                          ? 'Today'
                          : `${d.daysRemaining}d left`}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                <Link
                  to="/deadlines"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  View all deadline alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User profile and logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-200">{user?.fullName || 'User'}</span>
            <span className="text-xs text-slate-500">{user?.email}</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow">
            {user?.fullName ? user.fullName.charAt(0) : 'U'}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
