import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Loader2, TrendingUp, Award, Target, Activity } from 'lucide-react';

const StudentPerformance = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    stats: [],
    history: []
  });

  useEffect(() => {
    if (!user) return;

    const fetchPerformance = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/exams/student-results/?student_id=${user.id}`, {
          cache: 'no-store'
        });
        const result = await res.json();
        if (res.ok) {
          setData({
            stats: result.stats || [],
            history: result.history || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch performance data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin text-exam-secondary" />
        <span className="text-sm font-medium">Analyzing your progress...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-exam-primary">Performance Analytics</h1>
        <p className="text-slate-500 mt-1">Track your scores and academic growth across all classrooms.</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-exam-border shadow-sm flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-exam-secondary rounded-2xl">
              {idx === 0 ? <Award size={24} /> : idx === 1 ? <Target size={24} /> : <Activity size={24} />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-exam-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-exam-border shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp size={20} className="text-exam-secondary" />
            <h2 className="text-lg font-bold text-exam-primary">Score Progression</h2>
          </div>
          
          <div className="h-72 w-full">
            {data.history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                Take more tests to see your trend.
              </div>
            )}
          </div>
        </div>

        {/* Recent Submissions List */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-exam-border shadow-sm">
          <h2 className="text-lg font-bold text-exam-primary mb-6">Recent Results</h2>
          <div className="space-y-4">
            {data.history.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-exam-border hover:border-exam-secondary transition-colors group">
                <div>
                  <h4 className="font-bold text-exam-primary group-hover:text-exam-secondary transition-colors">{item.testName}</h4>
                  <p className="text-xs text-slate-400 font-medium">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-exam-primary">{item.score}%</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${item.score >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.score >= 50 ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
            ))}
            {data.history.length === 0 && (
              <p className="text-center text-slate-400 py-10">No records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;