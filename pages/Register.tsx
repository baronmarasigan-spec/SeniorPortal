import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, Calendar, MapPin, Upload, FileCheck, Search, 
  ArrowLeft, AlertCircle, CheckCircle2, ArrowRight, Star,
  Phone, Heart, X, FileText, Key, Mail, ShieldCheck, Info,
  LogIn, XCircle, Home, Banknote, Stethoscope, PenTool, Eraser, Paperclip
} from 'lucide-react';
import { RegistryRecord } from '../types';

// Structured Data for Metro Manila
const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "San Juan": {
    "District 1": ["Balong-Bato", "Batis", "Corazon de Jesus", "Ermitaño", "Pasadeña", "Pedro Cruz", "Progreso", "Rivera", "Salapan", "San Perfecto"],
    "District 2": ["Addition Hills", "Greenhills", "Isabelita", "Kabayanan", "Little Baguio", "Maytunas", "Onse", "Saint Joseph", "Sta. Lucia", "Tibagan", "West Crame"]
  },
  "Manila": {
    "District 1": ["Tondo I"],
    "District 2": ["Tondo II"],
    "District 3": ["Binondo", "Quiapo", "San Nicolas"],
    "District 4": ["Sampaloc"],
    "District 5": ["Ermita", "Malate", "Paco"],
    "District 6": ["Santa Ana", "Santa Mesa"]
  },
  "Quezon City": {
    "District 1": ["Bahay Toro", "Katipunan", "Mariblo"],
    "District 2": ["Batasan Hills", "Commonwealth", "Holy Spirit"],
    "District 3": ["E. Rodriguez", "East Kamias", "West Kamias"],
    "District 4": ["Kristong Hari", "U.P. Village", "Teachers Village"],
    "District 5": ["Bagbag", "Greater Lagro", "Gulod"],
    "District 6": ["Apolonio Samson", "Baesa", "Tandang Sora"]
  },
  "Caloocan": {
    "District 1": ["Barangay 1", "Barangay 2", "Barangay 77"],
    "District 2": ["Barangay 86", "Barangay 100"]
  },
  "Las Piñas": { "Lone District": ["Almanza Uno", "Pamplona Uno", "Talon Uno"] },
  "Makati": { "District 1": ["Bel-Air", "Poblacion"], "District 2": ["Cembo", "Pembo"] },
  "Malabon": { "District 1": ["Baritan"], "District 2": ["Acacia"] },
  "Mandaluyong": { "District 1": ["Addition Hills", "Wack-Wack"], "District 2": ["Barangka", "Plainview"] },
  "Marikina": { "District 1": ["Barangka"], "District 2": ["Concepcion Uno"] },
  "Muntinlupa": { "District 1": ["Alabang"], "District 2": ["Ayala Alabang"] },
  "Navotas": { "Lone District": ["Bagumbayan", "Navotas East"] },
  "Parañaque": { "District 1": ["Baclaran"], "District 2": ["BF Homes"] },
  "Pasay": { "Lone District": ["Barangay 1", "Barangay 2"] },
  "Pasig": { "District 1": ["Bagong Ilog"], "District 2": ["Manggahan"] },
  "Pateros": { "Lone District": ["Aguho", "Magtanggol"] },
  "Taguig": { "District 1": ["Bagumbayan"], "District 2": ["Central Signal Village"] },
  "Valenzuela": { "District 1": ["Arkong Bato"], "District 2": ["Bagbaguin"] },
};

const METRO_MANILA_CITIES = Object.keys(LOCATION_DATA).sort();

const LIVING_ARRANGEMENTS = [
  'Owned',
  'Rent',
  'Living with Relatives'
];

const ACCEPTED_DOCUMENTS = [
  "Birth Certificate", "Philippine Passport", "National ID", "Government-issued ID", 
  "Driver’s License", "PhilHealth ID", "Voter’s ID", "Postal ID", "BIR ID", 
  "Barangay ID", "UMID", "Dual Citizenship proof", 
  "Citizenship Retention and Re-Acquisition (RA 9225)", 
  "Identification Certificate (Consulate)", "Oath of Allegiance"
];

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

const SuccessModal = ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-20 p-8 flex flex-col items-center text-center animate-scale-up">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Registration Submitted!</h3>
        <p className="text-slate-600 mb-8 leading-relaxed font-medium">
          {message}
        </p>
        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { verifyIdentity, registryRecords } = useApp();
  
  // Steps: 1=Verify, 2=Personal, 3=Contact/Eco/Health, 4=Docs/Terms
  const [currentStep, setCurrentStep] = useState(1);
  const [searchId, setSearchId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
  const [foundRecord, setFoundRecord] = useState<RegistryRecord | null>(null);
  const [calculatedAge, setCalculatedAge] = useState<number>(0);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    citizenship: '',
    birthDate: '',
    birthPlace: '',
    sex: '',
    civilStatus: '',
    livingArrangement: '',
    livingArrangementSpecific: '',
    
    // Address Breakdown
    province: 'Metro Manila',
    city: '',
    district: '',
    barangay: '',
    street: '',
    houseNo: '',

    email: '',
    contactNumber: '',
    
    // Economic Status
    isPensioner: '', // Yes, No
    pensionAmount: '',
    pensionSourceGSIS: false,
    pensionSourceSSS: false,
    pensionSourceAFSPLAI: false,
    pensionSourceOthers: false,
    pensionSourceOthersDetail: '',
    
    hasPermanentIncome: '', // Yes, No
    incomeSource: '',
    
    hasRegularSupport: '', // Yes, No
    supportType: '', // Cash, In Kind
    supportDetails: '', // amount/frequency or kind details

    // Health Condition
    hasIllness: '', // Yes, No
    illnessDetails: '',
    hospitalized: '', // Yes, No

    // Signature
    applicantSignature: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Signature Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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

  // Restore signature on mount of Step 4
  useEffect(() => {
    if (currentStep === 4 && canvasRef.current && formData.applicantSignature) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx?.drawImage(img, 0, 0);
        };
        img.src = formData.applicantSignature;
    }
  }, [currentStep]);

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
                    suffix: record.suffix || '',
                    citizenship: '',
                    birthDate: record.birthDate,
                    birthPlace: record.birthPlace || '',
                    sex: record.sex || '',
                    civilStatus: record.civilStatus || '',
                    
                    // Address Auto-fill
                    city: record.city || '',
                    district: record.district || '',
                    barangay: record.barangay || '',
                    street: record.street || '',
                    houseNo: record.houseNo || '',
                }));
            }
        } else {
            setVerificationStatus('not-found');
        }
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        if (name === 'city') {
            newData.district = '';
            newData.barangay = '';
        } else if (name === 'district') {
            newData.barangay = '';
        }
        return newData;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- Signature Logic ---
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = (event as React.MouseEvent).clientX;
        clientY = (event as React.MouseEvent).clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0f172a'; // slate-900
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
        setIsDrawing(false);
        const dataUrl = canvasRef.current.toDataURL();
        setFormData(prev => ({ ...prev, applicantSignature: dataUrl }));
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setFormData(prev => ({ ...prev, applicantSignature: '' }));
    }
  };
  // ---------------------

  const handleSubmit = () => {
    setSubmitted(true);
    // Simulate auto-email/SMS trigger
    console.log(`Sending auto-notification to ${formData.email} / ${formData.contactNumber}`);
    
    setTimeout(() => {
      setShowSuccess(true);
    }, 2000);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1);
    if (currentStep === 4) handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const canProceedStep1 = (verificationStatus === 'found' && foundRecord && !foundRecord.isRegistered && isEligible) || 
                          (verificationStatus === 'not-found');

  const showBottomNav = currentStep > 1 || canProceedStep1;

  // Helper to get available options based on state
  const availableDistricts = formData.city ? (LOCATION_DATA[formData.city] ? Object.keys(LOCATION_DATA[formData.city]) : []) : [];
  const availableBarangays = (formData.city && formData.district && LOCATION_DATA[formData.city]?.[formData.district]) ? LOCATION_DATA[formData.city][formData.district] : [];

  const termsContent = (
    <div className="space-y-6 text-slate-600 leading-relaxed font-light">
        {/* ... (Existing Terms Content) ... */}
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

      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => navigate('/')} 
        message="You’re registered! Please wait for approval. We will email your credentials once your application is approved." 
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
                         {/* ... (Step 1 Content) ... */}
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
                         {/* ... (Verification Status Blocks) ... */}
                         {verificationStatus === 'found' && foundRecord && (
                            <div className={`border rounded-3xl p-6 animate-scale-up ${foundRecord.isRegistered ? 'bg-emerald-50 border-emerald-200' : isEligible ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-full ${foundRecord.isRegistered ? 'bg-emerald-100 text-emerald-600' : isEligible ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                        {foundRecord.isRegistered ? <CheckCircle2 size={24} /> : isEligible ? <Star size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${foundRecord.isRegistered ? 'text-emerald-900' : isEligible ? 'text-amber-900' : 'text-red-900'}`}>
                                            {foundRecord.isRegistered ? 'Account Exists' : isEligible ? 'Record Found' : 'Not Eligible'}
                                        </h3>
                                        <p className={`text-sm ${foundRecord.isRegistered ? 'text-emerald-700' : isEligible ? 'text-amber-700' : 'text-red-700'}`}>
                                            {foundRecord.isRegistered ? 'This ID is already associated with an account.' : isEligible ? 'Your record was found and you are eligible.' : 'You do not meet the age requirement.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/60 rounded-2xl p-4 mb-4 space-y-2">
                                    <p className="font-bold text-slate-800 text-lg">{foundRecord.firstName} {foundRecord.lastName}</p>
                                    <p className="text-slate-500 text-sm flex items-center gap-2"><MapPin size={14}/> {foundRecord.address || `${foundRecord.street}, ${foundRecord.city}`}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isEligible ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                            {isEligible ? <Star size={12} /> : <AlertCircle size={12} />} Age: {calculatedAge} years old
                                        </span>
                                    </div>
                                </div>
                                {foundRecord.isRegistered ? (
                                    <button onClick={() => navigate('/', { state: { openLogin: true } })} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"><LogIn size={18} /> Login to your account</button>
                                ) : isEligible ? (
                                    <p className="text-sm text-amber-800 text-center font-medium bg-amber-100/50 p-2 rounded-xl">Please proceed by clicking <strong>Next</strong> below.</p>
                                ) : (
                                    <div className="text-center text-red-800 font-medium bg-red-100/50 p-3 rounded-xl flex items-center justify-center gap-2"><XCircle size={16} /> Minimum age requirement is 60.</div>
                                )}
                            </div>
                         )}

                         {verificationStatus === 'not-found' && (
                             <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center animate-scale-up">
                                 <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3"><XCircle size={24} /></div>
                                 <h3 className="font-bold text-red-900">Record Not Found</h3>
                                 <p className="text-red-700 text-sm mb-4">We couldn't find ID <strong>{searchId}</strong> in the masterlist.</p>
                                 <p className="text-sm text-red-600 bg-white/50 p-3 rounded-xl border border-red-100">You can proceed with <strong>Manual Registration</strong> by clicking the button below.</p>
                             </div>
                         )}
                         
                         {/* Test Data */}
                         <div className="mt-8 pt-6 border-t border-slate-100">
                             <div className="flex items-center gap-2 mb-4"><div className="p-1.5 bg-slate-100 rounded-lg text-slate-500"><Info size={16} /></div><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Data: Available Records</span></div>
                             <div className="grid gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                 {registryRecords.map((record) => (
                                     <button key={record.id} onClick={() => { setSearchId(record.id); setVerificationStatus('idle'); }} className="flex items-center justify-between p-3 rounded-xl border transition-all group text-left w-full hover:bg-slate-50">
                                         <div>
                                            <div className="flex items-center gap-2 mb-1"><span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-600">{record.id}</span></div>
                                            <div className="text-xs font-medium text-slate-800">{record.firstName} {record.lastName}</div>
                                         </div>
                                         <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 text-xs font-bold">Use</div>
                                     </button>
                                 ))}
                                 <button onClick={() => { setSearchId('UNKNOWN-ID-999'); setVerificationStatus('idle'); }} className="flex items-center justify-between p-3 rounded-xl border border-red-200 bg-red-50 hover:border-red-300 transition-all group text-left w-full">
                                    <div><div className="flex items-center gap-2 mb-1"><span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded border bg-red-100 text-red-700">UNKNOWN-ID-999</span></div><div className="text-xs font-medium text-red-900">Test "Not Found"</div></div>
                                 </button>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* STEP 2: PERSONAL & CONTACT INFO */}
                 {currentStep === 2 && (
                     <div className="animate-fade-in-up space-y-5">
                         {/* ... (Step 2 Content same as before) ... */}
                         <div>
                             <h2 className="text-3xl font-bold text-slate-800 mb-2">Personal & Contact Info</h2>
                             <p className="text-slate-500">Please provide your personal details and current contact information.</p>
                         </div>
                         <div className="space-y-4">
                             {/* PERSONAL FIELDS */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Pangalan (First Name)</label>
                                     <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} readOnly={verificationStatus === 'found'} className={`w-full px-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`} placeholder="Juan" />
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Apelyido (Last Name)</label>
                                     <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} readOnly={verificationStatus === 'found'} className={`w-full px-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`} placeholder="Dela Cruz" />
                                 </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700 ml-2">Gitnang Pangalan (Middle Name)</label>
                                    <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all" placeholder="Santos" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700 ml-2">Hulapi (Suffix)</label>
                                    <input type="text" name="suffix" value={formData.suffix} onChange={handleInputChange} readOnly={verificationStatus === 'found' && !!formData.suffix} className={`w-full px-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' && formData.suffix ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`} placeholder="" />
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Petsa ng Kapanganakan (Birth Date)</label>
                                     <div className="relative"><Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} readOnly={verificationStatus === 'found'} className={`w-full pl-12 pr-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`} /></div>
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Lugar ng Kapanganakan (Birth Place)</label>
                                     <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} readOnly={verificationStatus === 'found' && !!formData.birthPlace} className={`w-full px-6 py-3 rounded-full border-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all ${verificationStatus === 'found' && formData.birthPlace ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-800'}`} placeholder="City, Province" />
                                 </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Kasarian (Sex)</label>
                                     <div className="relative">
                                         <select name="sex" value={formData.sex} onChange={handleInputChange} disabled={verificationStatus === 'found'} className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 appearance-none transition-all cursor-pointer">
                                             <option value="" disabled>Select Sex</option><option>Male</option><option>Female</option>
                                         </select>
                                         <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                     </div>
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 ml-2">Katayuang Sibil (Civil Status)</label>
                                     <div className="relative">
                                         <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} disabled={verificationStatus === 'found'} className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 appearance-none transition-all cursor-pointer">
                                             <option value="" disabled>Select Status</option><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                                         </select>
                                         <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                     </div>
                                 </div>
                             </div>

                             {/* MOVED ADDRESS & CONTACT SECTION */}
                             <div className="pt-2 md:col-span-2">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-lg">
                                    <MapPin size={20} className="text-primary-600" /> Address & Contact Details
                                </h3>
                                
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 relative mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Lalawigan (Province)</label>
                                            <div className="relative">
                                                <input type="text" value="Metro Manila" readOnly className="w-full px-4 py-2.5 rounded-xl bg-slate-200 border border-slate-300 text-slate-600 font-bold" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Lungsod/Bayan (City)</label>
                                            <div className="relative">
                                                <select name="city" value={formData.city} onChange={handleAddressChange} disabled={verificationStatus === 'found'} className={`w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 appearance-none ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : ''}`}>
                                                    <option value="" disabled>Select City</option>
                                                    {METRO_MANILA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={14} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Distrito (District)</label>
                                            <div className="relative">
                                                <select name="district" value={formData.district} onChange={handleAddressChange} disabled={!formData.city || verificationStatus === 'found'} className={`w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 appearance-none disabled:bg-slate-100 disabled:text-slate-400 ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : ''}`}>
                                                    <option value="" disabled>Select District</option>
                                                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={14} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Barangay</label>
                                            <div className="relative">
                                                <select name="barangay" value={formData.barangay} onChange={handleInputChange} disabled={!formData.district || verificationStatus === 'found'} className={`w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 appearance-none disabled:bg-slate-100 disabled:text-slate-400 ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : ''}`}>
                                                    <option value="" disabled>Select Barangay</option>
                                                    {availableBarangays.map(b => <option key={b} value={b}>{b}</option>)}
                                                </select>
                                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={14} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Kalye (Street)</label>
                                            <input type="text" name="street" value={formData.street} onChange={handleInputChange} readOnly={verificationStatus === 'found'} className={`w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : ''}`} placeholder="" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Numero ng Bahay</label>
                                            <input type="text" name="houseNo" value={formData.houseNo} onChange={handleInputChange} readOnly={verificationStatus === 'found'} className={`w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500' : ''}`} placeholder="" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700 ml-2">Numero ng Telepono</label>
                                        <div className="relative"><Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all" placeholder="0912 345 6789" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700 ml-2">Email Address</label>
                                        <div className="relative"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all" placeholder="juan@example.com" /></div>
                                    </div>
                                </div>
                             </div>

                             <div className="space-y-1">
                                 <label className="text-sm font-bold text-slate-700 ml-2">Pagkamamamayan (Citizenship)</label>
                                 <input type="text" name="citizenship" value={formData.citizenship} onChange={handleInputChange} className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all" placeholder="" />
                             </div>
                             <div className="space-y-1">
                                 <label className="text-sm font-bold text-slate-700 ml-2">Kasama sa Bahay (Living Arrangement)</label>
                                 <div className="relative">
                                     <select 
                                         name="livingArrangement"
                                         value={formData.livingArrangement}
                                         onChange={handleInputChange}
                                         className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 appearance-none transition-all cursor-pointer"
                                     >
                                         <option value="" disabled>Select Arrangement</option>
                                         {LIVING_ARRANGEMENTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                     </select>
                                     <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                 </div>
                             </div>
                             {formData.livingArrangement === 'Other' && (
                                <div className="space-y-1 animate-fade-in-up">
                                    <label className="text-sm font-bold text-slate-700 ml-2">Pakitukoy (Please specify)</label>
                                    <input 
                                        type="text" 
                                        name="livingArrangementSpecific"
                                        value={formData.livingArrangementSpecific}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-3 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-[#ef4444] outline-none text-slate-800 transition-all"
                                        placeholder="Specify living arrangement"
                                    />
                                </div>
                             )}
                         </div>
                     </div>
                 )}

                 {/* STEP 3: SOCIO-ECONOMIC & HEALTH (Renamed & Reduced) */}
                 {currentStep === 3 && (
                     <div className="animate-fade-in-up space-y-5">
                         {/* ... (Step 3 Content) ... */}
                         <div>
                             <h2 className="text-3xl font-bold text-slate-800 mb-2">Socio-Economic & Health</h2>
                             <p className="text-slate-500">Provide details about your economic status and health condition.</p>
                         </div>
                         <div className="space-y-6">
                             {/* ... (Address Section REMOVED) ... */}
                             {/* ... (Contact Info REMOVED) ... */}
                             
                             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Banknote size={18} className="text-primary-600" /> Economic Status</h3>
                                <div className="space-y-2">
                                   <label className="text-sm font-bold text-slate-700">Pensioner?</label>
                                   <div className="flex gap-6">
                                       {['Yes', 'No'].map(opt => (
                                           <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                               <input type="radio" name="isPensioner" value={opt} checked={formData.isPensioner === opt} onChange={handleInputChange} className="w-4 h-4 text-primary-600 focus:ring-primary-600 border-gray-300" />
                                               <span className="text-slate-700">{opt}</span>
                                           </label>
                                       ))}
                                   </div>
                                </div>
                                {formData.isPensioner === 'Yes' && (
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 animate-fade-in-up">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">How much? (Monthly)</label>
                                            <input type="text" name="pensionAmount" value={formData.pensionAmount} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Amount" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Source</label>
                                            <div className="flex flex-wrap gap-4">
                                                {['GSIS', 'SSS', 'AFSPLAI'].map(src => (
                                                    <label key={src} className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" name={`pensionSource${src}`} checked={(formData as any)[`pensionSource${src}`]} onChange={handleCheckboxChange} className="w-4 h-4 text-primary-600 rounded border-gray-300" />
                                                        <span className="text-slate-700 text-sm">{src}</span>
                                                    </label>
                                                ))}
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                     <input type="checkbox" name="pensionSourceOthers" checked={formData.pensionSourceOthers} onChange={handleCheckboxChange} className="w-4 h-4 text-primary-600 rounded border-gray-300" />
                                                     <span className="text-slate-700 text-sm">Others</span>
                                                </label>
                                                {formData.pensionSourceOthers && (
                                                    <input type="text" name="pensionSourceOthersDetail" value={formData.pensionSourceOthersDetail} onChange={handleInputChange} className="px-2 py-1 rounded border border-slate-200 text-sm" placeholder="Specify" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2 pt-2">
                                   <label className="text-sm font-bold text-slate-700">Permanent Source of Income?</label>
                                   <div className="flex gap-6">
                                       {['Yes', 'No'].map(opt => (
                                           <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                               <input type="radio" name="hasPermanentIncome" value={opt} checked={formData.hasPermanentIncome === opt} onChange={handleInputChange} className="w-4 h-4 text-primary-600 focus:ring-primary-600 border-gray-300" />
                                               <span className="text-slate-700">{opt}</span>
                                           </label>
                                       ))}
                                   </div>
                                   {formData.hasPermanentIncome === 'Yes' && (
                                       <div className="mt-2 animate-fade-in-up">
                                           <input type="text" name="incomeSource" value={formData.incomeSource} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="From what source?" />
                                       </div>
                                   )}
                                </div>
                                <div className="space-y-2 pt-2">
                                   <label className="text-sm font-bold text-slate-700">Regular Support from Family?</label>
                                   <div className="flex gap-6">
                                       {['Yes', 'No'].map(opt => (
                                           <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                               <input type="radio" name="hasRegularSupport" value={opt} checked={formData.hasRegularSupport === opt} onChange={handleInputChange} className="w-4 h-4 text-primary-600 focus:ring-primary-600 border-gray-300" />
                                               <span className="text-slate-700">{opt}</span>
                                           </label>
                                       ))}
                                   </div>
                                   {formData.hasRegularSupport === 'Yes' && (
                                       <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 mt-2 animate-fade-in-up">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Type of Support</label>
                                            <div className="flex flex-col gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="supportType" value="Cash" checked={formData.supportType === 'Cash'} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                                                    <span className="text-sm text-slate-700">Cash</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="supportType" value="In Kind" checked={formData.supportType === 'In Kind'} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                                                    <span className="text-sm text-slate-700">In Kind</span>
                                                </label>
                                            </div>
                                            <input type="text" name="supportDetails" value={formData.supportDetails} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-primary-500 outline-none" placeholder={formData.supportType === 'Cash' ? "How much and how often?" : "Specify (e.g. Groceries)"} />
                                       </div>
                                   )}
                                </div>
                             </div>
                             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Stethoscope size={18} className="text-primary-600" /> Health Condition</h3>
                                <div className="space-y-2">
                                   <label className="text-sm font-bold text-slate-700">Has existing illness?</label>
                                   <div className="flex gap-6">
                                       {['Yes', 'No'].map(opt => (
                                           <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                               <input type="radio" name="hasIllness" value={opt} checked={formData.hasIllness === opt} onChange={handleInputChange} className="w-4 h-4 text-primary-600 focus:ring-primary-600 border-gray-300" />
                                               <span className="text-slate-700">{opt}</span>
                                           </label>
                                       ))}
                                   </div>
                                   {formData.hasIllness === 'Yes' && (
                                       <div className="mt-2 animate-fade-in-up">
                                           <input type="text" name="illnessDetails" value={formData.illnessDetails} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Please specify" />
                                       </div>
                                   )}
                                </div>
                                <div className="space-y-2 pt-2">
                                   <label className="text-sm font-bold text-slate-700">Hospitalized within the last six months?</label>
                                   <div className="flex gap-6">
                                       {['Yes', 'No'].map(opt => (
                                           <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                               <input type="radio" name="hospitalized" value={opt} checked={formData.hospitalized === opt} onChange={handleInputChange} className="w-4 h-4 text-primary-600 focus:ring-primary-600 border-gray-300" />
                                               <span className="text-slate-700">{opt}</span>
                                           </label>
                                       ))}
                                   </div>
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

                         {/* Accepted Docs List */}
                         <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                             <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><Info size={18} /> Accepted Documents</h3>
                             <p className="text-sm text-blue-700 mb-3">Please upload any of the following valid proofs:</p>
                             <div className="flex flex-wrap gap-2">
                                 {ACCEPTED_DOCUMENTS.map((doc, i) => (
                                     <span key={i} className="text-xs bg-white text-blue-800 px-3 py-1.5 rounded-full border border-blue-200 font-medium">
                                         {doc}
                                     </span>
                                 ))}
                             </div>
                         </div>

                         {/* File Upload - COMPACT VERSION */}
                         <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-[#ef4444] hover:bg-red-50/30 transition-all cursor-pointer relative group">
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                accept="image/*,.pdf" 
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            <div className="w-10 h-10 bg-white text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                <Upload size={20} />
                            </div>
                            <p className="font-bold text-slate-700 text-sm">Click to Upload Documents</p>
                            <p className="text-slate-400 text-xs mt-0.5">Multiple files allowed (JPG, PNG, PDF)</p>
                         </div>

                         {/* Uploaded File List */}
                         {uploadedFiles.length > 0 && (
                             <div className="space-y-2">
                                 <p className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-2">Attached Files ({uploadedFiles.length})</p>
                                 <div className="space-y-2">
                                     {uploadedFiles.map((fileName, idx) => (
                                         <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                             <div className="flex items-center gap-3">
                                                 <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                     <Paperclip size={16} />
                                                 </div>
                                                 <span className="text-sm font-medium text-slate-700 truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
                                             </div>
                                             <button 
                                                 onClick={() => removeFile(idx)}
                                                 className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                             >
                                                 <X size={16} />
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {/* Applicant Signature Section - Drawing Canvas */}
                         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
                             <div className="flex justify-between items-center">
                                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><PenTool size={18} className="text-primary-600" /> Applicant Signature</h3>
                                 <button 
                                     type="button" 
                                     onClick={clearSignature} 
                                     className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
                                 >
                                     <Eraser size={12} /> Clear
                                 </button>
                             </div>
                             <p className="text-slate-500 text-sm">Please sign in the box below.</p>
                             <div className="border-2 border-slate-300 rounded-xl bg-white overflow-hidden touch-none relative">
                                 <canvas
                                     ref={canvasRef}
                                     width={600}
                                     height={200}
                                     className="w-full h-40 cursor-crosshair block"
                                     onMouseDown={startDrawing}
                                     onMouseMove={draw}
                                     onMouseUp={stopDrawing}
                                     onMouseLeave={stopDrawing}
                                     onTouchStart={startDrawing}
                                     onTouchMove={draw}
                                     onTouchEnd={stopDrawing}
                                 />
                             </div>
                             {formData.applicantSignature === '' && <p className="text-xs text-red-500 font-medium">* Signature is required</p>}
                         </div>

                         <div className="bg-slate-50 p-6 rounded-3xl flex items-start gap-4">
                            <div className="pt-1"><input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 text-[#ef4444] rounded focus:ring-[#ef4444] border-gray-300" /></div>
                            <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none"><span className="font-bold text-slate-800 block mb-1 flex items-center gap-2"><ShieldCheck size={16}/> Data Privacy & Consent</span> I certify that the information provided is true and correct. I have read and agree to the <span onClick={(e) => {e.preventDefault(); setShowTerms(true)}} className="text-[#ef4444] font-bold hover:underline">Terms and Conditions</span> and <span className="text-[#ef4444] font-bold hover:underline">Privacy Policy</span>.</label>
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
                     <button onClick={prevStep} disabled={currentStep === 1} className={`text-slate-500 font-bold hover:text-slate-800 px-4 py-2 rounded-xl transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>Back</button>
                     <button onClick={nextStep} disabled={(currentStep === 1 && !canProceedStep1)} className={`font-bold flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg ${currentStep === 4 ? (agreed && formData.applicantSignature.trim() !== '' && !submitted ? 'bg-[#ef4444] text-white hover:bg-red-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none') : 'text-[#ef4444] hover:bg-red-50'}`}>
                         {currentStep === 4 ? (submitted ? 'Processing...' : 'Submit Application') : (currentStep === 1 && verificationStatus === 'not-found' ? 'Proceed Manually' : 'Next')} {currentStep < 4 && <ArrowLeft className="rotate-180" size={20} />}
                     </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};
