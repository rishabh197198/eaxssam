import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { BookOpen, Bell, Shield, Key } from 'lucide-react';

const TeacherProfile = () => {
  const { user } = useUser();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Educator Settings</h1>
        <p className="text-slate-500 mt-1">Manage your department, API integrations, and AI preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <img 
              src={user?.imageUrl || "https://ui-avatars.com/api/?name=Teacher&background=random"} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-slate-50 mb-4"
            />
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName || "Educator"}</h2>
            <p className="text-sm text-slate-500">{user?.primaryEmailAddress?.emailAddress || "teacher@exam.ai"}</p>
            <span className="mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Admin / Creator
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* AI & Proctoring Default Tools */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-800 font-bold">
              <Shield size={18} className="text-blue-600"/>
              Default Exam Rules
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-900">Strict Tab-Switching Proctoring</h4>
                  <p className="text-xs text-slate-500">Auto-flag students who leave the exam window for more than 3 seconds.</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle toggle-primary" />
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-900">AI Plagiarism Check</h4>
                  <p className="text-xs text-slate-500">Automatically scan subjective answers against web sources.</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle toggle-primary" />
              </div>
            </div>
          </div>

          {/* Department & Subjects */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-800 font-bold">
              <BookOpen size={18} className="text-blue-600"/>
              Department Settings
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
                  <input type="text" defaultValue="Computer Science" className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Primary Subject</label>
                  <input type="text" defaultValue="Cybersecurity" className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;