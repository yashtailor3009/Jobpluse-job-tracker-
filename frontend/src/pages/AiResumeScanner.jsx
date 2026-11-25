import React, { useState } from 'react';
import {
  FileText, Target, CheckCircle2, XCircle,
  Download, Zap, Search, BarChart3, Lightbulb, Shield,
} from 'lucide-react';

const ALL_KEYWORDS = [
  'React','Vue','Angular','JavaScript','TypeScript','Python','Java',
  'Spring Boot','Spring','Node.js','Node','SQL','MySQL','PostgreSQL',
  'MongoDB','Docker','Kubernetes','K8s','CI/CD','Git','REST API','REST',
  'GraphQL','AWS','GCP','Azure','Microservices','Agile','Scrum','Kafka',
  'System Design','Machine Learning','ML','TensorFlow','Redis','Elasticsearch',
  'Next.js','Tailwind','HTML','CSS','Linux','Terraform','Ansible',
  'data structures','algorithms','OOP','SOLID','DevOps','Spark','Hadoop',
];

const ACTION_VERBS = [
  'built','developed','led','architected','designed','implemented',
  'optimized','launched','scaled','reduced','improved','delivered',
  'managed','created','automated','migrated','integrated','deployed',
  'mentored','collaborated','engineered','established','spearheaded',
  'increased','decreased','achieved','resolved','streamlined','enhanced',
];

const ATS_TIPS = [
  { icon: '📝', tip: 'Use standard section headers: Experience, Education, Skills, Projects' },
  { icon: '🚫', tip: 'Avoid tables, columns, text boxes, or graphics — ATS cannot parse them' },
  { icon: '🎯', tip: 'Use exact keywords from the job description (case-insensitive match)' },
  { icon: '📄', tip: 'Submit as .docx or plain text PDF — avoid fancy PDF designs' },
  { icon: '📧', tip: 'Put contact info in body text, not in headers/footers' },
  { icon: '📏', tip: 'Ideal length: 1 page for <5 years experience, 2 pages for senior roles' },
  { icon: '🔢', tip: 'Quantify achievements: "Reduced latency by 40%", "Led team of 8 engineers"' },
];

function analyzeResume(resumeText, jobDescription) {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  const jdKeywords = ALL_KEYWORDS.filter(kw => jdLower.includes(kw.toLowerCase()));
  const matchedKeywords = jdKeywords.filter(kw => resumeLower.includes(kw.toLowerCase()));
  const missingKeywords = jdKeywords.filter(kw => !resumeLower.includes(kw.toLowerCase()));

  const keywordScore = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 100 : 50;

  const hasActionVerbs = ACTION_VERBS.some(v => resumeLower.includes(v));
  const actionVerbsFound = ACTION_VERBS.filter(v => resumeLower.includes(v));
  const hasQuantifiedImpact = /\d+%|\$\d+|\d+ (users|engineers|teams|projects|systems|services)|\d+x/i.test(resumeText);
  const hasEmail = /@/.test(resumeText);
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;
  const goodLength = wordCount >= 200 && wordCount <= 900;

  const auditScore = [hasActionVerbs, hasQuantifiedImpact, hasEmail, goodLength].filter(Boolean).length / 4 * 100;
  const matchScore = Math.round(keywordScore * 0.6 + auditScore * 0.4);

  const suggestions = [];
  if (missingKeywords.length > 0) suggestions.push('Add these in-demand keywords: ' + missingKeywords.slice(0, 3).join(', '));
  if (!hasQuantifiedImpact) suggestions.push('Add quantified achievements, e.g. "Reduced API latency by 35%" or "Scaled service to 1M users"');
  if (!hasActionVerbs) suggestions.push('Start bullet points with strong action verbs: Built, Architected, Optimized, Led, Deployed');
  if (!goodLength) suggestions.push(wordCount < 200 ? 'Resume is too short — expand your experience descriptions' : 'Resume may be too long — condense to 2 pages max');
  if (matchedKeywords.length < 3) suggestions.push('Mirror the job description language more closely — use the same tech stack terms');
  suggestions.push('Tailor your Summary section to specifically mention the role and company');

  return { matchScore, matchedKeywords, missingKeywords, actionVerbsFound, hasActionVerbs, hasQuantifiedImpact, hasEmail, goodLength, wordCount, suggestions: suggestions.slice(0, 5), jdKeywordsTotal: jdKeywords.length };
}

function ScoreGauge({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';
  const label = score >= 75 ? 'Excellent Match' : score >= 50 ? 'Good Match' : 'Needs Improvement';
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="70" y="68" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">{score}</text>
        <text x="70" y="88" textAnchor="middle" fill="#94a3b8" fontSize="11">/ 100</text>
      </svg>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
      <span className="text-xs text-slate-500">ATS Compatibility Score</span>
    </div>
  );
}

const AuditRow = ({ label, pass, detail }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50">
    {pass ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
    <div>
      <p className={`text-xs font-semibold ${pass ? 'text-emerald-300' : 'text-rose-300'}`}>{label}</p>
      {detail && <p className="text-[11px] text-slate-400 mt-0.5">{detail}</p>}
    </div>
  </div>
);

export const AiResumeScanner = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setResults(analyzeResume(resumeText, jobDescription)); setAnalyzing(false); }, 900);
  };

  const handleExport = () => {
    if (!results) return;
    const lines = [
      '=== JobPulse PRO — ATS Resume Scan Report ===',
      `ATS Match Score: ${results.matchScore}/100`,
      '',
      `Matched Keywords (${results.matchedKeywords.length}): ${results.matchedKeywords.join(', ')}`,
      `Missing Keywords (${results.missingKeywords.length}): ${results.missingKeywords.join(', ')}`,
      '',
      '--- Resume Quality Audit ---',
      `Action Verbs: ${results.hasActionVerbs ? 'PASS' : 'FAIL'} (${results.actionVerbsFound.join(', ')})`,
      `Quantified Impact: ${results.hasQuantifiedImpact ? 'PASS' : 'FAIL'}`,
      `Contact Info: ${results.hasEmail ? 'PASS' : 'FAIL'}`,
      `Length (${results.wordCount} words): ${results.goodLength ? 'PASS' : 'FAIL'}`,
      '',
      '--- AI Suggestions ---',
      ...results.suggestions.map((s, i) => `${i + 1}. ${s}`),
      '',
      '--- ATS Tips ---',
      ...ATS_TIPS.map(t => `• ${t.tip}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ats_scan_report.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </span>
            AI Resume ATS Scanner
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">AI</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Get an instant ATS score, keyword gaps, and actionable suggestions to land more interviews.</p>
        </div>
        {results && (
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition">
            <Download className="w-4 h-4" /> Export Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Your Resume Text
          </label>
          <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
            placeholder={`Paste the full text of your resume here...\n\nJohn Smith | john@email.com\nSenior Software Engineer with 5+ years...\n\nEXPERIENCE\n• Built scalable microservices using Java and Spring Boot\n• Reduced latency by 35% through Redis caching\n• Deployed to AWS using Docker and Kubernetes`}
            rows={12} className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 placeholder-slate-600 p-3 focus:outline-none focus:border-emerald-500 resize-none transition" />
          <p className="text-[11px] text-slate-500 mt-1.5">{resumeText.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" /> Target Job Description
          </label>
          <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
            placeholder={`Paste the full job description here...\n\nSenior Full Stack Engineer @ Stripe\nWe're looking for an engineer who:\n• Has 4+ years with React, TypeScript, and Node.js\n• Experience with PostgreSQL, Redis, Docker\n• Familiar with CI/CD pipelines and AWS\n• REST APIs and Microservices architecture`}
            rows={12} className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 placeholder-slate-600 p-3 focus:outline-none focus:border-blue-500 resize-none transition" />
          <p className="text-[11px] text-slate-500 mt-1.5">{jobDescription.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleAnalyze} disabled={!resumeText.trim() || !jobDescription.trim() || analyzing}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          {analyzing ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>) : (<><Zap className="w-4 h-4" /> Analyze Resume</>)}
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="flex justify-center"><ScoreGauge score={results.matchScore} /></div>
            <div className="col-span-2 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-emerald-500/20 text-center">
                <p className="text-2xl font-extrabold text-emerald-400">{results.matchedKeywords.length}</p>
                <p className="text-xs text-slate-400 mt-1">Matched Keywords</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-rose-500/20 text-center">
                <p className="text-2xl font-extrabold text-rose-400">{results.missingKeywords.length}</p>
                <p className="text-xs text-slate-400 mt-1">Missing Keywords</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-blue-500/20 text-center">
                <p className="text-2xl font-extrabold text-blue-400">{results.wordCount}</p>
                <p className="text-xs text-slate-400 mt-1">Resume Words</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Matched Keywords
                <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">{results.matchedKeywords.length}</span>
              </h3>
              {results.matchedKeywords.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No matching keywords found — add relevant tech skills to your resume.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.matchedKeywords.map(kw => (
                    <span key={kw} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">✓ {kw}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" /> Missing Keywords
                <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold">{results.missingKeywords.length}</span>
              </h3>
              {results.missingKeywords.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">🎉 Your resume contains all identified keywords!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.missingKeywords.map(kw => (
                    <span key={kw} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">✗ {kw}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" /> Resume Quality Audit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AuditRow label="Strong Action Verbs" pass={results.hasActionVerbs}
                detail={results.hasActionVerbs ? `Found: ${results.actionVerbsFound.slice(0, 4).join(', ')}...` : 'Add verbs like: Built, Architected, Optimized, Led, Deployed'} />
              <AuditRow label="Quantified Achievements" pass={results.hasQuantifiedImpact}
                detail={results.hasQuantifiedImpact ? 'Numbers & metrics detected' : 'Add: "Reduced latency by 35%", "Scaled to 2M users"'} />
              <AuditRow label="Contact Information" pass={results.hasEmail}
                detail={results.hasEmail ? 'Email address detected' : 'Include your email, phone, LinkedIn URL'} />
              <AuditRow label={`Resume Length (${results.wordCount} words)`} pass={results.goodLength}
                detail={results.goodLength ? 'Optimal length for ATS systems' : results.wordCount < 200 ? 'Too brief — add more detail' : 'Consider condensing to under 900 words'} />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> AI Recommendations
            </h3>
            <div className="space-y-2.5">
              {results.suggestions.map((sug, i) => (
                <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{sug}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" /> ATS Formatting Best Practices
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ATS_TIPS.map((tip, i) => (
                <div key={i} className="flex gap-2.5 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <span className="text-base">{tip.icon}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!results && !analyzing && (
        <div className="text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">Paste Your Resume & Job Description Above</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Our AI will analyze keyword compatibility, resume quality, and give specific recommendations to increase your interview chances.</p>
        </div>
      )}
    </div>
  );
};
