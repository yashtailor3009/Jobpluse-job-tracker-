import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/client';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  XCircle,
  Briefcase,
  PieChart as PieIcon,
  Calendar,
  Building,
  Target,
  DollarSign,
  Coins,
  BadgeDollarSign,
  Sparkles,
} from 'lucide-react';

const STATUS_COLORS = {
  APPLIED: '#3b82f6',     // Blue
  ASSESSMENT: '#f59e0b',  // Amber
  INTERVIEW: '#a855f7',   // Purple
  OFFER: '#10b981',       // Emerald
  REJECTED: '#f43f5e',    // Rose
};

export const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [sumRes, monthRes, statRes, compRes, salRes] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getMonthly(),
        analyticsApi.getStatusDistribution(),
        analyticsApi.getTopCompanies(),
        analyticsApi.getSalaries(),
      ]);

      setSummary(sumRes.data);
      setMonthlyData(monthRes.data);
      setStatusData(statRes.data);
      setCompanyData(compRes.data);
      setSalaryData(salRes.data || []);
    } catch (err) {
      console.error('Failed to load career analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Live reactive listener
    const handleDataChange = () => {
      fetchAnalytics();
    };
    window.addEventListener('jobtracker-data-changed', handleDataChange);
    return () => {
      window.removeEventListener('jobtracker-data-changed', handleDataChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Format status data for pie chart
  const pieChartData = statusData
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.status.replace('_', ' '),
      value: item.count,
      color: STATUS_COLORS[item.status] || '#64748b',
    }));

  // Salary Compensation by Work Type
  const workTypeSalaryMap = {};
  salaryData.forEach((s) => {
    const wt = s.workType || 'REMOTE';
    if (!workTypeSalaryMap[wt]) {
      workTypeSalaryMap[wt] = { count: 0, sum: 0 };
    }
    workTypeSalaryMap[wt].count += 1;
    workTypeSalaryMap[wt].sum += s.avgSalary;
  });

  const salaryByWorkType = Object.keys(workTypeSalaryMap).map((wt) => ({
    workType: wt,
    averageSalary: Math.round(workTypeSalaryMap[wt].sum / workTypeSalaryMap[wt].count),
    count: workTypeSalaryMap[wt].count,
  }));

  // Salary Stats
  const maxSalaryItem = salaryData.length > 0 ? salaryData.reduce((prev, curr) => (curr.maxSalary > prev.maxSalary ? curr : prev), salaryData[0]) : null;
  const maxTrackedSalary = maxSalaryItem ? maxSalaryItem.maxSalary : 0;
  const avgPipelineSalary =
    salaryData.length > 0
      ? Math.round(salaryData.reduce((acc, curr) => acc + curr.avgSalary, 0) / salaryData.length)
      : 0;
  const offerItem = salaryData.find((s) => s.status === 'OFFER');

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span>Career Analytics &amp; Conversion Funnel</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            Real-Time
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Data-driven insights on your job search performance, conversion velocity, and salary compensation.
        </p>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interview Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Interview Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{summary?.interviewRate || 0}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Applications converting to interview
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(summary?.interviewRate || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Offer Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Offer Rate</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{summary?.offerRate || 0}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary?.offersCount || 0} offers received so far
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(summary?.offerRate || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Rejection Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Rejection Rate</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{summary?.rejectionRate || 0}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary?.rejectedCount || 0} of {summary?.totalApplications || 0} apps
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(summary?.rejectionRate || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Volume */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Applications</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{summary?.totalApplications || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary?.activeInterviews || 0} in active rounds
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Visual Conversion Funnel */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Application Conversion Funnel</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-blue-500/30 text-center">
            <p className="text-xs uppercase font-bold text-blue-400 tracking-wider">1. Applied</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {summary?.totalApplications || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">100% Top of Funnel</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/30 text-center">
            <p className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              2. Assessment
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {statusData.find((s) => s.status === 'ASSESSMENT')?.count || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary?.totalApplications
                ? Math.round(
                    ((statusData.find((s) => s.status === 'ASSESSMENT')?.count || 0) /
                      summary.totalApplications) *
                      100
                  )
                : 0}
              % Conversion
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-purple-500/30 text-center">
            <p className="text-xs uppercase font-bold text-purple-400 tracking-wider">
              3. Interview
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {(summary?.activeInterviews || 0) + (summary?.offersCount || 0)}
            </p>
            <p className="text-[11px] text-purple-400 font-semibold mt-1">
              {summary?.interviewRate || 0}% Conversion
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-emerald-500/30 text-center">
            <p className="text-xs uppercase font-bold text-emerald-400 tracking-wider">4. Offer</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {summary?.offersCount || 0}
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
              {summary?.offerRate || 0}% Final Win Rate
            </p>
          </div>
        </div>
      </div>

      {/* NEW: Salary Compensation Analytics Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Salary Compensation Analysis</h3>
              <p className="text-xs text-slate-400">
                Comparative compensation ranges and market value across your opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Tracked Opportunities:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-bold text-xs border border-slate-700">
              {salaryData.length} roles
            </span>
          </div>
        </div>

        {/* Salary Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <p className="text-xs font-semibold text-slate-400">Top Offer Received</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {offerItem ? `$${offerItem.avgSalary.toLocaleString()}` : '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {offerItem ? `${offerItem.companyName} (${offerItem.jobTitle})` : 'No offers recorded yet'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <p className="text-xs font-semibold text-slate-400">Average Pipeline Salary</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {avgPipelineSalary > 0 ? `$${avgPipelineSalary.toLocaleString()}` : '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {salaryData.length > 0 ? 'Across tracked salary ranges' : 'No salary data tracked'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <p className="text-xs font-semibold text-slate-400">Highest Salary Tracked</p>
            <p className="text-2xl font-extrabold text-cyan-400 mt-1">
              {maxTrackedSalary > 0 ? `$${maxTrackedSalary.toLocaleString()}` : '—'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {maxSalaryItem ? `${maxSalaryItem.companyName} (${maxSalaryItem.jobTitle})` : 'No salary data tracked'}
            </p>
          </div>
        </div>

        {/* Salary Graphs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Chart 1: Company Salary Comparison (Min vs Max vs Average) */}
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              Compensation by Company &amp; Role ($ USD)
            </h4>
            <div className="h-72 w-full">
              {salaryData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                  No salary data provided yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salaryData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="companyName"
                      stroke="#64748b"
                      fontSize={11}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="minSalary" name="Min Salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgSalary" name="Avg Package" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maxSalary" name="Max Salary" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Average Salary by Work Type (Remote vs Hybrid vs Onsite) */}
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              Average Compensation by Work Type
            </h4>
            <div className="h-72 w-full">
              {salaryByWorkType.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                  No work type salary comparison available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salaryByWorkType}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="workType" stroke="#64748b" fontSize={11} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Average Salary']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar
                      dataKey="averageSalary"
                      name="Average Compensation"
                      fill="#06b6d4"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts: Applications per Month & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications per Month Area Chart */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Applications per Month</h3>
            </div>
            <span className="text-xs text-slate-500">Monthly Volume</span>
          </div>

          <div className="h-64 w-full">
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No monthly data to display yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Applications"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Status Breakdown</h3>
            </div>
            <span className="text-xs text-slate-500">By Stage</span>
          </div>

          <div className="h-64 w-full">
            {pieChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No active stages to display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => <span className="text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Companies Horizontal Bar Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Top Target Companies</h3>
          </div>
          <span className="text-xs text-slate-500">Applications count</span>
        </div>

        <div className="h-64 w-full">
          {companyData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              No company data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={companyData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="companyName"
                  stroke="#64748b"
                  fontSize={11}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Applications"
                  fill="#3b82f6"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
