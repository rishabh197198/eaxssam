import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Clock, BookOpen, Loader2, Award } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const StudentDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      try {
        // Fetch Tests
        const testRes = await fetch(`http://127.0.0.1:8000/api/exams/student-tests/?student_id=${user.id}`);
        const testData = await testRes.json();
        
        // Fetch Stats
        const classRes = await fetch(`http://127.0.0.1:8000/api/exams/classrooms/student/?student_id=${user.id}`);
        const classData = await classRes.json();

        if (testRes.ok) setTests(testData.tests || []);
        if (classRes.ok) setStats({
          enrolled: classData.classrooms?.length || 0,
          completed: testData.tests?.filter(t => t.status === 'completed').length || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (isLoading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.firstName}. Here is your academic standing.</p>
      </header>

      {/* TOP STATS BARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-6">
           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><BookOpen /></div>
           <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Classes</p><h2 className="text-2xl font-bold">{stats.enrolled}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-6">
           <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Award /></div>
           <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed Tests</p><h2 className="text-2xl font-bold">{stats.completed}</h2></div>
        </div>
      </div>

      {/* ASSIGNED TESTS TABLE */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-xl text-slate-900">Pending Assessments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">
              <tr>
                <th className="px-8 py-5">Test Title</th>
                <th className="px-8 py-5">Classroom</th>
                <th className="px-8 py-5">Time Limit</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.filter(t => t.status === 'available').map((test) => (
                <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-900">{test.title}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm">{test.category}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm font-medium">{test.duration}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => navigate(`/take-test/${test.id}`)}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-black transition-all text-xs"
                    >
                      Attempt Now
                    </button>
                  </td>
                </tr>
              ))}
              {tests.filter(t => t.status === 'available').length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-400 italic">No pending tests. Join a class to see assignments.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;