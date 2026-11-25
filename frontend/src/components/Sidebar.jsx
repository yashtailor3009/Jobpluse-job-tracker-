import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Columns3,
  CalendarCheck,
  BarChart3,
  Clock,
  PlusCircle,
  Target,
  Brain,
  Sparkles,
  MailCheck,
} from 'lucide-react';

export const Sidebar = ({ onOpenAddModal, onOpenSmartImport, isOpen, onCloseMobile }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Applications', icon: Briefcase },
    { to: '/kanban', label: 'Pipeline Board', icon: Columns3 },
    { to: '/interviews', label: 'Interviews', icon: CalendarCheck },
    { to: '/analytics', label: 'Career Analytics', icon: BarChart3 },
    { to: '/deadlines', label: 'Deadlines', icon: Clock },
    { to: '/email-sync', label: 'Email Sync & Feeds', icon: MailCheck, isNew: true },
    { to: '/resume-scanner', label: 'AI Resume Scanner', icon: Target, isAi: true },
    { to: '/interview-copilot', label: 'Interview Copilot', icon: Brain, isAi: true },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 md:top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onOpenAddModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Application</span>
            </button>

            {onOpenSmartImport && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onOpenSmartImport();
                }}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Smart 1-Click Import</span>
              </button>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? item.isAi
                          ? 'bg-purple-500/15 text-purple-300 font-semibold shadow-sm border border-purple-500/30'
                          : 'bg-slate-800 text-emerald-400 font-semibold shadow-sm border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.isAi && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      AI
                    </span>
                  )}
                  {item.isNew && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      NEW
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom card: Pro tip */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-xs">
          <p className="font-semibold text-slate-300">💡 Pro Tip</p>
          <p className="text-slate-400 mt-1 leading-relaxed">
            Attach tailored resumes & cover letters to track which version converts best.
          </p>
        </div>
      </aside>
    </>
  );
};
