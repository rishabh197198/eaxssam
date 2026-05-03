import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Clock, AlertTriangle, ChevronRight, ChevronLeft, LayoutGrid, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';

const ExamSession = () => {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  
  // App States
  const [isLoading, setIsLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Proctoring States
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // 1. Fetch Exam Data from Django
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/exams/get-test/${id}/`);
        const data = await res.json();
        if (res.ok) {
          setTest(data);
          setTimeLeft(data.durationSeconds);
        } else {
          alert("Test not found or inaccessible.");
          navigate('/');
        }
      } catch (err) {
        console.error("Failed to load exam:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchExamData();
  }, [id, user, navigate]);

  // 2. Timer Logic
  useEffect(() => {
    if (isLoading || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          processSubmission(); // Auto-submit when time hits zero
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, isSubmitted, timeLeft]);

  // 3. Proctoring: Tab-Switch Detection
  useEffect(() => {
    if (isLoading || isSubmitted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => prev + 1);
        setShowWarningModal(true);
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isLoading, isSubmitted]);

  // 4. Submission Logic
  const processSubmission = async () => {
    if (isSubmitted) return;
    setIsLoading(true);

    try {
      // Send data to a new submission endpoint (we'll ensure this exists in backend)
      const res = await fetch(`http://127.0.0.1:8000/api/exams/submit-test/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: id,
          student_id: user.id,
          answers: answers, // { questionId: chosenIndex }
          warnings: warnings
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        alert("Submission failed. Please contact your teacher.");
      }
    } catch (err) {
      console.error("Submission Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading && !isSubmitted) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 size={40} className="animate-spin text-exam-secondary mb-4" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Syncing Secure Session...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white border border-exam-border rounded-[2.5rem] p-10 text-center shadow-xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-exam-primary mb-2">Exam Completed</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">Your answers and proctoring logs have been securely uploaded to the dashboard.</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-exam-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIndex];
  const isLastQuestion = currentIndex === test.questions.length - 1;

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-exam-primary select-none">
      {/* Header */}
      <header className="h-20 bg-white border-b border-exam-border px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><LayoutGrid size={20} /></div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{test.title}</h1>
            <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">Question {currentIndex + 1} of {test.questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {warnings > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 animate-pulse">
              <ShieldAlert size={16} />
              <span className="text-xs font-bold">Flags: {warnings}</span>
            </div>
          )}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg font-mono ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
            <Clock size={20} /> {formatTime(timeLeft)}
          </div>
          <button onClick={() => { if(window.confirm("Finish Exam?")) processSubmission(); }} className="px-6 py-2.5 bg-exam-secondary text-white font-bold rounded-xl hover:opacity-90">
            Submit
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-72 bg-white border-r border-exam-border hidden md:flex flex-col shrink-0">
          <div className="p-6 border-b border-exam-border"><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Questions</h3></div>
          <div className="p-6 grid grid-cols-4 gap-3 overflow-y-auto">
            {test.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                  currentIndex === index ? 'ring-2 ring-exam-secondary ring-offset-2 bg-exam-secondary text-white shadow-lg shadow-blue-500/20' :
                  answers[q.id] !== undefined ? 'bg-blue-50 text-exam-secondary border border-blue-100' : 'bg-slate-50 text-slate-400 border border-exam-border'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </aside>

        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16">
          <div className="max-w-3xl mx-auto space-y-10" key={currentQuestion.id}>
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-widest">Multiple Choice</span>
              <h2 className="text-2xl md:text-4xl font-bold leading-tight text-exam-primary">{currentQuestion.text}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQuestion.id, idx)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                    answers[currentQuestion.id] === idx ? 'border-exam-secondary bg-blue-50/50 shadow-sm' : 'border-exam-border bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[currentQuestion.id] === idx ? 'border-exam-secondary' : 'border-slate-300'}`}>
                    {answers[currentQuestion.id] === idx && <div className="w-2.5 h-2.5 bg-exam-secondary rounded-full" />}
                  </div>
                  <span className={`text-lg font-medium ${answers[currentQuestion.id] === idx ? 'text-exam-secondary' : 'text-slate-700'}`}>{option}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer Controls */}
      <footer className="h-20 bg-white border-t border-exam-border px-8 flex items-center justify-between shrink-0">
        <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all">
          <ChevronLeft size={20} /> Back
        </button>
        {isLastQuestion ? (
          <button onClick={() => { if(window.confirm("Submit your answers?")) processSubmission(); }} className="flex items-center gap-2 px-8 py-3 bg-exam-primary text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all">
            Finish Exam <CheckCircle size={20} />
          </button>
        ) : (
          <button onClick={() => setCurrentIndex(prev => Math.min(test.questions.length - 1, prev + 1))} className="flex items-center gap-2 px-6 py-3 text-exam-primary rounded-xl font-bold hover:bg-slate-50 transition-all">
            Next Question <ChevronRight size={20} />
          </button>
        )}
      </footer>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-8 text-center shadow-2xl border border-exam-border animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold text-exam-primary mb-2">Tab Switch Detected</h3>
            <p className="text-slate-500 mb-6 text-sm">Your activity has been flagged. Please stay within the exam window to avoid disqualification.</p>
            <button onClick={() => setShowWarningModal(false)} className="w-full py-3 bg-exam-primary text-white font-bold rounded-xl hover:opacity-90">Resume Exam</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSession;