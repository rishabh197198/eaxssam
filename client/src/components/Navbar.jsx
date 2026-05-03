import React from 'react';
import { Search, Bell, Settings, User, Clock } from 'lucide-react';

const Navbar = ({ role, activeTab }) => {
  // Logic to determine the title based on the active tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Welcome back, Instructor';
      case 'create': return 'Assessment Creator';
      case 'performance': return 'AI Learning Analytics';
      case 'tests': return 'Your Assigned Exams';
      default: return 'Exam.AI Platform';
    }
  };

  return (
    <nav className="h-20 bg-white border-b border-exam-border px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm/5">
      {/* Dynamic Header Title */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-exam-primary leading-tight">
          {getHeaderTitle()}
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            System Online
          </span>
        </div>
      </div>

      {/* Center: Search Bar (Primarily for Teacher/Admin) */}
      {role === 'teacher' && (
        <div className="hidden md:flex items-center flex-1 max-w-md mx-10">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search students, tests, or results..."
              className="w-full bg-slate-50 border border-exam-border rounded-xl py-2 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-exam-secondary/20 focus:border-exam-secondary outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Right: Actions and Profile */}
      <div className="flex items-center gap-4">
        {/* Quick Action: Notification */}
        <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-exam-border mx-2"></div>

        {/* User Profile Section */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-exam-primary leading-none">Rishabh Chauhan</p>
            <p className="text-[10px] font-bold text-exam-secondary uppercase mt-1">
              {role === 'teacher' ? 'Faculty ID: 102' : 'CS Student'}
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-100 border border-exam-border rounded-xl flex items-center justify-center text-exam-secondary hover:bg-exam-secondary hover:text-white transition-all cursor-pointer overflow-hidden">
            <User size={20} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;