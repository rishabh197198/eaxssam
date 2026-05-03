import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

// --- MOCK DATA (Fallback if Django API fails) ---
const mockSummaryStats = [
  { title: "Total Tests Created", value: "0", change: "", isPositive: true },
  { title: "Total Submissions", value: "0", change: "", isPositive: true },
  { title: "Average Score", value: "0%", change: "", isPositive: true },
  { title: "Flagged Sessions", value: "0", change: "All Clear", isPositive: true }, 
];

const mockRecentResults = [];

const ResultAnalytics = () => {
  const { user } = useUser(); // Get logged in teacher's ID
  
  const [filter, setFilter] = useState('all');
  
  // State for backend data
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [results, setResults] = useState([]);

  // Fetch data from Django
  useEffect(() => {
    // Don't fetch until Clerk has loaded the user
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        // Appended the teacher_id to the URL and disabled cache for live data!
        const response = await fetch(`http://127.0.0.1:8000/api/exams/analytics/?teacher_id=${user.id}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) throw new Error('API not ready');
        
        const data = await response.json();
        setStats(data.stats);
        setChartData(data.chartData || []);
        setResults(data.recentResults || []);
      } catch (error) {
        console.log("Using fallback mock data for analytics.");
        setStats(mockSummaryStats);
        setChartData([]);
        setResults(mockRecentResults);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // Filter the table data based on the dropdown
  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.status.toLowerCase() === filter.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin text-exam-secondary" />
        <span className="text-sm font-medium">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-exam-primary">Result Analytics</h1>
        <p className="text-slate-500 mt-1">Monitor student performance and AI proctoring flags.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-exam-border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-exam-primary">{stat.value}</span>
              <span className={`text-sm font-medium ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-exam-border shadow-sm">
          <h2 className="text-lg font-bold text-exam-primary mb-6">Average Scores by Test</h2>
          {chartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="testName" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-72 w-full flex items-center justify-center border-2 border-dashed border-exam-border rounded-xl">
                <span className="text-slate-400 font-medium">Not enough data to generate charts yet.</span>
             </div>
          )}
        </div>

        {/* Quick Actions / Insights */}
        <div className="bg-white p-6 rounded-xl border border-exam-border shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-exam-primary mb-4">AI Insights</h2>
          <div className="flex-1 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <h4 className="text-sm font-bold text-amber-800">System Monitoring Active</h4>
              <p className="text-xs text-amber-700 mt-1">The AI proctoring system is actively monitoring tab-switches and session interruptions.</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h4 className="text-sm font-bold text-blue-800">Awaiting Submissions</h4>
              <p className="text-xs text-blue-700 mt-1">Classroom performance insights will automatically generate here once students begin submitting their exams.</p>
            </div>
          </div>
          <button className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors">
            Generate Full Report
          </button>
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white rounded-xl border border-exam-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-exam-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-exam-primary">Recent Submissions</h2>
          <select 
            className="text-sm border-exam-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-exam-secondary focus:border-exam-secondary py-1.5 pl-3 pr-8 bg-white cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          {filteredResults.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Student Name</th>
                  <th className="p-4 font-medium">Test Name</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-exam-border">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-exam-primary">{result.student}</td>
                    <td className="p-4 text-slate-600">{result.test}</td>
                    <td className="p-4 font-medium text-exam-primary">{result.score}%</td>
                    <td className="p-4 text-slate-500">{result.date}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        result.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 
                        result.status === 'Failed' ? 'bg-rose-100 text-rose-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 font-medium">
              No recent submissions found.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ResultAnalytics;