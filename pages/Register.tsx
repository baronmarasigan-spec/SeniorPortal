
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, Calendar, MapPin, Upload, FileCheck, Search, 
  ArrowLeft, AlertCircle, CheckCircle2, ArrowRight, Star,
  Phone, Heart, X, FileText, Key, Mail, ShieldCheck, Info,
  LogIn, XCircle
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

const SLIDESHOW_IMAGES = [
  "https://picsum.photos/seed/seniors_ph/800/600",
  "https://picsum.photos/seed/seniors_gathering/800/600", 
  "https://picsum.photos/seed/seniors_smile/800/600"
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

  // Slideshow State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, []);

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
                    suffix: record.suffix || '',
                    citizenship: '',
                    birthDate: record.birthDate,
                    birthPlace: record.birthPlace || '',
                    sex: record.sex || '',
                    civilStatus: record.civilStatus || '',
                    livingArrangement: '',
                    livingArrangementSpecific: '',
                    
                    province: 'Metro Manila',
                    city: record.city || '',
                    district: record.district || '',
                    barangay: record.barangay || '',
                    street: record.street || '',
                    houseNo: record.houseNo || '',
                }));
            }
        } else {
            setVerificationStatus('not-found');
            setFormData({
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
                province: 'Metro Manila',
                city: '',
                district: '',
                barangay: '',
                street: '',
                houseNo: '',
                email: '',
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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      alert(`Registration Submitted! Your account credentials will be sent to ${formData.email || formData.contactNumber ? 'your email/contact number' : 'you'} once approved.`);
      navigate('/');
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

  // Helper to get available options based on state
  const availableDistricts = formData.city ? (LOCATION_DATA[formData.city] ? Object.keys(LOCATION_DATA[formData.city]) : []) : [];
  
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
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      <InfoModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms and Conditions" 
        content={termsContent} 
      />

      {/* LEFT PANEL - Desktop Only */}
      <div className="hidden lg:flex w-[35%] bg-gradient-to-br from-red-400 to-red-600 text-white flex-col relative overflow-hidden shrink-0">
         {/* Background decoration */}
         <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-black opacity-5 rounded-full blur-3xl pointer-events-none"></div>

         <div className="p-10 flex flex-col h-full relative z-10 justify-between">
            {/* Top Back Button */}
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors w-fit group">
                <div className="p-2.5 bg-white/20 rounded-full group-hover:bg-white/30 transition-all backdrop-blur-sm border border-white/20">
                    <ArrowLeft size={18}/>
                </div>
                <span className="text-sm font-medium tracking-wide">Back to home</span>
            </button>

            {/* Main Content */}
            <div className="space-y-6 my-auto flex flex-col items-center text-center">
                <div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md leading-tight">“MABUHAY ! “</h1>
                    <p className="text-base xl:text-lg text-white/95 leading-relaxed font-light max-w-sm drop-shadow-sm mx-auto">
                       Mag-rehistro ngayon at tangkilikin ang inyong Senior Citizen Benefits.
                    </p>
                </div>

                {/* Slideshow Image */}
                <div className="relative w-full aspect-[4/3] max-w-[280px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/30 transform hover:scale-105 transition-all duration-700 mx-auto">
                    {SLIDESHOW_IMAGES.map((img, index) => (
                        <img 
                            key={index}
                            src={img} 
                            alt={`Senior Community Slide ${index + 1}`} 
                            className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} 
                        />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none"></div>
                </div>
            </div>

            {/* Logos Footer */}
            <div className="flex items-center justify-center pt-6">
                 <img src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" className="h-14 w-auto drop-shadow-lg hover:scale-105 transition-transform" alt="Official Partners" />
            </div>
         </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
         {/* Mobile Header */}
         <div className="lg:hidden p-4 bg-[#ef4444] text-white flex justify-between items-center shadow-md z-20 shrink-0">
             <div className="flex items-center gap-2">
                <button onClick={() => navigate('/')}><ArrowLeft size={24} /></button>
                <span className="font-bold text-lg">Registration</span>
             </div>
             <img src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" className="w-8 h-8" />
         </div>

         {/* Progress Indicator */}
         <div className="px-6 pt-6 pb-2 lg:px-20 lg:pt-12 shrink-0">
            <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
                {[1, 2, 3, 4].map(step => (
                    <React.Fragment key={step}>
                        <div className={`w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${currentStep >= step ? 'bg-[#ef4444] scale-110' : 'bg-slate-200'}`}></div>
                        {step < 4 && <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep > step ? 'bg-[#ef4444]' : 'bg-slate-100'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
         </div>

         {/* Scrollable Form Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 lg:px-20 lg:py-8">
            <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-center">
                
                {/* STEP 1: VERIFICATION */}
                {currentStep === 1 && (
                    <div className="animate-fade-in-up space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-800 mb-3">Identity Verification</h2>
                            <p className="text-slate-500 text-lg">Enter your LCR or PWD ID number to check for existing records.</p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-6">
                           <div className="relative group">
                               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" size={24} />
                               <input 
                                   type="text" 
                                   placeholder="e.g. LCR-2024-001"
                                   className="w-full pl-16 pr-6 py-5 bg-slate-100 rounded-2xl border-2 border-transparent focus:border-[#ef4444] focus:bg-white transition-all outline-none font-bold text-slate-800 text-xl placeholder:text-slate-400 placeholder:font-normal"
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
                               className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
                           >
                               {verificationStatus === 'searching' ? 'Checking Database...' : 'Check ID Number'}
                           </button>
                        </form>

                        {/* Found/Not Found Display Code */}
                        {verificationStatus === 'found' && foundRecord && (
                           <div className={`border rounded-3xl p-8 animate-scale-up ${foundRecord.isRegistered ? 'bg-emerald-50 border-emerald-200' : isEligible ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                               <div className="flex items-center gap-4 mb-6">
                                   <div className={`p-3 rounded-full ${foundRecord.isRegistered ? 'bg-emerald-100 text-emerald-600' : isEligible ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                       {foundRecord.isRegistered ? <CheckCircle2 size={32} /> : isEligible ? <Star size={32} /> : <XCircle size={32} />}
                                   </div>
                                   <div>
                                       <h3 className={`font-bold text-xl ${foundRecord.isRegistered ? 'text-emerald-900' : isEligible ? 'text-amber-900' : 'text-red-900'}`}>
                                           {foundRecord.isRegistered ? 'Account Exists' : isEligible ? 'Record Found' : 'Not Eligible'}
                                       </h3>
                                       <p className={`text-sm ${foundRecord.isRegistered ? 'text-emerald-700' : isEligible ? 'text-amber-700' : 'text-red-700'}`}>
                                           {foundRecord.isRegistered ? 'This ID is already associated with an account.' : isEligible ? 'Your record was found and you are eligible.' : 'You do not meet the age requirement.'}
                                       </p>
                                   </div>
                               </div>
                               <div className="bg-white/60 rounded-2xl p-5 mb-6 space-y-3 shadow-sm">
                                   <p className="font-bold text-slate-800 text-2xl">{foundRecord.firstName} {foundRecord.lastName}</p>
                                   <p className="text-slate-500 font-medium flex items-center gap-2"><MapPin size={16}/> {foundRecord.address || `${foundRecord.street}, ${foundRecord.city}`}</p>
                                   <div className="flex items-center gap-2 pt-2">
                                       <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${isEligible ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                           {isEligible ? <Star size={14} /> : <AlertCircle size={14} />} Age: {calculatedAge} years old
                                       </span>
                                   </div>
                               </div>
                               {foundRecord.isRegistered ? (
                                   <button onClick={() => navigate('/', { state: { openLogin: true } })} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 text-lg"><LogIn size={20} /> Login to your account</button>
                               ) : isEligible ? (
                                   <p className="text-amber-800 text-center font-bold bg-amber-100/50 p-4 rounded-2xl">Please proceed by clicking <span className="underline">Next</span> below.</p>
                               ) : (
                                   <div className="text-center text-red-800 font-bold bg-red-100/50 p-4 rounded-2xl flex items-center justify-center gap-2"><XCircle size={20} /> Minimum age requirement is 60.</div>
                               )}
                           </div>
                        )}

                        {verificationStatus === 'not-found' && (
                            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center animate-scale-up">
                                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle size={32} /></div>
                                <h3 className="font-bold text-red-900 text-xl mb-2">Record Not Found</h3>
                                <p className="text-red-700 mb-6">We couldn't find ID <strong>{searchId}</strong> in the masterlist.</p>
                                <p className="text-red-600 bg-white/50 p-4 rounded-2xl border border-red-100 font-medium">You can proceed with <strong>Manual Registration</strong> by clicking the Next button below.</p>
                            </div>
                        )}
                        
                        {/* Demo Data Helper */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-4"><div className="p-1.5 bg-slate-100 rounded-lg text-slate-500"><Info size={16} /></div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Data</span></div>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {registryRecords.slice(0, 3).map((record) => (
                                    <button key={record.id} onClick={() => { setSearchId(record.id); setVerificationStatus('idle'); }} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs text-slate-600 font-mono whitespace-nowrap transition-colors">
                                        {record.id}
                                    </button>
                                ))}
                                <button onClick={() => { setSearchId('UNKNOWN-999'); setVerificationStatus('idle'); }} className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 text-xs text-red-600 font-mono whitespace-nowrap transition-colors">
                                   TEST-NOT-FOUND
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: PERSONAL INFO */}
                {currentStep === 2 && (
                    <div className="animate-fade-in-up space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-800 mb-3">Personal na Impormasyon</h2>
                            <p className="text-slate-500 text-lg">Provide personal details exactly as on your birth certificate.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Unang Pangalan</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} readOnly={verificationStatus === 'found'} className="w-full px-5 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Apelyido</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} readOnly={verificationStatus === 'found'} className="w-full px-5 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Gitnang Pangalan</label>
                                <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full px-5 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Petsa ng Kapanganakan</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} readOnly={verificationStatus === 'found'} className="w-full px-5 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none transition-all font-medium text-slate-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Lugar ng Kapanganakan</label>
                                    <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} readOnly={verificationStatus === 'found' && !!formData.birthPlace} className="w-full px-5 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Kasarian</label>
                                    <div className="relative">
                                        <select name="sex" value={formData.sex} onChange={handleInputChange} disabled={verificationStatus === 'found'} className="w-full px-5 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none text-slate-800 appearance-none font-medium">
                                            <option value="" disabled>Select</option><option>Male</option><option>Female</option>
                                        </select>
                                        <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Katayuang Sibil</label>
                                    <div className="relative">
                                        <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} disabled={verificationStatus === 'found'} className="w-full px-5 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none text-slate-800 appearance-none font-medium">
                                            <option value="" disabled>Select</option><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                                        </select>
                                        <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: CONTACT & ACCOUNT */}
                {currentStep === 3 && (
                    <div className="animate-fade-in-up space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-800 mb-3">Impormasyon sa Pakikipag-ugnayan</h2>
                            <p className="text-slate-500 text-lg">Provide your current address and contact details.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 space-y-6">
                               <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><MapPin className="text-[#ef4444]" size={20} /> Tirahan (Address)</h3>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="space-y-2">
                                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Lungsod (City)</label>
                                       <div className="relative">
                                           <select name="city" value={formData.city} onChange={handleAddressChange} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#ef4444] outline-none text-slate-800 appearance-none font-medium">
                                               <option value="" disabled>Select City</option>
                                               {METRO_MANILA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                           </select>
                                           <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                                       </div>
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Barangay</label>
                                       <div className="relative">
                                           {/* Simplified logic for demo: District/Barangay */}
                                           <select name="barangay" value={formData.barangay} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#ef4444] outline-none text-slate-800 appearance-none font-medium">
                                               <option value="" disabled>Select Barangay</option>
                                               {availableDistricts.flatMap(d => LOCATION_DATA[formData.city]?.[d] || []).map(b => <option key={b} value={b}>{b}</option>)}
                                           </select>
                                           <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                                       </div>
                                   </div>
                                   <div className="space-y-2 md:col-span-2">
                                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Kalye at Numero (Street & No.)</label>
                                       <input type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#ef4444] outline-none text-slate-800 font-medium" placeholder="e.g. 123 Rizal St." />
                                   </div>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Numero ng Telepono</label>
                                    <div className="relative"><Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full pl-12 pr-6 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="0912 345 6789" /></div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                                    <div className="relative"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-6 py-4 rounded-xl bg-slate-100 border-2 border-transparent focus:border-[#ef4444] focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="juan@example.com" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: DOCUMENTS & TERMS */}
                {currentStep === 4 && (
                    <div className="animate-fade-in-up space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-800 mb-3">Requirements</h2>
                            <p className="text-slate-500 text-lg">Upload verification documents and review terms.</p>
                        </div>

                        <div className="border-3 border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center hover:border-[#ef4444] hover:bg-slate-50 transition-all cursor-pointer relative group">
                           <input type="file" onChange={handleFileChange} accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                           <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:scale-110 transition-transform">
                               {file ? <FileCheck className="text-emerald-500" size={40} /> : <Upload size={40} />}
                           </div>
                           {file ? (
                               <div><p className="font-bold text-emerald-600 text-xl">{file}</p><p className="text-slate-400 mt-2 font-medium">Click to change file</p></div>
                           ) : (
                               <div><p className="font-bold text-slate-800 text-xl">Upload Birth Certificate</p><p className="text-slate-500 mt-2 font-medium">or Valid Government ID (JPG, PNG, PDF)</p></div>
                           )}
                        </div>

                        <div className="bg-slate-50 p-6 rounded-3xl flex items-start gap-4 border border-slate-100">
                           <div className="pt-1"><input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-6 h-6 text-[#ef4444] rounded focus:ring-[#ef4444] border-gray-300" /></div>
                           <label htmlFor="terms" className="text-slate-600 leading-relaxed cursor-pointer select-none font-medium text-sm">
                               <span className="font-bold text-slate-800 block mb-1 flex items-center gap-2 text-base"><ShieldCheck size={20}/> Data Privacy & Consent</span> 
                               I certify that the information provided is true and correct. I have read and agree to the <span onClick={(e) => {e.preventDefault(); setShowTerms(true)}} className="text-[#ef4444] font-bold hover:underline">Terms and Conditions</span>.
                           </label>
                        </div>
                    </div>
                )}

            </div>
         </div>

         {/* Footer Navigation */}
         <div className="p-6 lg:px-20 lg:py-8 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
             <button onClick={() => setShowTerms(true)} className="flex items-center gap-2 text-slate-400 hover:text-[#ef4444] transition-colors text-sm font-medium">
                 <Info size={16} /> Terms & Conditions
             </button>

             <div className="flex items-center gap-8 font-bold text-lg select-none">
                 <div className="flex gap-4 text-slate-300 hidden md:flex">
                    {[1, 2, 3, 4].map(s => <span key={s} className={currentStep === s ? 'text-[#ef4444] scale-125 transition-transform' : 'transition-colors'}>{s}</span>)}
                 </div>
                 
                 <div className="flex gap-4">
                     {currentStep > 1 && <button onClick={prevStep} className="text-slate-400 hover:text-slate-600">Back</button>}
                     <button 
                        onClick={nextStep} 
                        disabled={(currentStep === 1 && !canProceedStep1) || (currentStep === 4 && !agreed)}
                        className="text-[#ef4444] hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                        {currentStep === 4 ? (submitted ? 'Processing...' : 'Submit') : (currentStep === 1 && verificationStatus === 'not-found' ? 'Proceed Manually' : 'Next')}
                        {currentStep < 4 && <ArrowRight size={20} />}
                     </button>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
