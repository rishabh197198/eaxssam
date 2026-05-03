import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { Loader2, GraduationCap, Users } from 'lucide-react';

// --- Eagerly Loaded Components ---
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/login';

// --- Lazy Loaded Components ---
const TeacherDashboard = lazy(() => import('./pages/Teacher/Dashboard'));
const TeacherClassrooms = lazy(() => import('./pages/Teacher/Classrooms')); // NEW PAGE
const TestCreator = lazy(() => import('./pages/Teacher/TestCreator'));
const ResultAnalytics = lazy(() => import('./pages/Teacher/resultAnalytics'));
const TeacherProfile = lazy(() => import('./pages/Teacher/Profile'));

const StudentDashboard = lazy(() => import('./pages/Student/Dashboard'));
const StudentPerformance = lazy(() => import('./pages/Student/Performance'));
const StudentProfile = lazy(() => import('./pages/Student/Profile'));
const ExamSession = lazy(() => import('./pages/Student/ExamSession'));
const StudentClassrooms = lazy(() => import('./pages/Student/Classrooms'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
    <Loader2 size={32} className="animate-spin text-exam-secondary" />
    <span className="text-sm font-medium">Loading module...</span>
  </div>
);

// --- NEW: Role Selection Gateway ---
const RoleSelection = ({ onSelectRole }) => {
  const { user } = useUser();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-exam-primary">Welcome, {user?.firstName}!</h1>
          <p className="text-slate-500 mt-2 text-lg">How will you be using EXAM.AI today?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => onSelectRole('teacher')}
            className="bg-white p-8 rounded-[2rem] border-2 border-exam-border hover:border-exam-secondary hover:shadow-xl hover:shadow-blue-500/10 transition-all group text-left"
          >
            <div className="w-16 h-16 bg-blue-50 text-exam-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-bold text-exam-primary mb-2">I am a Teacher</h2>
            <p className="text-slate-500 text-sm">Create classrooms, generate AI tests, and monitor student analytics.</p>
          </button>

          <button 
            onClick={() => onSelectRole('student')}
            className="bg-white p-8 rounded-[2rem] border-2 border-exam-border hover:border-exam-secondary hover:shadow-xl hover:shadow-blue-500/10 transition-all group text-left"
          >
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-2xl font-bold text-exam-primary mb-2">I am a Student</h2>
            <p className="text-slate-500 text-sm">Join classrooms, take secure exams, and view your performance.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

const MainLayout = () => {
  // Check local storage for existing role
  const [role, setRole] = useState(localStorage.getItem('examAppRole') || null);
  const [activeTab, setActiveTab] = useState(role === 'teacher' ? 'overview' : 'tests');

  const handleSetRole = (selectedRole) => {
    localStorage.setItem('examAppRole', selectedRole);
    setRole(selectedRole);
    setActiveTab(selectedRole === 'teacher' ? 'overview' : 'tests');
  };

  // If no role is selected, trap them on the Role Selection screen
  if (!role) {
    return <RoleSelection onSelectRole={handleSetRole} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar role={role} activeTab={activeTab} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Suspense fallback={<PageLoader />}>
            {role === 'teacher' ? (
              <>
                {activeTab === 'overview' && <TeacherDashboard />}
                {activeTab === 'classrooms' && <TeacherClassrooms />}
                {activeTab === 'create' && <TestCreator />}
                {activeTab === 'analytics' && <ResultAnalytics />}
                {activeTab === 'profile' && <TeacherProfile />}
              </>
            ) : (
              <>
                {activeTab === 'tests' && <StudentDashboard />}
                {activeTab === 'classrooms' && <StudentClassrooms setActiveTab={setActiveTab} />}
                {activeTab === 'performance' && <StudentPerformance />}
                {activeTab === 'profile' && <StudentProfile />}
              </>
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/take-test/:id" 
          element={
            <SignedIn>
              <Suspense fallback={<PageLoader />}>
                <ExamSession />
              </Suspense>
            </SignedIn>
          } 
        />

        <Route 
          path="/*" 
          element={
            <>
              <SignedIn>
                <MainLayout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;