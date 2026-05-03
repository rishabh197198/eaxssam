import React, { useState, useEffect } from 'react';
import { Camera, ShieldCheck, UserCheck, AlertTriangle, Activity } from 'lucide-react';

const ProctorFeed = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [pulse, setPulse] = useState(true);

  // Simulate AI heartbeats/analysis
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Video Stream Container */}
      <div className="relative aspect-video bg-exam-primary rounded-2xl overflow-hidden shadow-sm border border-exam-border ring-4 ring-white">
        {/* Placeholder for Camera Feed */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 bg-slate-900">
          <Camera size={40} className="mb-2 opacity-20" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Camera Stream Offline</span>
        </div>

        {/* AI Overlay Elements */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
          {/* Top Status Bar */}
          <div className="flex justify-between items-start">
            <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${pulse ? 'bg-green-500' : 'bg-green-800'} transition-colors duration-500`}></div>
              <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Live Analysis</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/10">
              <span className="text-[9px] font-bold text-white uppercase tracking-tighter font-mono">FR: 30FPS</span>
            </div>
          </div>

          {/* Bottom ID Bar */}
          <div className="flex justify-between items-end">
            <div className="bg-exam-secondary/90 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2">
              <UserCheck size={12} className="text-white" />
              <span className="text-[10px] font-bold text-white uppercase">Verified: Rishabh C.</span>
            </div>
            <Activity size={16} className="text-green-500 opacity-50" />
          </div>
        </div>

        {/* Scanning Animation (Non-gradient line) */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-exam-secondary/50 animate-[scan_3s_linear_infinite]"></div>
      </div>

      {/* AI Security Status Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-exam-border p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-exam-secondary">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Security</p>
            <p className="text-[11px] font-bold text-exam-primary mt-1">Encrypted</p>
          </div>
        </div>
        <div className="bg-white border border-exam-border p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Violations</p>
            <p className="text-[11px] font-bold text-exam-primary mt-1">0 Detected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProctorFeed;