import React from 'react';
import { LayoutDashboard, PenTool, BarChart3, User, LogOut, Cpu, BookOpen } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const { signOut } = useClerk();

  const teacherMenu = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'classrooms', name: 'Classrooms', icon: <BookOpen size={20} /> }, // NEW TAB
    { id: 'create', name: 'Create Test', icon: <PenTool size={20} /> },
    { id: 'analytics', name: 'Student Analytics', icon: <BarChart3 size={20} /> },
    { id: 'profile', name: 'Profile', icon: <User size={20} /> }, 
  ];

  const studentMenu = [
    { id: 'tests', name: 'My Tests', icon: <PenTool size={20} /> },
    { id: 'classrooms', name: 'My Classes', icon: <BookOpen size={20} /> }, // We'll build this for students next
    { id: 'performance', name: 'AI Performance', icon: <Cpu size={20} /> },
    { id: 'profile', name: 'Profile', icon: <User size={20} /> },
  ];

  const menu = role === 'teacher' ? teacherMenu : studentMenu;

  const handleLogout = () => {
    localStorage.removeItem('examAppRole'); // Clear role on logout so they can choose again if needed
    signOut();
  };

  return (
    <aside className="w-64 bg-white border-r border-exam-border flex flex-col h-screen sticky top-0 z-40 shrink-0">
      <div className="p-8 border-b border-exam-border">
        <h1 className="text-2xl font-bold tracking-tighter text-exam-primary">
          EXAM<span className="text-exam-secondary">.AI</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              activeTab === item.id 
              ? 'bg-blue-50 text-exam-secondary shadow-sm ring-1 ring-blue-100' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-exam-primary'
            }`}
          >
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-exam-border shrink-0">
        <div className="mb-4 px-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as</div>
          <div className="text-xs font-bold text-exam-primary capitalize">{role}</div>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;