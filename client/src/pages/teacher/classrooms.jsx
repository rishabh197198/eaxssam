import React, { useState, useEffect } from 'react';
import { Plus, Users, Copy, BookOpen, MoreVertical, CheckCircle2, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const TeacherClassrooms = () => {
  const { user } = useUser(); // Get the logged-in teacher's Clerk ID
  
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', subject: '' });
  const [copiedCode, setCopiedCode] = useState(null);

  // 1. Fetch Classrooms from the Django Database on load
  const fetchClassrooms = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/exams/classrooms/?teacher_id=${user.id}`);
      const data = await res.json();
      if (res.ok) {
        // Sort so the newest classes appear at the top
        const sortedClasses = (data.classrooms || []).sort((a, b) => b.id - a.id);
        setClasses(sortedClasses);
      }
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [user]);

  // 2. Save New Classroom to the Django Database
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.name || !user) return;
    
    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/exams/classrooms/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: user.id,
          name: newClass.name,
          subject: newClass.subject || 'General'
        }),
      });
      
      if (res.ok) {
        // If successful, re-fetch from the database to grab the generated code
        await fetchClassrooms();
        setNewClass({ name: '', subject: '' });
        setIsCreating(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create classroom');
      }
    } catch (err) {
      console.error("Error creating classroom:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); // Reset icon after 2 seconds
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin text-exam-secondary" />
        <span className="text-sm font-medium">Loading classrooms...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-exam-primary">Manage Classrooms</h1>
          <p className="text-slate-500 mt-1">Create classes, generate invite codes, and manage your students.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-exam-primary text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg"
        >
          <Plus size={20} /> Create New Class
        </button>
      </header>

      {/* Creation Modal/Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-3xl border border-exam-border shadow-sm mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-exam-primary mb-4">Create a New Classroom</h2>
          <form onSubmit={handleCreateClass} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Class Name</label>
              <input 
                type="text" 
                required
                value={newClass.name}
                onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                placeholder="e.g. Data Structures Section A" 
                className="w-full p-3 bg-slate-50 border border-exam-border rounded-xl focus:border-exam-secondary outline-none transition-all"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject (Optional)</label>
              <input 
                type="text" 
                value={newClass.subject}
                onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                placeholder="e.g. Computer Science" 
                className="w-full p-3 bg-slate-50 border border-exam-border rounded-xl focus:border-exam-secondary outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 font-bold text-slate-500 hover:text-exam-primary transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-3 bg-exam-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Generating...' : 'Generate Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classrooms Grid */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-[2rem] border border-exam-border p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-exam-secondary rounded-2xl">
                  <BookOpen size={24} />
                </div>
                <button className="text-slate-300 hover:text-exam-primary transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-exam-primary mb-1">{cls.name}</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">{cls.subject}</p>
              
              <div className="mt-auto space-y-4">
                {/* Class Code Section */}
                <div className="p-4 bg-slate-50 rounded-xl border border-exam-border flex items-center justify-between group/code">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Class Invite Code</p>
                    <p className="font-mono font-bold text-lg text-exam-primary tracking-wider">{cls.code}</p>
                  </div>
                  <button 
                    onClick={() => handleCopyCode(cls.code)}
                    className={`p-2 rounded-lg transition-colors ${copiedCode === cls.code ? 'bg-green-100 text-green-600' : 'bg-white border border-exam-border text-slate-400 hover:text-exam-secondary hover:border-exam-secondary'}`}
                    title="Copy Code"
                  >
                    {copiedCode === cls.code ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium pt-2 border-t border-exam-border">
                  <Users size={16} />
                  <span>{cls.students || 0} Students Enrolled</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center bg-white border border-dashed border-exam-border rounded-[3rem]">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <BookOpen size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium text-lg">You haven't created any classrooms yet.</p>
          <p className="text-slate-400 text-sm mt-1">Create one to get your secure invite code.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherClassrooms;