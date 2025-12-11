
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, Calendar, MapPin, Upload, FileCheck, Search, 
  ArrowLeft, AlertCircle, CheckCircle2, ArrowRight, Star,
  Phone, Heart, X, FileText, Key, Mail, ShieldCheck
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
  const { verifyIdentity } = useApp();
  
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
    }, 1000);
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
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-white overflow-hidden font-sans">
      <InfoModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms and Conditions" 
        content={termsContent} 
      />

      {/* Left Panel - Hero / Branding (Desktop) */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-[#ef4444] to-[#f87171] p-12 text-white flex-col relative h-full justify-between z-10 shadow-2xl">
         {/* Navigation */}
         <div className="relative z-10">
            <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium mb-8 group"
            >
                <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                     <ArrowLeft size={18} />
                </div>
                <span>Back to home</span>
            </button>

            <h1 className="text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-down">"MABUHAY ! "</h1>
            <p className="text-white/90 text-lg leading-relaxed font-light max-w-md animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Mag-rehistro ngayon at tangkilikin ang inyong Senior Citizen Benefits, para sa mas mabilis na access sa diskwento, healthcare support, at mga programang handog ng pamahalaan.
            </p>
         </div>

         {/* Image - Floating and Middle */}
         <div className="relative z-10 flex-1 flex items-center justify-center">
             <div className="w-72 aspect-video bg-white rounded-2xl overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border-4 border-white/20 transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-700 ease-in-out cursor-pointer animate-float">
                <img src="https://picsum.photos/seed/seniors_gathering/600/400" alt="Seniors Gathering" className="w-full h-full object-cover" />
             </div>
             {/* Decorative small element */}
             <div className="absolute top-1/2 right-12 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full -translate-y-12 translate-x-12 blur-sm pointer-events-none animate-bounce-slow"></div>
         </div>

         {/* Footer Logos */}
         <div className="relative z-10 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
             <img src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" className="h-20 object-contain drop-shadow-lg" alt="Official Seals" />
         </div>

         {/* Decorative Backgrounds */}
         <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-black opacity-5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Mobile Header (Replaces left panel on small screens) */}
      <div className="lg:hidden bg-[#ef4444] p-4 text-white flex justify-between items-center shrink-0 shadow-md z-20 animate-fade-in-down">
          <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')}><ArrowLeft size={20}/></button>
              <h1 className="font-bold text-lg">Registration</h1>
          </div>
          <img src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" className="w-8 h-8" />
      </div>

      {/* Right Panel - Form Wizard */}
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

                         {verificationStatus === 'found' && foundRecord && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 animate-scale-up">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-900 text-lg">Record Found</h3>
                                        <p className="text-emerald-700 text-sm">We found a match in the database.</p>
                                    </div>
                                </div>
                                <div className="bg-white/60 rounded-2xl p-4 mb-4 space-y-2">
                                    <p className="font-bold text-slate-800 text-lg">{foundRecord.firstName} {foundRecord.lastName}</p>
                                    <p className="text-slate-500 text-sm flex items-center gap-2"><MapPin size={14}/> {foundRecord.address}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {isEligible ? (
                                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                <Star size={12} /> Eligible (Age {calculatedAge})
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                <AlertCircle size={12} /> Not Eligible (Age {calculatedAge})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {foundRecord.isRegistered ? (
                                    <div className="text-center text-emerald-800 font-medium bg-emerald-100/50 p-3 rounded-xl">
                                        This user is already registered. Please login instead.
                                    </div>
                                ) : isEligible ? (
                                    <p className="text-sm text-emerald-700 text-center">
                                        Click <strong>Next</strong> to proceed with registration using this data.
                                    </p>
                                ) : (
                                    <p className="text-sm text-amber-700 text-center">
                                        You must be at least 60 years old to register.
                                    </p>
                                )}
                            </div>
                         )}

                         {verificationStatus === 'not-found' && (
                             <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center animate-scale-up">
                                 <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                     <Search size={24} />
                                 </div>
                                 <h3 className="font-bold text-slate-800">No Record Found</h3>
                                 <p className="text-slate-500 text-sm mb-4">We couldn't find your ID in the system.</p>
                                 <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                                     You can proceed with <strong>Manual Registration</strong> by clicking Next.
                                 </p>
                             </div>
                         )}
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
         <div className="bg-white border-t border-slate-100 p-4 lg:px-16 flex items-center justify-between shrink-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
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
                     disabled={(currentStep === 1 && !foundRecord && verificationStatus !== 'not-found') || (currentStep === 1 && foundRecord && foundRecord.isRegistered)}
                     className={`font-bold flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg ${
                        currentStep === 4 
                        ? (agreed && !submitted ? 'bg-[#ef4444] text-white hover:bg-red-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none')
                        : 'text-[#ef4444] hover:bg-red-50'
                     }`}
                 >
                     {currentStep === 4 ? (submitted ? 'Processing...' : 'Submit Application') : 'Next'} 
                     {currentStep < 4 && <ArrowLeft className="rotate-180" size={20} />}
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};
