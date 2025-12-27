
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, Search, CheckCircle2, XCircle, ShieldCheck, 
  ArrowRight, Upload, FileCheck, X, FileText
} from 'lucide-react';
import { RegistryRecord } from '../types';

const SLIDES = [
  "https://picsum.photos/seed/seniors_ph1/800/600",
  "https://picsum.photos/seed/seniors_ph2/800/600",
  "https://picsum.photos/seed/seniors_ph3/800/600"
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { verifyIdentity, registryRecords } = useApp();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [searchId, setSearchId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
  const [foundRecord, setFoundRecord] = useState<RegistryRecord | null>(null);
  const [calculatedAge, setCalculatedAge] = useState<number>(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationStatus('searching');
    setTimeout(() => {
      const record = verifyIdentity(searchId);
      if (record) {
        setFoundRecord(record);
        setCalculatedAge(calculateAge(record.birthDate));
        setVerificationStatus('found');
      } else {
        setVerificationStatus('not-found');
      }
    }, 600);
  };

  const nextStep = () => currentStep < 4 && setCurrentStep(c => c + 1);

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      
      {/* LEFT PANEL - Red Gradient */}
      <div className="hidden lg:flex w-[42%] bg-[#ef4444] text-white flex-col relative px-16 pt-20 pb-12 items-center justify-start animate-fade-in">
        {/* Back navigation */}
        <div className="absolute top-10 left-12">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium group">
            <div className="p-1.5 rounded-full border border-white/30 group-hover:bg-white/10 transition-colors">
              <ArrowLeft size={14}/>
            </div>
            Back to home
          </button>
        </div>

        {/* Top-aligned Content */}
        <div className="space-y-8 relative z-10 flex flex-col items-center text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">“MABUHAY ! “</h1>
            <p className="text-lg text-white/90 leading-relaxed font-medium max-w-md mx-auto drop-shadow-sm">
              Register now to access your Senior <br />
              Citizen benefits and services in <br />
              San Juan City.
            </p>
          </div>

          {/* Slideshow Image */}
          <div className="relative w-full aspect-[4/3] max-w-[240px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 transition-transform duration-700 hover:scale-105">
            {SLIDES.map((src, idx) => (
              <img 
                key={idx}
                src={src} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`} 
                alt="Slideshow"
              />
            ))}
          </div>
        </div>

        {/* Logos fixed at the very bottom */}
        <div className="absolute bottom-10 flex justify-center w-full">
          <img 
            src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" 
            className="h-16 w-auto object-contain drop-shadow-xl" 
            alt="Official Logo Group" 
          />
        </div>
      </div>

      {/* RIGHT PANEL - Centered Registration Form */}
      <div className="flex-1 flex flex-col h-full bg-white relative px-10 lg:px-24">
        
        {/* TOP STEPPER */}
        <div className="h-32 flex items-center justify-center shrink-0">
          <div className="flex items-center gap-2 w-full max-w-sm">
            {[1, 2, 3, 4].map((step, i) => (
              <React.Fragment key={step}>
                <div className={`w-2.5 h-2.5 rounded-full ${currentStep >= step ? 'bg-[#ef4444]' : 'bg-slate-200'}`}></div>
                {i < 3 && <div className={`h-[1px] flex-1 ${currentStep > step ? 'bg-[#ef4444]' : 'bg-slate-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* CENTERED FORM CONTENT */}
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
          {currentStep === 1 && (
            <div className="space-y-10 animate-fade-in-up">
              <h2 className="text-4xl font-extrabold text-[#1e293b] tracking-tight">Identity Verification</h2>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-slate-500 font-bold text-sm tracking-wide ml-1">ID Number (LCR / PWD)</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#f1f5f9] rounded-2xl px-8 py-5 text-slate-800 outline-none focus:ring-2 focus:ring-[#ef4444]/20 transition-all font-semibold text-xl placeholder:text-slate-300"
                    placeholder="e.g. LCR-2024-001"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleVerify}
                  disabled={!searchId || verificationStatus === 'searching'}
                  className="w-full bg-[#1e293b] text-white rounded-[2rem] py-5 font-bold text-xl hover:bg-[#0f172a] transition-all shadow-xl shadow-slate-200"
                >
                  {verificationStatus === 'searching' ? 'Checking...' : 'Verify Identity'}
                </button>
              </div>

              {/* Status Display */}
              {verificationStatus === 'found' && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 animate-scale-up">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={32} />
                  <div>
                    <p className="font-bold text-emerald-900 text-lg">Record Found: {foundRecord?.firstName} {foundRecord?.lastName}</p>
                    <p className="text-emerald-700 text-sm">Age: {calculatedAge} years old. Eligible to register.</p>
                  </div>
                </div>
              )}

              {verificationStatus === 'not-found' && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 animate-scale-up">
                  <XCircle className="text-red-500 shrink-0" size={32} />
                  <div>
                    <p className="font-bold text-red-900 text-lg">No Record Found</p>
                    <p className="text-red-700 text-sm">Please proceed with manual registration.</p>
                  </div>
                </div>
              )}

              {/* DEMO PILLS */}
              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4">For Demo:</p>
                <div className="flex flex-wrap gap-2">
                  {registryRecords.slice(0, 2).map(r => (
                    <button key={r.id} onClick={() => setSearchId(r.id)} className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200 font-bold transition-colors">{r.id}</button>
                  ))}
                  <button onClick={() => setSearchId('UNKNOWN')} className="text-xs bg-red-50 text-red-400 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 font-bold transition-colors">Unknown</button>
                </div>
              </div>
            </div>
          )}

          {currentStep > 1 && (
             <div className="animate-fade-in-up flex items-center justify-center py-20">
                <p className="text-slate-400 font-medium italic">Step {currentStep} form content placeholder...</p>
             </div>
          )}
        </div>

        {/* FOOTER - Pagination & Terms */}
        <div className="h-32 flex items-center justify-between shrink-0 border-t border-slate-50 animate-fade-in">
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors group">
            <ShieldCheck size={18} />
            <span className="text-sm font-semibold">Terms of Use and Conditions</span>
          </button>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-sm font-black tracking-widest">
              {[1, 2, 3, 4].map(s => (
                <span key={s} className={currentStep === s ? 'text-[#ef4444]' : 'text-slate-300'}>{s}</span>
              ))}
            </div>
            <button 
              onClick={nextStep}
              disabled={currentStep === 1 && (verificationStatus === 'idle' || verificationStatus === 'searching')}
              className="text-[#ef4444] font-black text-sm uppercase tracking-widest hover:translate-x-1 transition-transform disabled:opacity-30 disabled:translate-x-0"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
