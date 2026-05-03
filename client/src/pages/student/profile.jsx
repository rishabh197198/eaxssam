import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { User, Bell, Monitor, Shield } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useUser();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account and exam preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: ID & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <img 
              src={user?.imageUrl || "https://ui-avatars.com/api/?name=Student&background=random"} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-slate-50 mb-4"
            />
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName || "Student User"}</h2>
            <p className="text-sm text-slate-500">{user?.primaryEmailAddress?.emailAddress || "student@exam.ai"}</p>
            <span className="mt-3 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Enrolled Student
            </span>
          </div>
        </div>

        {/* Right Column: Tools & Settings */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Exam Preferences (The "Tools") */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-800 font-bold">
              <Monitor size={18} className="text-blue-600"/>
              Exam Environment Tools
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-900">High Contrast Mode</h4>
                  <p className="text-xs text-slate-500">Increases text readability during exams.</p>
                </div>
                <input type="checkbox" className="toggle toggle-primary" />
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-900">Hide Exam Timer</h4>
                  <p className="text-xs text-slate-500">Only show timer warnings at 5 and 1 minute marks to reduce anxiety.</p>
                </div>
                <input type="checkbox" className="toggle toggle-primary" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2 text-slate-800 font-bold">
              <Bell size={18} className="text-blue-600"/>
              Notifications
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">New Test Assignments</span>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Results Published</span>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;