
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, Calendar, MapPin, Upload, FileCheck, Search, 
  ArrowLeft, AlertCircle, CheckCircle2, ArrowRight, Star,
  Phone, Heart, X, FileText, Key, Mail, ShieldCheck, Info,
  LogIn, XCircle
} from 'lucide-react';
import { RegistryRecord } from '../types';

const InfoModal = ({ isOpen, onClose, title, content }: { isOpen: boolean; onClose: () => void; title: string; content: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-20 overflow-hidden flex flex-col max-h-[80vh] animate-scale-up">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
               <FileText size={20} />
             </div>
             <h3 className="font-bold text-xl text-slate-800">{title}</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">
            {content}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
             <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-800/20">Close</button>
        </div>
      </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { verifyIdentity, registryRecords } = useApp();
  
  // Steps: 1=Verify, 2=Personal, 3=Contact/Account, 4=Docs/Terms
  const [currentStep, setCurrentStep] = useState(1);
  const [searchId, setSearchId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
  const [foundRecord, setFoundRecord] = useState<RegistryRecord | null>(null);
  const [calculatedAge, setCalculatedAge] = useState<number>(0);
  const [showTerms, setShowTerms] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    birthPlace: '',
    sex: 'Male',
    civilStatus: 'Single',
    address: '',
    email: '',
    password: '',
    contactNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
  });
  const [file, setFile] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  const isEligible = calculatedAge >= 60;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationStatus('searching');
    setFoundRecord(null);
    setCalculatedAge(0);
    
    // Simulate API search delay
    setTimeout(() => {
        const record = verifyIdentity(searchId);
        if (record) {
            setFoundRecord(record);
            const age = calculateAge(record.birthDate);
            setCalculatedAge(age);
            setVerificationStatus('found');
            
            // Pre-fill form if not registered
            if (!record.isRegistered) {
                setFormData(prev => ({
                    ...prev,
                    firstName: record.firstName,
                    middleName: record.middleName || '',
                    lastName: record.lastName,
                    birthDate: record.birthDate,
                    sex: record.sex || 'Male',
                    civilStatus: record.civilStatus || 'Single',
                    address: record.address || '',
                }));
            }
        } else {
            setVerificationStatus('not-found');
            // Reset form for manual entry
            setFormData({
                firstName: '',
                middleName: '',
                lastName: '',
                birthDate: '',
                birthPlace: '',
                sex: 'Male',
                civilStatus: 'Single',
                address: '',
                email: '',
                password: '',
                contactNumber: '',
                emergencyContactName: '',
                emergencyContactNumber: '',
            });
        }
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      alert('Registration Submitted! Please wait for approval.');
      navigate('/');
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1);
    if (currentStep === 4) handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  // Logic to allow proceeding:
  // 1. Found + Unregistered + Eligible
  // 2. Not Found (Manual Registration)
  const canProceedStep1 = (verificationStatus === 'found' && foundRecord && !foundRecord.isRegistered && isEligible) || 
                          (verificationStatus === 'not-found');

  // Logic to show/hide bottom navigation
  // Show only if:
  // 1. Not in step 1 (always show for steps 2,3,4)
  // 2. OR In step 1 AND can proceed
  const showBottomNav = currentStep > 1 || canProceedStep1;

  const termsContent = (
    <div className="space-y-6 text-slate-600 leading-relaxed font-light">
        <div>
            <h4 className="font-bold text-slate-800 mb-2">1. Acceptance of Terms</h4>
            <p className="text-sm">By accessing and using the SeniorConnect portal, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use this system.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-800 mb-2">2. Eligibility</h4>
            <p className="text-sm">Registration is strictly reserved for verified residents of San Juan City who are 60 years of age or older. Any false representation of age or residency is a violation of the law and will result in immediate disqualification and potential legal action.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-800 mb-2">3. User Responsibilities</h4>
            <p className="text-sm">You are responsible for maintaining the confidentiality of your account credentials (username and password). You agree to provide accurate, current, and complete information during the registration process. All activities that occur under your account are your sole responsibility.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-800 mb-2">4. Data Privacy</h4>
            <p className="text-sm">We are committed to protecting your personal information in compliance with the Data Privacy Act of 2012. Your data is collected and used solely for the purpose of validating your identity and delivering social services, benefits, and assistance programs.</p>
        </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden font-sans">
      <InfoModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms and Conditions" 
        content={termsContent} 
      />

      {/* Header */}
      <div className="bg-[#ef4444] p-4 text-white flex justify-between items-center shrink-0 shadow-md z-20 animate-fade-in-down">
          <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')}><ArrowLeft size={20}/></button>
              <h1 className="font-bold text-lg">Registration</h1>
          </div>
          <img src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" className="w-8 h-8" alt="San Juan Seal" />
      </div>

      {/* Main Content - Form Wizard */}
      <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
         {/* Step Progress Indicator */}
         <div className="px-6 lg:px-16 pt-8 pb-2 shrink-0 animate-fade-in-down">
             <div className="flex items-center justify-center gap-2 mb-2">
                 {[1, 2, 3, 4].map((step) => (
                     <React.Fragment key={step}>
                         <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentStep >= step ? 'bg-[#ef4444]' : 'bg-slate-200'}`}></div>
                         {step < 4 && (
                             <div className={`h-1 w-16 lg:w-24 rounded-full transition-colors duration-300 ${currentStep > step ? 'bg-[#ef4444]' : 'bg-slate-100'}`}></div>
                         )}
                     </React.Fragment>
                 ))}
             </div>
             <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                 Step {currentStep} of 4
             </p>
         </div>

         {/* Scrollable Form Area */}
         <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="min-h-full flex flex-col justify-center px-6 lg:px-16 py-4">
                 <div className="max-w-2xl w-full mx-auto space-y-6 pb-6">
                 
                 {/* STEP 1: VERIFICATION */}
                 {currentStep === 1 && (
                     <div className="animate-fade-in-up space-y-6">
                         <div>
                             <h2 className="text-3xl font-bold text-slate-800 mb-2">Identity Verification</h2>
                             <p className="text-slate-500">Enter your LCR or PWD ID number to check for existing records.</p>
                         </div>

                         <form onSubmit={handleVerify} className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="e.g. LCR-2024-001"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-100 rounded-[2rem] border-none focus:ring-2 focus:ring-[#ef4444] transition-all outline-none font-medium text-slate-800 text-lg placeholder:text-slate-400"
                                    value={searchId}
                                    onChange={(e) => {
                                        setSearchId(e.target.value);
                                        setVerificationStatus('idle');
                                    }}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={!searchId || verificationStatus === 'searching'}
                                className="w-full py-4 bg-slate-800 text-white rounded-[2rem] font-bold text-lg hover:bg-slate-900 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {verificationStatus === 'searching' ? 'Checking Database...' : 'Check ID Number'}
                            </button>
                         </form>

                         {/* 1. Found Record Display */}
                         {verificationStatus === 'found' && foundRecord && (
                            <div className={`border rounded-3xl p-6 animate-scale-up ${
                                foundRecord.isRegistered 
                                ? 'bg-emerald-50 border-emerald-200' // Green (Registered)
                                : isEligible 
                                  ? 'bg-amber-50 border-amber-200' // Yellow (Eligible)
                                  : 'bg-red-50 border-red-200' // Red (Not Eligible)
                            }`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-full ${
                                        foundRecord.isRegistered 
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : isEligible 
                                          ? 'bg-amber-100 text-amber-600'
                                          : 'bg-red-100 text-red-600'
                                    }`}>
                                        {foundRecord.isRegistered ? <CheckCircle2 size={24} /> : isEligible ? <Star size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${
                                            foundRecord.isRegistered ? 'text-emerald-900' : isEligible ? 'text-amber-900' : 'text-red-900'
                                        }`}>
                                            {foundRecord.isRegistered ? 'Account Exists' : isEligible ? 'Record Found' : 'Not Eligible'}
                                        </h3>
                                        <p className={`text-sm ${
                                            foundRecord.isRegistered ? 'text-emerald-700' : isEligible ? 'text-amber-700' : 'text-red-700'
                                        }`}>
                                            {foundRecord.isRegistered 
                                                ? 'This ID is already associated with an account.' 
                                                : isEligible 
                                                  ? 'Your record was found and you are eligible.' 
                                                  : 'You do not meet the age requirement.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/60 rounded-2xl p-4 mb-4 space-y-2">
                                    <p className="font-bold text-slate-800 text-lg">{foundRecord.firstName} {foundRecord.lastName}</p>
                                    <p className="text-slate-500 text-sm flex items-center gap-2"><MapPin size={14}/> {foundRecord.address}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                                            isEligible ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {isEligible ? <Star size={12} /> : <AlertCircle size={12} />} 
                                            Age: {calculatedAge} years old
                                        </span>
                                    </div>
                                </div>
                                
                                {foundRecord.isRegistered ? (
                                    <button 
                                        onClick={() => navigate('/', { state: { openLogin: true } })}
                                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                                    >
                                        <LogIn size={18} /> Login to your account
                                    </button>
                                ) : isEligible ? (
                                    <p className="text-sm text-amber-800 text-center font-medium bg-amber-100/50 p-2 rounded-xl">
                                        Please proceed by clicking <strong>Next</strong> below.
                                    </p>
                                ) : (
                                    <div className="text-center text-red-800 font-medium bg-red-100/50 p-3 rounded-xl flex items-center justify-center gap-2">
                                        <XCircle size={16} /> Minimum age requirement is 60.
                                    </div>
                                )}
                            </div>
                         )}

                         {/* 2. Not Found Display (RED) */}
                         {verificationStatus === 'not-found' && (
                             <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center animate-scale-up">
                                 <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                     <XCircle size={24} />
                                 </div>
                                 <h3 className="font-bold text-red-900">Record Not Found</h3>
                                 <p className="text-red-700 text-sm mb-4">We couldn't find ID <strong>{searchId}</strong> in the masterlist.</p>
                                 <p className="text-sm text-red-600 bg-white/50 p-3 rounded-xl border border-red-100">
                                     You can proceed with <strong>Manual Registration</strong> by clicking the button below.
                                 </p>
                             </div>
                         )}

                         {/* Test Data Display for Demo */}
                         <div className="mt-8 pt-6 border-t border-slate-100">
                             <div className="flex items-center gap-2 mb-4">
                                 <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                                    <Info size={16} />
                                 </div>
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Data: Available Records</span>
                             </div>
                             <div className="grid gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                 {registryRecords.map((record) => {
                                     const recAge = calculateAge(record.birthDate);
                                     const recEligible = recAge >= 60;
                                     // Green: Registered
                                     // Yellow: !Registered & Eligible
                                     // Red: !Registered & !Eligible
                                     let borderClass = '';
                                     let bgClass = '';
                                     let textClass = '';
                                     let badgeClass = '';

                                     if (record.isRegistered) {
                                         borderClass = 'border-emerald-200 hover:border-emerald-300';
                                         bgClass = 'bg-emerald-50';
                                         textClass = 'text-emerald-900';
                                         badgeClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                                     } else if (recEligible) {
                                         borderClass = 'border-amber-200 hover:border-amber-300';
                                         bgClass = 'bg-amber-50';
                                         textClass = 'text-amber-900';
                                         badgeClass = 'bg-amber-100 text-amber-700 border-amber-200';
                                     } else {
                                         borderClass = 'border-red-200 hover:border-red-300';
                                         bgClass = 'bg-red-50';
                                         textClass = 'text-red-900';
                                         badgeClass = 'bg-red-100 text-red-700 border-red-200';
                                     }

                                     return (
                                        <button 
                                            key={record.id}
                                            onClick={() => {
                                                setSearchId(record.id);
                                                setVerificationStatus('idle');
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all group text-left w-full ${borderClass} ${bgClass}`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${badgeClass}`}>
                                                        {record.id}
                                                    </span>
                                                    {record.isRegistered ? (
                                                         <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={10} /> Reg</span>
                                                    ) : recEligible ? (
                                                         <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><Star size={10} /> Eligible</span>
                                                    ) : (
                                                         <span className="text-[10px] font-bold text-red-600 flex items-center gap-1"><XCircle size={10} /> Ineligible</span>
                                                    )}
                                                </div>
                                                <div className={`text-xs font-medium ${textClass}`}>
                                                    {record.firstName} {record.lastName} • {recAge} y/o
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 text-xs font-bold">
                                                Use
                                            </div>
                                        </button>
                                     );
                                 })}
                                 {/* Manual Not Found Button */}
                                 <button 
                                    onClick={() => {
                                        setSearchId('UNKNOWN-ID-999');
                                        setVerificationStatus('idle');
                                    }}
                                    className="flex items-center justify-between p-3 rounded-xl border border-red-200 bg-red-50 hover:border-red-300 transition-all group text-left w-full"
                                 >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded border bg-red-100 text-red-700 border-red-200">
                                                UNKNOWN-ID-999
                                            </span>
                                            <span className="text-[10px] font-bold text-red-600 flex items-center gap-1"><XCircle size={10} /> Not Found</span>
                                        </div>
                                        <div className="text-xs font-medium text-red-900">
                                            Test "Not Found" Scenario
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 text-xs font-bold">
                                        Test
                                    </div>
                                 </button>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* STEP 2: PERSONAL INFO */}
                 {currentStep === 2 && (
                     <div className="animate-fade-in-up space-y-5">
                         <div>
                             <h2 className="text-3xl font-bold text-slate-800 mb-2">Personal na Impormasyon</h2>
                             <p className="text-slate-500">Please provide your personal details exactly as they appear on your birth certificate.</p>
                         </div>
                         
                         <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Unang Pangalan (First Name)</label>
                                     <input 
                                         type="text" 
                                         name="firstName"
                                         value={formData.firstName}
                                         onChange={handleInputChange}
                                         readOnly={verificationStatus === 'found'}
                                         className={`w-full px-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`}
                                         placeholder="Juan"
                                     />
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Apelyido (Last Name)</label>
                                     <input 
                                         type="text" 
                                         name="lastName"
                                         value={formData.lastName}
                                         onChange={handleInputChange}
                                         readOnly={verificationStatus === 'found'}
                                         className={`w-full px-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`}
                                         placeholder="Dela Cruz"
                                     />
                                 </div>
                             </div>

                             <div className="space-y-1">
                                 <label className="text-sm font-bold text-slate-700 ml-2">Gitnang Pangalan (Middle Name)</label>
                                 <input 
                                     type="text" 
                                     name="middleName"
                                     value={formData.middleName}
                                     onChange={handleInputChange}
                                     className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all"
                                     placeholder="Santos"
                                 />
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Petsa ng Kapanganakan</label>
                                     <div className="relative">
                                         <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                         <input 
                                             type="date" 
                                             name="birthDate"
                                             value={formData.birthDate}
                                             onChange={handleInputChange}
                                             readOnly={verificationStatus === 'found'}
                                             className={`w-full pl-12 pr-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`}
                                         />
                                     </div>
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Lugar ng Kapanganakan</label>
                                     <input 
                                         type="text" 
                                         name="birthPlace"
                                         value={formData.birthPlace}
                                         onChange={handleInputChange}
                                         className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all"
                                         placeholder="City, Province"
                                     />
                                 </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Kasarian (Sex)</label>
                                     <div className="relative">
                                         <select 
                                             name="sex"
                                             value={formData.sex}
                                             onChange={handleInputChange}
                                             disabled={verificationStatus === 'found'}
                                             className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 appearance-none transition-all cursor-pointer"
                                         >
                                             <option>Male</option>
                                             <option>Female</option>
                                         </select>
                                         <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                     </div>
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Katayuang Sibil</label>
                                     <div className="relative">
                                         <select 
                                             name="civilStatus"
                                             value={formData.civilStatus}
                                             onChange={handleInputChange}
                                             disabled={verificationStatus === 'found'}
                                             className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 appearance-none transition-all cursor-pointer"
                                         >
                                             <option>Single</option>
                                             <option>Married</option>
                                             <option>Widowed</option>
                                             <option>Separated</option>
                                         </select>
                                         <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* STEP 3: CONTACT & ACCOUNT */}
                 {currentStep === 3 && (
                     <div className="animate-fade-in-up space-y-5">
                         <div>
                             <h2 className="text-3xl font-bold text-slate-800 mb-2">Impormasyon sa Pakikipag-ugnayan</h2>
                             <p className="text-slate-500">Provide your current address and contact details.</p>
                         </div>
                         
                         <div className="space-y-4">
                             <div className="space-y-1">
                                 <label className="text-sm font-bold text-slate-700 ml-2">Kasalukuyang Tirahan (Address)</label>
                                 <div className="relative">
                                     <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                     <input 
                                         type="text" 
                                         name="address"
                                         value={formData.address}
                                         onChange={handleInputChange}
                                         readOnly={verificationStatus === 'found'}
                                         className={`w-full pl-12 pr-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`}
                                         placeholder="House No., Street, Barangay"
                                     />
                                 </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Numero ng Telepono</label>
                                     <div className="relative">
                                         <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                         <input 
                                             type="tel" 
                                             name="contactNumber"
                                             value={formData.contactNumber}
                                             onChange={handleInputChange}
                                             className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all"
                                             placeholder="0912 345 6789"
                                         />
                                     </div>
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Email Address</label>
                                     <div className="relative">
                                         <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                         <input 
                                             type="email" 
                                             name="email"
                                             value={formData.email}
                                             onChange={handleInputChange}
                                             className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all"
                                             placeholder="juan@example.com"
                                         />
                                     </div>
                                 </div>
                             </div>
                            
                             <div className="bg-red-50 p-4 rounded-3xl border border-red-100 space-y-4">
                                 <h4 className="font-bold text-red-800 flex items-center gap-2 text-sm">
                                     <Heart size={16} className="fill-red-800" /> In Case of Emergency
                                 </h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div className="space-y-1">
                                         <label className="text-xs font-bold text-red-700 ml-2 uppercase">Contact Person</label>
                                         <input 
                                             type="text" 
                                             name="emergencyContactName"
                                             value={formData.emergencyContactName}
                                             onChange={handleInputChange}
                                             className="w-full px-5 py-2 rounded-xl bg-white border border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-slate-800 text-sm"
                                             placeholder="Name of relative"
                                         />
                                     </div>
                                     <div className="space-y-1">
                                         <label className="text-xs font-bold text-red-700 ml-2 uppercase">Emergency Number</label>
                                         <input 
                                             type="tel" 
                                             name="emergencyContactNumber"
                                             value={formData.emergencyContactNumber}
                                             onChange={handleInputChange}
                                             className="w-full px-5 py-2 rounded-xl bg-white border border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-slate-800 text-sm"
                                             placeholder="0912 345 6789"
                                         />
                                     </div>
                                 </div>
                             </div>

                             <div className="space-y-1 pt-2 border-t border-slate-100">
                                 <label className="text-sm font-bold text-slate-700 ml-2">Create Password</label>
                                 <div className="relative">
                                     <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                     <input 
                                         type="password" 
                                         name="password"
                                         value={formData.password}
                                         onChange={handleInputChange}
                                         className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all"
                                         placeholder="At least 6 characters"
                                     />
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* STEP 4: DOCUMENTS & TERMS */}
                 {currentStep === 4 && (
                     <div className="animate-fade-in-up space-y-8">
                         <div>
                             <h2 className="text-3xl font-bold text-slate-800 mb-2">Requirements & Submission</h2>
                             <p className="text-slate-500">Upload verification documents and review terms.</p>
                         </div>

                         <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:border-[#ef4444] hover:bg-red-50/30 transition-all cursor-pointer relative group">
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                {file ? <FileCheck className="text-emerald-500" size={32} /> : <Upload size={32} />}
                            </div>
                            {file ? (
                                <div>
                                    <p className="font-bold text-emerald-600 text-lg">{file}</p>
                                    <p className="text-slate-400 text-sm">Click to change file</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-bold text-slate-700 text-lg">Upload Birth Certificate</p>
                                    <p className="text-slate-400 text-sm mt-1">or Valid Government ID (JPG, PNG, PDF)</p>
                                </div>
                            )}
                         </div>

                         <div className="bg-slate-50 p-6 rounded-3xl flex items-start gap-4">
                            <div className="pt-1">
                                <input 
                                    type="checkbox" 
                                    id="terms"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-5 h-5 text-[#ef4444] rounded focus:ring-[#ef4444] border-gray-300"
                                />
                            </div>
                            <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
                                <span className="font-bold text-slate-800 block mb-1 flex items-center gap-2"><ShieldCheck size={16}/> Data Privacy & Consent</span>
                                I certify that the information provided is true and correct. I have read and agree to the <span onClick={(e) => {e.preventDefault(); setShowTerms(true)}} className="text-[#ef4444] font-bold hover:underline">Terms and Conditions</span> and <span className="text-[#ef4444] font-bold hover:underline">Privacy Policy</span>.
                            </label>
                         </div>
                     </div>
                 )}
                 </div>
             </div>
         </div>

         {/* Bottom Navigation */}
         {showBottomNav && (
             <div className="bg-white border-t border-slate-100 p-4 lg:px-16 flex items-center justify-between shrink-0 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                 <div className="hidden sm:flex gap-6 text-sm font-bold text-slate-300 select-none">
                     <span className={`transition-colors ${currentStep === 1 ? 'text-[#ef4444]' : 'text-slate-800'}`}>1</span>
                     <span className={`transition-colors ${currentStep === 2 ? 'text-[#ef4444]' : currentStep > 2 ? 'text-slate-800' : ''}`}>2</span>
                     <span className={`transition-colors ${currentStep === 3 ? 'text-[#ef4444]' : currentStep > 3 ? 'text-slate-800' : ''}`}>3</span>
                     <span className={`transition-colors ${currentStep === 4 ? 'text-[#ef4444]' : ''}`}>4</span>
                 </div>

                 <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                     <button 
                        onClick={prevStep} 
                        disabled={currentStep === 1}
                        className={`text-slate-500 font-bold hover:text-slate-800 px-4 py-2 rounded-xl transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                     >
                         Back
                     </button>
                     
                     <button
                         onClick={nextStep}
                         // Disabled if Step 1 (controlled by showBottomNav visibility really, but for safety)
                         disabled={(currentStep === 1 && !canProceedStep1)}
                         className={`font-bold flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg ${
                            currentStep === 4 
                            ? (agreed && !submitted ? 'bg-[#ef4444] text-white hover:bg-red-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none')
                            : 'text-[#ef4444] hover:bg-red-50'
                         }`}
                     >
                         {currentStep === 4 ? (submitted ? 'Processing...' : 'Submit Application') : (currentStep === 1 && verificationStatus === 'not-found' ? 'Proceed Manually' : 'Next')} 
                         {currentStep < 4 && <ArrowLeft className="rotate-180" size={20} />}
                     </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};
