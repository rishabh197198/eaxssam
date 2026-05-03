import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Users, Loader2, AlertCircle, ChevronRight, Hash } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const StudentClassrooms = ({ setActiveTab }) => {
  const { user } = useUser();
  const [joinCode, setJoinCode] = useState('');
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const fetchJoinedClasses = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/exams/classrooms/student/?student_id=${user.id}`);
      const data = await res.json();
      if (res.ok) setJoinedClasses(data.classrooms || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJoinedClasses(); }, [user]);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (joinCode.length !== 6) return;

    setIsJoining(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/exams/join-classroom/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          code: joinCode.toUpperCase().trim()
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setJoinCode('');
        setActiveTab('overview'); 
      } else {
        setError(data.error || "Invalid Class Code");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Enrolled Classrooms</h1>
        <p className="text-slate-500 mt-1 font-medium">Access your joined classes and their respective assessments.</p>
      </header>

      {/* HIGHLIGHTED JOIN SECTION */}
      <div className="bg-white p-1 md:p-1 rounded-[3rem] border border-slate-200 shadow-xl shadow-blue-900/5">
        <div className="bg-slate-50/50 p-8 md:p-12 rounded-[2.8rem] border border-white">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Hash size={20} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Join a New Class</h2>
            </div>
            
            <form onSubmit={handleJoinClass} className="flex flex-col md:flex-row gap-4 items-stretch group">
              <div className="relative flex-1">
                <input 
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ENTER 6-DIGIT CODE"
                  required
                  className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none font-mono text-2xl tracking-[0.3em] transition-all text-center placeholder:tracking-normal placeholder:text-slate-300 font-bold shadow-inner"
                />
              </div>
              <button 
                type="submit"
                disabled={isJoining || joinCode.length < 6}
                className="px-12 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
              >
                {isJoining ? <Loader2 className="animate-spin" size={22} /> : <Plus size={22} strokeWidth={3} />}
                Join Class
              </button>
            </form>

            {error && (
              <div className="mt-6 flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CLASSES GRID */}
      <div className="space-y-8">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          Joined Classrooms 
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black">{joinedClasses.length}</span>
        </h3>

        {joinedClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {joinedClasses.map((cls) => (
              <div 
                key={cls.id} 
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group flex flex-col relative overflow-hidden"
              >
                <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-3 group-hover:scale-110">
                  <BookOpen size={28} />
                </div>
                
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors tracking-tight">{cls.name}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em]">{cls.subject}</p>
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="w-full py-4 bg-slate-50 text-slate-900 font-bold rounded-2xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    View Assessments <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
            <BookOpen size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold text-lg">Your classroom list is empty.</p>
            <p className="text-slate-300 text-sm mt-1">Join a class above to see your assigned tests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassrooms;