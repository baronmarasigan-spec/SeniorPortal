
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, Search, CheckCircle2, Star, XCircle, Info, LogIn,
  ShieldCheck, ArrowRight, Upload, FileCheck, X, FileText
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
};

const METRO_MANILA_CITIES = Object.keys(LOCATION_DATA).sort();

const SLIDES = [
  "https://picsum.photos/seed/senior_joy1/800/600",
  "https://picsum.photos/seed/senior_health/800/600",
  "https://picsum.photos/seed/senior_community/800/600"
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
  const [showSuccess, setShowSuccess] = useState(false);

  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
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
    
    setTimeout(() => {
        const record = verifyIdentity(searchId);
        if (record) {
            setFoundRecord(record);
            const age = calculateAge(record.birthDate);
            setCalculatedAge(age);
            setVerificationStatus('found');
            
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
      alert(`Registration Submitted!`);
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

  const availableDistricts = formData.city ? (LOCATION_DATA[formData.city] ? Object.keys(LOCATION_DATA[formData.city]) : []) : [];
  
  const termsContent = (
    <div className="space-y-6 text-slate-600 leading-relaxed font-light">
        <div>
            <h4 className="font-bold text-slate-800 mb-2">1. Acceptance of Terms</h4>
            <p className="text-sm">By accessing and using the SeniorConnect portal, you agree to comply with and be bound by these Terms and Conditions.</p>
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

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-[#ef4444] to-[#f87171] text-white flex-col relative overflow-hidden shrink-0 px-12 pt-32 pb-10 items-center justify-start">
         {/* Background decoration */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         
         {/* Top Link - Absolute */}
         <div className="absolute top-10 left-12">
             <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium group">
                <div className="p-1.5 rounded-full border border-white/30 group-hover:bg-white/10 transition-colors">
                    <ArrowLeft size={14}/>
                </div>
                Back to home
             </button>
         </div>

         {/* Main Content - Aligned to Top via parent justify-start + pt-32 */}
         <div className="space-y-8 relative z-10 flex flex-col items-center text-center">
            <div>
                <h1 className="text-5xl font-extrabold tracking-tight mb-6 drop-shadow-md">“MABUHAY ! “</h1>
                <p className="text-lg text-white/90 leading-relaxed font-light max-w-sm mx-auto drop-shadow-sm">
                   Mag-rehistro ngayon at tangkilikin ang inyong Senior Citizen Benefits, para sa mas mabilis na access sa diskwento, healthcare support, at mga programang handog ng pamahalaan.
                </p>
            </div>

            {/* Slideshow Image - Smaller max width */}
            <div className="relative w-full aspect-[4/3] max-w-[240px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 transform -rotate-1 hover:rotate-0 transition-transform duration-700">
                {SLIDES.map((src, index) => (
                    <img 
                        key={index}
                        src={src} 
                        alt={`Community Slide ${index + 1}`} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`} 
                    />
                ))}
            </div>
         </div>

         {/* Logos - Absolute Bottom */}
         <div className="absolute bottom-10">
              <img 
                src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" 
                className="h-16 w-auto object-contain drop-shadow-lg" 
                alt="Official Seals" 
              />
         </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden px-8 lg:px-24 py-10 justify-center">
         
         <div className="w-full max-w-3xl mx-auto flex flex-col h-full justify-center">
             {/* Progress Bar (Stepper) */}
             <div className="flex justify-center mb-12 shrink-0">
                 <div className="flex items-center gap-2 w-full max-w-lg">
                    <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-[#ef4444]' : 'bg-gray-200'}`}></div>
                    <div className={`h-[2px] flex-1 ${currentStep >= 2 ? 'bg-[#ef4444]' : 'bg-gray-200'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-[#ef4444]' : 'bg-gray-200'}`}></div>
                    <div className={`h-[2px] flex-1 ${currentStep >= 3 ? 'bg-[#ef4444]' : 'bg-gray-200'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-[#ef4444]' : 'bg-gray-200'}`}></div>
                    <div className={`h-[2px] flex-1 ${currentStep >= 4 ? 'bg-[#ef4444]' : 'bg-gray-200'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${currentStep >= 4 ? 'bg-[#ef4444]' : 'bg-gray-200'}`}></div>
                 </div>
             </div>

             {/* Form Header */}
             <div className="mb-8 shrink-0 text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-800 mb-1">
                    {currentStep === 1 ? "Identity Verification" :
                     currentStep === 2 ? "Personal na Impormasyon" :
                     currentStep === 3 ? "Contact & Address" : "Requirements"}
                </h2>
             </div>

             {/* Form Content */}
             <div className="overflow-y-auto custom-scrollbar pr-4 -mr-4 max-h-[60vh]">
                
                {/* STEP 1 */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">ID Number (LCR / PWD)</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-100 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:ring-2 focus:ring-[#ef4444]/20 transition-all font-medium text-lg"
                                placeholder="e.g. LCR-2024-001"
                                value={searchId}
                                onChange={(e) => { setSearchId(e.target.value); setVerificationStatus('idle'); }}
                            />
                         </div>
                         <div>
                             <button 
                                onClick={handleVerify}
                                disabled={!searchId || verificationStatus === 'searching'}
                                className="w-full bg-slate-800 text-white rounded-2xl py-4 font-bold text-lg hover:bg-slate-900 transition-all shadow-lg"
                             >
                                {verificationStatus === 'searching' ? 'Checking...' : 'Verify Identity'}
                             </button>
                         </div>

                         {/* Status Messages */}
                         {verificationStatus === 'found' && foundRecord && (
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl mt-4">
                                <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
                                    <CheckCircle2 /> Record Found
                                </h3>
                                <p className="text-emerald-700 mt-1">
                                    {foundRecord.firstName} {foundRecord.lastName}
                                </p>
                                <div className="mt-4 p-3 bg-white/60 rounded-xl text-sm text-emerald-800 font-medium">
                                    {isEligible ? "You are eligible to register." : "Minimum age is 60."}
                                </div>
                            </div>
                         )}
                         {verificationStatus === 'not-found' && (
                            <div className="bg-red-50 border border-red-100 p-6 rounded-3xl mt-4 text-center">
                                 <XCircle className="mx-auto text-red-500 mb-2" size={32} />
                                 <h3 className="font-bold text-red-800">No Record Found</h3>
                                 <p className="text-red-600 text-sm mt-1">You may proceed with manual registration.</p>
                            </div>
                         )}
                         
                         {/* Helper Links */}
                         <div className="pt-4 border-t border-gray-100">
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">For Demo:</p>
                             <div className="flex gap-2">
                                 {registryRecords.slice(0,2).map(r => (
                                     <button key={r.id} onClick={() => setSearchId(r.id)} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200">{r.id}</button>
                                 ))}
                                 <button onClick={() => setSearchId('UNKNOWN')} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded border border-red-100 hover:bg-red-100">Unknown</button>
                             </div>
                         </div>
                    </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Unang Pangalan</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Apelyido</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Gitnang Pangalan</label>
                            <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Hulapi</label>
                            <input type="text" name="suffix" value={formData.suffix} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Petsa ng Kapanganakan</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Kasarian</label>
                            <div className="relative">
                                <select name="sex" value={formData.sex} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20 appearance-none">
                                    <option value="" disabled>Select</option><option>Male</option><option>Female</option>
                                </select>
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Katayuang Sibil</label>
                            <div className="relative">
                                <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20 appearance-none">
                                    <option value="" disabled>Select</option><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                                </select>
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16}/>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">City</label>
                            <div className="relative">
                                <select name="city" value={formData.city} onChange={handleAddressChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20 appearance-none">
                                    <option value="" disabled>Select City</option>
                                    {METRO_MANILA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Barangay</label>
                            <div className="relative">
                                <select name="barangay" value={formData.barangay} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20 appearance-none">
                                    <option value="" disabled>Select Barangay</option>
                                    {availableDistricts.flatMap(d => LOCATION_DATA[formData.city]?.[d] || []).map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16}/>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-slate-600 font-medium ml-1">Street Address</label>
                            <input type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Mobile Number</label>
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20" placeholder="09xx xxx xxxx" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-slate-600 font-medium ml-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-100 rounded-2xl px-6 py-3.5 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#ef4444]/20 transition-all border border-transparent focus:border-[#ef4444]/20" placeholder="email@example.com" />
                        </div>
                    </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                    <div className="space-y-8">
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:border-[#ef4444] transition-colors group cursor-pointer relative">
                            <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-[#ef4444] shadow-sm transition-colors">
                                {file ? <FileCheck size={28}/> : <Upload size={28} />}
                            </div>
                            <p className="font-bold text-slate-700 text-lg">{file ? file : 'Upload Documents'}</p>
                            <p className="text-sm text-slate-400">Birth Certificate or Valid ID</p>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                            <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 text-[#ef4444] rounded border-gray-300 focus:ring-[#ef4444]" />
                            <label htmlFor="terms" className="text-sm text-slate-600">
                                I agree to the <span className="font-bold text-[#ef4444] cursor-pointer" onClick={() => setShowTerms(true)}>Terms of Use and Conditions</span> and certify that the information provided is true and correct.
                            </label>
                        </div>
                    </div>
                )}
             </div>

             {/* Footer / Pagination */}
             <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-8 shrink-0">
                 <button onClick={() => setShowTerms(true)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                    <ShieldCheck size={18} />
                    <span className="hidden sm:inline">Terms of Use and Conditions</span>
                    <span className="sm:hidden">Terms</span>
                 </button>

                 <div className="flex items-center gap-6">
                     {/* Page Numbers */}
                     <div className="flex items-center gap-4 text-lg font-bold select-none">
                        <button onClick={prevStep} disabled={currentStep === 1} className={`hover:text-slate-600 ${currentStep === 1 ? 'text-[#ef4444]' : 'text-slate-300'}`}>1</button>
                        <span className={`${currentStep === 2 ? 'text-[#ef4444]' : 'text-slate-300'}`}>2</span>
                        <span className={`${currentStep === 3 ? 'text-[#ef4444]' : 'text-slate-300'}`}>3</span>
                        <span className={`${currentStep === 4 ? 'text-[#ef4444]' : 'text-slate-300'}`}>4</span>
                     </div>

                     <button 
                        onClick={nextStep}
                        disabled={(currentStep === 1 && !canProceedStep1) || (currentStep === 4 && !agreed)}
                        className="text-[#ef4444] font-bold text-lg hover:underline disabled:opacity-50 disabled:no-underline"
                     >
                        {currentStep === 4 ? (submitted ? 'Processing...' : 'Submit') : 'Next'}
                     </button>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
