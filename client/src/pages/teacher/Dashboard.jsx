import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const TeacherDashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOverview = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/exams/analytics/?teacher_id=${user.id}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data.stats);
          setRecentExams(data.recentExams || []); // We'll update the backend to include this
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [user]);

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-exam-secondary" size={32} />
    </div>
  );

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-exam-primary">Teacher Overview</h1>
        <p className="text-slate-500 mt-1">Live updates from your classrooms and active assessments.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-exam-border p-6 rounded-3xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
            <h2 className="text-2xl font-bold mt-1 text-exam-primary">{stat.value}</h2>
            <p className={`text-xs font-bold mt-2 ${stat.isPositive ? 'text-green-500' : 'text-amber-500'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Exams Feed */}
      <div className="bg-white border border-exam-border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-exam-border flex justify-between items-center">
          <h3 className="font-bold text-lg text-exam-primary">Active Assessments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Test Title</th>
                <th className="px-8 py-4">Classroom</th>
                <th className="px-8 py-4">Submissions</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-exam-border">
              {recentExams.length > 0 ? recentExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-semibold text-exam-primary">{exam.title}</td>
                  <td className="px-8 py-5 text-slate-500 text-sm">{exam.classroom_name}</td>
                  <td className="px-8 py-5 font-medium text-slate-700">{exam.submission_count}</td>
                  <td className="px-8 py-5 text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400 italic">No active tests found. Publish a test to see it here.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;