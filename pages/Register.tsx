
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, 
  ArrowRight, Upload, FileCheck, X, User, 
  MapPin, Phone, Calendar, Heart, Banknote, ShieldAlert,
  FileText, Lock, RefreshCw, AlertCircle, Mail, Info
} from 'lucide-react';
import { ApplicationType } from '../types';
import { notifyRegistrationSuccess, sendOTP } from '../services/notification';

const SLIDES = [
  "https://picsum.photos/seed/seniors_ph1/800/600",
  "https://picsum.photos/seed/seniors_ph2/800/600",
  "https://picsum.photos/seed/seniors_ph3/800/600"
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { addApplication } = useApp();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    birthDate: '',
    birthPlace: '',
    sex: '',
    civilStatus: '',
    address: '',
    contactNumber: '',
    livingArrangement: '',
    isPensioner: false,
    pensionSource: '',
    pensionAmount: '',
    hasIllness: false,
    illnessDetails: ''
  });

  const [files, setFiles] = useState<string[]>([]);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(0);

  // Slideshow timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // OTP Countdown effect
  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    
    // Reset OTP status if number changes
    if (name === 'contactNumber') {
      setOtpSent(false);
      setOtpVerified(false);
      setInputOtp('');
      setTimer(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendOTP = async () => {
    if (!formData.contactNumber || formData.contactNumber.length < 10) {
      setOtpError('Please enter a valid contact number.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    const code = await sendOTP(formData.contactNumber);
    if (code) {
      setGeneratedOtp(code);
      setOtpSent(true);
      setTimer(30); // Start 30s countdown
      console.log(`[DEMO] Verification Code sent to ${formData.contactNumber}: ${code}`);
    } else {
      setOtpError('Failed to send verification code. Please try again.');
    }
    setOtpLoading(false);
  };

  const handleVerifyOTP = () => {
    setOtpError('');
    if (inputOtp === generatedOtp) {
      setOtpVerified(true);
    } else {
      setOtpError('Invalid verification code. Please try again.');
    }
  };

  const handleSubmit = async () => {
    const fullName = `${formData.firstName} ${formData.lastName}`;
    
    // 1. Submit application to global state
    addApplication({
      userId: `temp_${Date.now()}`,
      userName: fullName,
      type: ApplicationType.REGISTRATION,
      description: `Manual Registration Submission.\nLiving: ${formData.livingArrangement}\nPensioner: ${formData.isPensioner ? 'Yes' : 'No'}\nIllness: ${formData.hasIllness ? formData.illnessDetails : 'None'}\nContact: ${formData.contactNumber}\nEmail: ${formData.email}\nNote: OTP verification bypassed.`,
      documents: files
    });

    // 2. Trigger SMS & Email Notifications
    await notifyRegistrationSuccess(fullName, formData.contactNumber, formData.email);
    
    // 3. Redirect with success state
    navigate('/', { state: { openLogin: true } });
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.birthDate && formData.address && formData.email;
  const isStep2Valid = formData.livingArrangement;
  // TEMPORARY: Removed otpVerified requirement from validation
  const isStep3Valid = formData.contactNumber && files.length > 0;

  const nextStep = () => {
    if (currentStep === 1) {
      if (!isStep1Valid) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isStep2Valid) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!isStep3Valid) return;
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      
      {/* LEFT PANEL - Red Gradient */}
      <div className="hidden lg:flex w-[35%] bg-primary-600 text-white flex-col relative px-12 pt-20 pb-12 items-center justify-between animate-fade-in">
        <div className="absolute top-10 left-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium group">
            <div className="p-1.5 rounded-full border border-white/30 group-hover:bg-white/10 transition-colors">
              <ArrowLeft size={14}/>
            </div>
            Back to home
          </button>
        </div>

        <div className="space-y-8 relative z-10 flex flex-col items-center text-center max-w-sm">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">MABUHAY!</h1>
            <p className="text-lg text-white/90 leading-relaxed font-medium drop-shadow-sm">
              Register now to access your Senior Citizen benefits and services in San Juan City.
            </p>
          </div>

          <div className="relative w-64 h-64 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20">
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

        <div className="flex justify-center w-full">
          <img 
            src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" 
            className="h-16 w-auto object-contain drop-shadow-xl" 
            alt="Official Logo Group" 
          />
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="flex-1 flex flex-col h-full bg-white relative px-6 md:px-12 lg:px-20 overflow-y-auto custom-scrollbar">
        
        {/* TOP STEPPER */}
        <div className="py-10 flex items-center justify-center shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            {[1, 2, 3].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === step ? 'bg-primary-600 text-white shadow-lg scale-110' : 
                    currentStep > step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {currentStep > step ? <CheckCircle2 size={20} /> : step}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${currentStep === step ? 'text-primary-600' : 'text-slate-400'}`}>
                    {step === 1 ? 'Profile' : step === 2 ? 'Social' : 'Final'}
                  </span>
                </div>
                {i < 2 && <div className={`h-1 flex-1 rounded-full mb-6 ${currentStep > step ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pb-32">
          {currentStep === 1 ? (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-slate-900">Personal Profile</h2>
                <p className="text-slate-500 text-sm">Please provide your basic information as it appears on your birth certificate.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium" placeholder="Juan" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium" placeholder="Dela Cruz" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Birth Date</label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Birth Place</label>
                  <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium" placeholder="San Juan City" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Gender</label>
                  <select name="sex" value={formData.sex} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Civil Status</label>
                  <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium">
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Residential Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium" placeholder="House No, Street, Barangay, San Juan City" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium" placeholder="juan.delacruz@email.com" />
                  </div>
                </div>
              </div>
            </div>
          ) : currentStep === 2 ? (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-slate-900">Socio-Economic Info</h2>
                <p className="text-slate-500 text-sm">This helps us determine eligibility for various assistance programs.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14}/> Living Arrangement
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Owned', 'Rent', 'Living with Relatives', 'Others'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setFormData(prev => ({...prev, livingArrangement: opt}))}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                          formData.livingArrangement === opt 
                          ? 'bg-primary-50 border-primary-500 text-primary-600' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Banknote size={16} className="text-emerald-500" /> Are you a Pensioner?
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isPensioner" checked={formData.isPensioner} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {formData.isPensioner && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in-down">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source (e.g. SSS, GSIS)</label>
                        <input type="text" name="pensionSource" value={formData.pensionSource} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount (Monthly)</label>
                        <input type="number" name="pensionAmount" value={formData.pensionAmount} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100"></div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Heart size={16} className="text-red-500" /> Do you have any major illness?
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="hasIllness" checked={formData.hasIllness} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  {formData.hasIllness && (
                    <div className="space-y-1 animate-fade-in-down">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Illness Details</label>
                      <textarea name="illnessDetails" value={formData.illnessDetails} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none" rows={2} placeholder="Hypertension, Diabetes, etc."></textarea>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-slate-900">Final Verification</h2>
                <p className="text-slate-500 text-sm">Upload documents and verify your mobile number to complete registration.</p>
              </div>

              <div className="space-y-6">
                {/* File Upload Section */}
                <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100">
                  <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText size={16}/> Required Documents
                  </h3>
                  <div className="relative border-2 border-dashed border-primary-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-primary-100/50 transition-all cursor-pointer group">
                    <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-12 h-12 bg-white text-primary-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                      <Upload size={24} />
                    </div>
                    <p className="font-bold text-primary-900">Upload Birth Certificate / Valid ID</p>
                    <p className="text-xs text-primary-600 mt-1">Images or PDF (Max 5MB each)</p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-primary-100 text-xs text-slate-700">
                          <span className="flex items-center gap-2"><FileCheck size={14} className="text-emerald-500" /> {f}</span>
                          <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Security & OTP Verification Section */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={16} className="text-primary-400" /> Account Security
                    </h3>
                    <div className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded flex items-center gap-1 font-bold">
                       <Info size={10} /> OTP VERIFICATION OPTIONAL
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Mobile Number Input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Mobile Number for OTP</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                          <input 
                            type="tel" 
                            name="contactNumber" 
                            value={formData.contactNumber} 
                            onChange={handleChange} 
                            disabled={otpVerified || otpLoading}
                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-primary-500 transition-all font-mono disabled:opacity-50" 
                            placeholder="09XX XXX XXXX" 
                          />
                        </div>
                        {!otpVerified && (
                          <button 
                            onClick={handleSendOTP}
                            disabled={otpLoading || !formData.contactNumber || timer > 0}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-600/20 transition-all disabled:opacity-30 flex items-center gap-2 shrink-0 min-w-[120px] justify-center"
                          >
                            {otpLoading ? <RefreshCw size={14} className="animate-spin" /> : timer > 0 ? `Retry in ${timer}s` : 'Send OTP'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* OTP Input Field - Appears after sending */}
                    {otpSent && !otpVerified && (
                      <div className="space-y-3 animate-fade-in-down">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Enter Verification Code</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input 
                              type="text" 
                              maxLength={6}
                              value={inputOtp}
                              onChange={(e) => setInputOtp(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-primary-500 transition-all font-mono text-xl tracking-[0.2em]" 
                              placeholder="000000" 
                            />
                          </div>
                          <button 
                            onClick={handleVerifyOTP}
                            disabled={inputOtp.length < 6}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-30"
                          >
                            Verify
                          </button>
                        </div>
                        {otpError && (
                          <p className="text-red-400 text-[10px] font-bold flex items-center gap-1">
                            <AlertCircle size={12} /> {otpError}
                          </p>
                        )}
                        <p className="text-[10px] text-white/40">
                          Code sent to your mobile. Haven't received it? 
                          <button 
                            onClick={handleSendOTP} 
                            disabled={timer > 0 || otpLoading}
                            className="text-primary-400 hover:underline ml-1 disabled:opacity-50 disabled:no-underline"
                          >
                            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                          </button>
                        </p>
                      </div>
                    )}

                    {/* Verified Status */}
                    {otpVerified && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-400">Number Verified</p>
                            <p className="text-[10px] text-emerald-400/60 font-mono">{formData.contactNumber}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setOtpVerified(false); setOtpSent(false); setTimer(0); }}
                          className="text-[10px] text-white/40 hover:text-white underline"
                        >
                          Change Number
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NAV */}
        <div className="fixed bottom-0 left-0 lg:left-[35%] right-0 h-32 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-between px-8 md:px-20 z-40">
          <button onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors group disabled:opacity-0">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
             <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
             <ShieldCheck className="text-slate-300" size={18} />
             <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Verified Registration Secure Tunnel</span>
          </div>

          <button 
            onClick={nextStep}
            disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && !isStep3Valid)}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl transition-all ${
              (currentStep === 3) 
              ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
              : 'bg-primary-600 text-white shadow-primary-600/30'
            } disabled:opacity-30 disabled:translate-y-0 transform hover:-translate-y-1 active:scale-95`}
          >
            {currentStep === 3 ? 'Finish Registration' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
