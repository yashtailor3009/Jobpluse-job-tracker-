import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { emailSyncApi } from '../api/client';
import {
  Mail,
  MailCheck,
  Sparkles,
  Video,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Send,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export const EmailSyncHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const syncAddress = `${(user?.email || 'myaccount').split('@')[0]}-sync@jobpulse.app`;
  const [copied, setCopied] = useState(false);

  // Form states
  const [sender, setSender] = useState('recruiting@stripe.com');
  const [subject, setSubject] = useState('Invitation: Technical Interview - Stripe x Candidate');
  const [body, setBody] = useState(
    `Hi there,\n\nWe were really impressed with your application for the Backend Platform Engineer position at Stripe!\n\nWe would love to invite you for a 45-minute technical system design screen.\n\nDate: Thursday, Nov 20, 2026 at 2:00 PM EST\nMeeting Link: https://meet.google.com/xyz-abcd-efg\nInterviewer: David Chen (Staff Engineer)\n\nPlease confirm if this time works for you.\n\nBest regards,\nStripe Talent Acquisition`
  );
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const presets = [
    {
      name: 'Google Meet Technical Screen',
      badge: 'INTERVIEW',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      sender: 'recruiting@stripe.com',
      subject: 'Invitation: Technical Interview - Stripe x Candidate',
      body: `Hi there,\n\nWe were really impressed with your application for the Backend Platform Engineer position at Stripe!\n\nWe would love to invite you for a 45-minute technical system design screen.\n\nDate: Thursday, Nov 20, 2026 at 2:00 PM EST\nMeeting Link: https://meet.google.com/xyz-abcd-efg\nInterviewer: David Chen (Staff Engineer)\n\nPlease confirm if this time works for you.\n\nBest regards,\nStripe Talent Acquisition`,
    },
    {
      name: 'Datadog Job Offer ($185k)',
      badge: 'OFFER',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      sender: 'offers@datadoghq.com',
      subject: 'Congratulations! Job Offer: Software Engineer at Datadog',
      body: `Dear Candidate,\n\nOn behalf of Datadog, we are absolutely thrilled to extend you a formal offer of employment for the role of Software Engineer - Core Observability!\n\nCompensation details:\n- Base Annual Salary: $185,000 USD\n- Sign-on Bonus: $20,000 USD\n- Equity Grant: $80,000 over 4 years\n\nPlease review the attached offer letter and reply with your signed acceptance by next Monday.\n\nWarmest regards,\nDatadog People Team`,
    },
    {
      name: 'Amazon OA Deadline (48 Hours)',
      badge: 'ASSESSMENT',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      sender: 'assessment-team@amazon.com',
      subject: 'Action Required: Amazon SDE II Online Assessment',
      body: `Hello,\n\nThank you for your interest in Software Development Engineer II at Amazon.\n\nYour next step is to complete our 90-minute online coding assessment on HackerRank.\nYou have 48 hours to complete this test before the deadline.\n\nTest URL: https://www.hackerrank.com/tests/amz-sde2-9843\nDeadline: Within 2 days of receiving this email.\n\nBest of luck,\nAmazon Student & Professional Recruiting`,
    },
    {
      name: 'Figma Application Confirmation',
      badge: 'APPLIED',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      sender: 'careers@figma.com',
      subject: 'Application Received: Frontend Systems Architect at Figma',
      body: `Hi Candidate,\n\nThank you for applying for the Frontend Systems Architect role at Figma! We have safely received your resume and application.\n\nOur engineering hiring team reviews applications on a rolling basis. We will be in touch if your profile matches what we are seeking.\n\nBest,\nThe Figma Team`,
    },
  ];

  const handleCopySyncAddress = () => {
    navigator.clipboard.writeText(syncAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (preset) => {
    setSender(preset.sender);
    setSubject(preset.subject);
    setBody(preset.body);
    setSyncResult(null);
    setSyncError(null);
  };

  const handleProcessEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSyncError(null);
    try {
      const res = await emailSyncApi.processEmail({
        sender,
        subject,
        body,
        receivedAt: new Date().toISOString(),
      });
      setSyncResult(res.data);
    } catch (err) {
      console.error('Email ingestion error:', err);
      setSyncError(err.response?.data?.message || 'Failed to process email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-500/20 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Zero-Manual-Entry Automation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Automated Email Sync & Recruiter Ingestion
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Never manually log an interview link, offer letter, or test deadline again. JobPulse extracts Google Meet / Zoom links, detects salary compensation, updates your Kanban pipeline, and schedules interview rounds automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => navigate('/kanban')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>View Pipeline</span>
            </button>
            <button
              onClick={() => navigate('/interviews')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Interviews Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Inbound Address & How It Works */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forwarding Inbound Address Card */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Mail className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Ingestion
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Your Forwarding Inbox</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Forward recruiter emails or set up an auto-forward filter in Gmail/Outlook.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-purple-300 truncate selection:bg-purple-500/30">
                {syncAddress}
              </span>
              <button
                onClick={handleCopySyncAddress}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                title="Copy Address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {copied && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Address copied to clipboard!
              </p>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
              <span>Open Gmail Settings &gt; Filters and Blocked Addresses.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
              <span>Create filter for subjects matching: <em>interview, meet, offer, hackerrank</em>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
              <span>Auto-forward to your JobPulse sync address.</span>
            </div>
          </div>
        </div>

        {/* Chrome Extension Card */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                1-Click Web Clipper
              </span>
            </div>

            <h3 className="text-base font-bold text-white">Apply Anywhere & Auto-Save (Chrome Extension)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When applying on <strong>LinkedIn, Indeed, Naukri, Greenhouse, or Lever</strong>, the JobPulse Extension automatically injects a floating <span className="text-emerald-400 font-semibold">✨ Save to JobPulse</span> button on the page. Clicking it grabs the Job Title, Company, Location, Salary, and Job URL and transmits it directly into your tracker with zero manual typing!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs font-semibold text-white">LinkedIn</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Auto-Detect</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs font-semibold text-white">Indeed</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Auto-Detect</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs font-semibold text-white">Greenhouse / Lever</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Auto-Detect</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-xs font-semibold text-white">Naukri & More</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Auto-Detect</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-slate-300">
                Extension ready in workspace folder: <code className="text-purple-300 bg-slate-800 px-1.5 py-0.5 rounded">extension/</code>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Manifest V3</span>
          </div>
        </div>
      </div>

      {/* Recruiter Email Simulator & Parser */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Interactive Recruiter Email Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Test how JobPulse intelligently ingests live recruiter emails, discovers meeting links, and updates application stages in real-time.
            </p>
          </div>

          {/* Presets buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Try Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${p.badgeColor} hover:brightness-125`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Email Input Form */}
        <form onSubmit={handleProcessEmail} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sender Email (Recruiter / ATS)
              </label>
              <input
                type="email"
                required
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Invitation: Technical Screen with Stripe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Content / Body
            </label>
            <textarea
              rows={6}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste recruiter email body here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              ⚡ Automatically extracts: <code className="text-purple-300">Google Meet</code>, <code className="text-purple-300">Zoom</code>, <code className="text-purple-300">MS Teams</code>, <code className="text-emerald-300">Salary Offers</code> & <code className="text-amber-300">Deadlines</code>
            </span>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Parsing Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Process & Sync Email</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error notification */}
        {syncError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{syncError}</span>
          </div>
        )}

        {/* Live Ingestion Result Card */}
        {syncResult && (
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 p-6 space-y-5 animate-fade-in shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Email Ingested Successfully!</span>
                  </h4>
                  <p className="text-xs text-slate-400">{syncResult.details}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                Action: {syncResult.actionTaken}
              </span>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Company</p>
                <p className="text-sm font-bold text-white mt-1">{syncResult.companyName || 'Not Detected'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Detected Stage</p>
                <p className="text-sm font-bold text-purple-400 mt-1">{syncResult.detectedStage || 'APPLIED'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Interview Status</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  {syncResult.interviewBooked ? 'Calendar Event Booked' : 'None Required'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Detected Salary</p>
                <p className="text-sm font-bold text-amber-300 mt-1">{syncResult.detectedSalary || 'N/A'}</p>
              </div>
            </div>

            {/* Meeting Link Banner (if extracted) */}
            {syncResult.meetingLink && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 flex-shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-200">Interview Meeting Link Detected</p>
                    <p className="text-xs font-mono text-purple-300 truncate max-w-md mt-0.5">
                      {syncResult.meetingLink}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={syncResult.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                  >
                    <span>Join Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Pipeline Navigation Link */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => navigate('/kanban')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>View on Pipeline Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {syncResult.interviewBooked && (
                <button
                  onClick={() => navigate('/interviews')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>View in Interviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
