import React, { useState, useEffect } from 'react';
import { Sparkles, ListPlus, Send, Plus, Trash2, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const TestCreator = () => {
  const { user } = useUser(); 
  
  const [mode, setMode] = useState('ai'); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFetchingClasses, setIsFetchingClasses] = useState(false); // New state for refresh animation
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [testTitle, setTestTitle] = useState('');

  const [aiForm, setAiForm] = useState({
    topic: '',
    difficulty: 'Medium',
    numQuestions: 5
  });

  const [questions, setQuestions] = useState([
    { id: 1, question: '', options: ['', '', '', ''], correct: 0 }
  ]);

  // --- FETCH CLASSROOMS (With Cache-Busting) ---
  // --- FETCH CLASSROOMS (With Cache-Busting) ---
  const fetchClassrooms = async () => {
    if (!user) return;
    setIsFetchingClasses(true);
    
    try {
      // cache: 'no-store' forces the browser to bypass its temporary memory natively
      // We removed the custom headers that were causing the CORS crash!
      const res = await fetch(`http://127.0.0.1:8000/api/exams/classrooms/?teacher_id=${user.id}`, {
        method: 'GET',
        cache: 'no-store', 
      });
      
      const data = await res.json();
      if (res.ok) {
        // Sort newest first
        const sortedClasses = (data.classrooms || []).sort((a, b) => b.id - a.id);
        setClassrooms(sortedClasses);
      }
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
    } finally {
      setIsFetchingClasses(false);
    }
  };

  // Fetch on initial component mount
  useEffect(() => {
    fetchClassrooms();
  }, [user]);

  // --- AI GENERATION LOGIC ---
  const handleGenerate = async () => {
    if (!aiForm.topic) return setError("Please enter a topic.");
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/exams/generate-questions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiForm.topic,
          difficulty: aiForm.difficulty,
          num_questions: aiForm.numQuestions
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate questions.');

      const formattedQuestions = data.questions.map((q, idx) => {
        const correctIndex = q.options.indexOf(q.correct_answer);
        return {
          id: Date.now() + idx,
          question: q.question,
          options: q.options,
          correct: correctIndex !== -1 ? correctIndex : 0
        };
      });

      setQuestions(formattedQuestions);
      setTestTitle(`${aiForm.topic} Assessment`); 
      setMode('manual'); 
      
      // Auto-refresh classrooms when switching to manual mode just to be safe
      fetchClassrooms(); 
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- PUBLISH LOGIC ---
  const handlePublish = async () => {
    if (!testTitle) return setError("Please enter a Test Title in the settings below.");
    if (!selectedClass) return setError("Please assign this test to a Classroom.");
    if (!user) return setError("Authentication error. Please log in again.");

    setIsPublishing(true);
    setError('');
    setSuccess(false);

    const payload = {
      teacher_id: user.id,
      classroom_id: selectedClass,
      title: testTitle,
      topic: aiForm.topic || 'Manual Entry',
      difficulty: aiForm.difficulty,
      duration_minutes: 60,
      questions: questions
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/exams/publish-test/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to publish test.');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTestTitle('');
        setSelectedClass('');
        setQuestions([{ id: 1, question: '', options: ['', '', '', ''], correct: 0 }]);
        setMode('ai');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // --- MANUAL ENTRY HANDLERS ---
  const addQuestion = () => setQuestions([...questions, { id: Date.now(), question: '', options: ['', '', '', ''], correct: 0 }]);
  const removeQuestion = (id) => questions.length > 1 && setQuestions(questions.filter(q => q.id !== id));
  const updateQuestion = (id, field, value) => setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  return (
    <div className="p-10 max-w-5xl mx-auto pb-32">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-exam-primary">Create New Test</h1>
          <p className="text-slate-500 mt-1">Design your assessment using AI or manual entry.</p>
        </div>
        
        <div className="flex bg-white border border-exam-border p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setMode('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'ai' ? 'bg-exam-primary text-white' : 'text-slate-400 hover:text-exam-primary'}`}
          >
            <Sparkles size={16} /> AI Generator
          </button>
          <button 
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'manual' ? 'bg-exam-primary text-white' : 'text-slate-400 hover:text-exam-primary'}`}
          >
            <ListPlus size={16} /> Editor View
          </button>
        </div>
      </header>

      {/* ERROR/SUCCESS ALERTS */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in">
          <AlertCircle size={20} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in">
          <CheckCircle size={20} />
          <span className="text-sm font-bold">Test published successfully!</span>
        </div>
      )}

      {mode === 'ai' ? (
        <div className="bg-white border border-exam-border rounded-3xl p-8 shadow-sm">
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Topic / Syllabus</label>
              <input 
                type="text"
                value={aiForm.topic}
                onChange={(e) => setAiForm({...aiForm, topic: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-exam-border rounded-xl focus:border-exam-secondary focus:ring-1 focus:ring-exam-secondary outline-none transition-all text-lg text-exam-primary"
                placeholder="e.g., React Hooks and Component Lifecycle"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Difficulty</label>
                <select 
                  value={aiForm.difficulty}
                  onChange={(e) => setAiForm({...aiForm, difficulty: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-exam-border rounded-xl focus:border-exam-secondary outline-none transition-all text-slate-700"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Number of Questions</label>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  value={aiForm.numQuestions}
                  onChange={(e) => setAiForm({...aiForm, numQuestions: parseInt(e.target.value) || 1})}
                  className="w-full p-4 bg-slate-50 border border-exam-border rounded-xl focus:border-exam-secondary outline-none transition-all text-slate-700"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !aiForm.topic}
            className="flex items-center justify-center gap-2 w-full py-4 bg-exam-secondary text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {isGenerating ? 'Generating Questions...' : 'Generate Questions'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Test Settings Card */}
          <div className="bg-white border border-exam-border rounded-3xl p-8 shadow-sm border-t-4 border-t-exam-secondary">
             <h3 className="text-lg font-bold text-exam-primary mb-4">Test Settings</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Test Title</label>
                  <input 
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-exam-border rounded-xl focus:border-exam-secondary outline-none font-medium"
                    placeholder="e.g., Midterm Exam"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Assign To Classroom</label>
                    <button 
                      onClick={fetchClassrooms} 
                      className="text-[10px] font-bold text-exam-secondary flex items-center gap-1 hover:underline tracking-widest uppercase"
                    >
                      <RefreshCw size={10} className={isFetchingClasses ? "animate-spin" : ""} /> Refresh
                    </button>
                  </div>
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-exam-border rounded-xl focus:border-exam-secondary outline-none font-medium cursor-pointer"
                  >
                    <option value="" disabled>Select a Classroom...</option>
                    {classrooms.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name} ({cls.code})</option>
                    ))}
                  </select>
                </div>
             </div>
          </div>

          {questions.map((q, index) => (
            <div key={q.id} className="bg-white border border-exam-border rounded-3xl p-8 shadow-sm relative group">
              <button 
                onClick={() => removeQuestion(q.id)}
                className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Question {index + 1}</label>
                <input 
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-exam-border rounded-xl focus:border-exam-secondary outline-none transition-all text-exam-primary font-medium"
                  placeholder="Enter your question here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 border rounded-xl transition-colors ${q.correct === i ? 'bg-blue-50 border-exam-secondary' : 'bg-white border-exam-border'}`}>
                    <input 
                      type="radio" 
                      name={`correct-${q.id}`} 
                      checked={q.correct === i}
                      onChange={() => updateQuestion(q.id, 'correct', i)}
                      className="w-4 h-4 accent-exam-secondary cursor-pointer" 
                    />
                    <input 
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(q.id, i, e.target.value)}
                      className="flex-1 text-sm outline-none bg-transparent text-exam-primary"
                      placeholder={`Option ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-exam-border rounded-3xl text-slate-500 font-bold hover:bg-slate-50 hover:text-exam-secondary hover:border-exam-secondary transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Another Question
          </button>
        </div>
      )}

      {/* Floating Action Bar */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-exam-border p-4 px-8 flex justify-end gap-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handlePublish}
          disabled={isPublishing || mode === 'ai'}
          className="px-10 py-3 bg-exam-primary text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
          {isPublishing ? 'Publishing...' : 'Publish Test'}
        </button>
      </footer>
    </div>
  );
};

export default TestCreator;