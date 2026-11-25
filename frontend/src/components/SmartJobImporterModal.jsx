import React, { useState } from 'react';
import {
  X, Sparkles, Building, Briefcase, MapPin, DollarSign,
  Calendar, Globe, Check, AlertCircle, ArrowRight, Tag,
} from 'lucide-react';
import { applicationsApi, notifyDataChanged } from '../api/client';

const TECH_SKILLS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Node', 'TypeScript', 'JavaScript',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'Spring', 'Go', 'Golang',
  'C++', 'C#', '.NET', 'Rust', 'Ruby', 'Rails', 'PHP', 'Laravel',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'K8s', 'Terraform', 'CI/CD',
  'GraphQL', 'REST API', 'Microservices', 'Kafka', 'RabbitMQ', 'System Design',
  'Machine Learning', 'AI', 'Tailwind', 'Git',
];

export function parseJobText(rawText) {
  const text = rawText || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Detect Company
  let companyName = '';
  const companyPatterns = [
    /(?:company|organization|employer|about)\s*:\s*([A-Za-z0-9&.\s]{2,30})/i,
    /(?:at|joining|team at|career at)\s+([A-Z][A-Za-z0-9&.\s]{1,25})/i,
    /([A-Z][A-Za-z0-9&.]{1,20})\s+is\s+(?:hiring|looking for|seeking)/i,
    /([A-Z][A-Za-z0-9&.\s]{1,25})\s*[-–|]\s*(?:Careers|Job|Opening)/i,
  ];
  for (const pat of companyPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      companyName = match[1].trim().replace(/[.,;]$/, '');
      break;
    }
  }
  if (!companyName && lines.length > 0) {
    // If first line contains "at [Company]"
    const line0 = lines[0];
    const atMatch = line0.match(/at\s+([A-Z][A-Za-z0-9&.\s]{1,25})/i);
    if (atMatch) companyName = atMatch[1].trim();
  }

  // 2. Detect Job Title
  let jobTitle = '';
  const titleKeywords = [
    'Software Engineer', 'Senior Software Engineer', 'Staff Software Engineer',
    'Lead Software Engineer', 'Principal Engineer', 'Frontend Engineer',
    'Backend Engineer', 'Full Stack Engineer', 'Full Stack Developer',
    'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect',
    'Engineering Manager', 'Product Manager', 'Data Scientist',
    'Data Engineer', 'Machine Learning Engineer', 'Mobile Developer',
    'iOS Developer', 'Android Developer', 'QA Engineer', 'Solutions Architect',
  ];
  for (const tk of titleKeywords) {
    if (new RegExp(`\\b${tk}\\b`, 'i').test(text)) {
      jobTitle = tk;
      break;
    }
  }
  if (!jobTitle && lines.length > 0) {
    // Fallback: take first clean line if short
    if (lines[0].length < 60 && !lines[0].startsWith('http')) {
      jobTitle = lines[0].replace(/[-–|].*$/, '').trim();
    }
  }

  // 3. Detect Salary
  let salaryRange = '';
  const salaryRegex = /(?:\$|USD\s*)\s*(\d{2,3}(?:,\d{3})*|\d{2,3}k)(?:\s*(?:-|to)\s*(?:\$|USD\s*)?\s*(\d{2,3}(?:,\d{3})*|\d{2,3}k))?(?:\s*(?:\/|\s*per\s*)(?:yr|year|month|hr|hour))?/i;
  const salaryMatch = text.match(salaryRegex);
  if (salaryMatch) {
    salaryRange = salaryMatch[0].trim();
  }

  // 4. Detect Location & Work Type
  let location = '';
  let workType = 'REMOTE';
  if (/remote|work from home|wfh|anywhere/i.test(text)) {
    workType = 'REMOTE';
    location = 'Remote';
  } else if (/hybrid/i.test(text)) {
    workType = 'HYBRID';
  } else if (/on-site|onsite|in-office/i.test(text)) {
    workType = 'ONSITE';
  }

  const locMatch = text.match(/(?:location|based in|office in)\s*:\s*([A-Za-z\s,.-]{2,40})/i);
  if (locMatch) {
    location = locMatch[1].trim().replace(/[.,;]$/, '');
  } else if (!location) {
    const popularCities = ['San Francisco', 'New York', 'Seattle', 'Austin', 'Boston', 'London', 'Berlin', 'Toronto', 'Bengaluru', 'Bangalore', 'Singapore', 'Chicago'];
    for (const city of popularCities) {
      if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
        location = city;
        break;
      }
    }
  }

  // 5. Detect Skills
  const textLower = text.toLowerCase();
  const detectedSkills = TECH_SKILLS.filter((skill) =>
    textLower.includes(skill.toLowerCase())
  );

  // 6. Detect URL
  const urlMatch = text.match(/https?:\/\/[^\s)]+/i);
  const jobUrl = urlMatch ? urlMatch[0] : '';

  return {
    companyName: companyName || 'Target Company',
    jobTitle: jobTitle || 'Software Engineer',
    salaryRange: salaryRange || '',
    location: location || (workType === 'REMOTE' ? 'Remote' : 'United States'),
    workType,
    jobUrl,
    skills: detectedSkills.slice(0, 8),
    notes: `Imported via Smart AI Job Importer.\nKey requirements detected: ${detectedSkills.slice(0, 6).join(', ')}`,
  };
}

export const SmartJobImporterModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [status, setStatus] = useState('APPLIED');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!rawText.trim()) return;
    setParsing(true);
    setError('');
    setTimeout(() => {
      try {
        const result = parseJobText(rawText);
        setParsedData(result);
      } catch (err) {
        setError('Failed to parse text. Please review and edit manually.');
      } finally {
        setParsing(false);
      }
    }, 400);
  };

  const handleSave = async () => {
    if (!parsedData) return;
    setSaving(true);
    setError('');

    const newApp = {
      companyName: parsedData.companyName.trim() || 'Company',
      jobTitle: parsedData.jobTitle.trim() || 'Software Engineer',
      jobUrl: parsedData.jobUrl || '',
      location: parsedData.location || 'Remote',
      workType: parsedData.workType || 'REMOTE',
      salaryRange: parsedData.salaryRange || '',
      dateApplied: new Date().toISOString().split('T')[0],
      deadline: '',
      status: status || 'APPLIED',
      priority: priority || 'MEDIUM',
      notes: parsedData.notes || '',
      contactName: '',
      contactEmail: '',
    };

    try {
      await applicationsApi.create(newApp);
      notifyDataChanged();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setParsedData(null);
        setRawText('');
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to save imported application:', err);
      setError(err?.response?.data?.message || 'Failed to save application');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Smart 1-Click Job Importer</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold border border-purple-500/30">
                  AI Heuristic
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Paste raw job text from LinkedIn, Indeed, or email to extract details instantly.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Application saved successfully! Redirecting...</span>
          </div>
        )}

        {/* Raw Text Input */}
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-bold text-slate-300">
            Paste Job Posting Text (LinkedIn, Indeed, Email, etc.)
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste raw job description here... Example:
Senior Frontend Engineer at Stripe
Location: Remote (US)
Salary: $150,000 - $190,000 / yr
Looking for 4+ years of React, TypeScript, GraphQL, and modern web performance..."
            rows={parsedData ? 4 : 8}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition resize-none font-mono"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {rawText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={handleParse}
              disabled={!rawText.trim() || parsing}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 transition disabled:opacity-40"
            >
              {parsing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{parsedData ? 'Re-Parse Text' : 'Auto-Extract Fields'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parsed Fields Preview */}
        {parsedData && (
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Parsed Application Preview (Editable)
              </h3>
              <span className="text-[11px] text-slate-400">Review & tweak before saving</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> Company Name
                </label>
                <input
                  type="text"
                  value={parsedData.companyName}
                  onChange={(e) =>
                    setParsedData({ ...parsedData, companyName: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Job Title
                </label>
                <input
                  type="text"
                  value={parsedData.jobTitle}
                  onChange={(e) =>
                    setParsedData({ ...parsedData, jobTitle: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Salary / Compensation
                </label>
                <input
                  type="text"
                  value={parsedData.salaryRange}
                  placeholder="e.g. $140,000 - $180,000"
                  onChange={(e) =>
                    setParsedData({ ...parsedData, salaryRange: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location
                </label>
                <input
                  type="text"
                  value={parsedData.location}
                  placeholder="e.g. Remote, San Francisco, CA"
                  onChange={(e) =>
                    setParsedData({ ...parsedData, location: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Work Type</label>
                <select
                  value={parsedData.workType}
                  onChange={(e) =>
                    setParsedData({ ...parsedData, workType: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">On-Site</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="ASSESSMENT">Assessment</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Detected Skills Tags */}
            {parsedData.skills && parsedData.skills.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-400" /> Detected Skills
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {parsedData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !parsedData.companyName.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition disabled:opacity-40"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Add to Pipeline Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
