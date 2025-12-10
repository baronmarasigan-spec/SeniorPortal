
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, Calendar, MapPin, Upload, FileCheck, Search, 
  ArrowLeft, AlertCircle, CheckCircle2, ArrowRight, Star,
  Phone, Heart, X, FileText
} from 'lucide-react';
import { RegistryRecord } from '../types';

const InfoModal = ({ isOpen, onClose, title, content }: { isOpen: boolean; onClose: () => void; title: string; content: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-20 overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-up">
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
  const [step, setStep] = useState<'verify' | 'form'>('verify');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      alert('Registration Submitted! Please wait for approval.');
      navigate('/');
    }, 1500);
  };

  const isEligible = calculatedAge >= 60;

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
        <div>
            <h4 className="font-bold text-slate-800 mb-2">5. System Usage</h4>
            <p className="text-sm">Any attempt to hack, disrupt, manipulate, or gain unauthorized access to the system is strictly prohibited. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center py-12"
      style={{
        backgroundImage: "url('https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Group-81.png')"
      }}
    >
      <InfoModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms and Conditions" 
        content={termsContent} 
      />

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>

      {/* Top Logo */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
         <img 
            src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
            alt="Seal of San Juan" 
            className="w-20 h-20 drop-shadow-2xl"
         />
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-primary-200 transition-colors font-medium z-30 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
      >
        <ArrowLeft size={18} />
        <span className="hidden md:inline">Back to Home</span>
      </button>

      {/* Main Container */}
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden relative z-20 mx-4 flex flex-col max-h-[90vh]">
        
        {step === 'verify' ? (
            <div className="p-10 md:p-16 flex flex-col items-center text-center overflow-y-auto">
                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Search size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Check Registration Status</h2>
                <p className="text-slate-500 mb-8 max-w-md">
                    Please enter your LCR Number or PWD ID Number to check if your record already exists in our database.
                </p>

                <form onSubmit={handleVerify} className="w-full max-w-md space-y-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Enter LCR or PWD ID Number"
                            className="w-full px-5 py-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none font-medium text-slate-800"
                            value={searchId}
                            onChange={(e) => {
                                setSearchId(e.target.value);
                                setVerificationStatus('idle');
                            }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>

                    <button 
                        type="submit"
                        disabled={!searchId || verificationStatus === 'searching'}
                        className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {verificationStatus === 'searching' ? 'Verifying...' : 'Check Database'}
                    </button>
                    
                    <p className="text-xs text-slate-400 mt-2">
                        Try <span className="font-mono text-slate-500 bg-slate-100 px-1 rounded">LCR-2024-001</span> or <span className="font-mono text-slate-500 bg-slate-100 px-1 rounded">PWD-2024-888</span>
                    </p>
                </form>

                {verificationStatus === 'found' && foundRecord && (
                    <div className="mt-8 w-full max-w-lg animate-fade-in space-y-4">
                        {foundRecord.isRegistered ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-left">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-800">Record Found!</p>
                                    <p className="text-sm text-emerald-700 mb-1">
                                        Hello, <strong>{foundRecord.firstName} {foundRecord.lastName}</strong>.
                                    </p>
                                    <p className="text-sm text-emerald-600">This ID is already registered. Please <span className="underline cursor-pointer font-bold" onClick={() => navigate('/')}>Log in</span>.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Record Match</p>
                                        <h3 className="text-xl font-bold text-slate-800">{foundRecord.firstName} {foundRecord.lastName}</h3>
                                        <p className="text-sm text-slate-500">{foundRecord.address}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</p>
                                        <p className="text-2xl font-bold text-primary-600">{calculatedAge}</p>
                                    </div>
                                </div>

                                {isEligible ? (
                                    <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
                                        <Star size={18} className="fill-green-800" />
                                        Eligible for Senior Citizen Registration
                                    </div>
                                ) : (
                                    <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
                                        <AlertCircle size={18} />
                                        Not yet eligible (Age must be 60+)
                                    </div>
                                )}

                                <p className="text-sm text-slate-500 leading-relaxed">
                                    We have fetched your basic information from the database. Please proceed to complete your registration by providing the remaining details.
                                </p>
                                
                                <button 
                                    onClick={() => setStep('form')}
                                    disabled={!isEligible}
                                    className={`w-full py-3 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                                        isEligible ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
                                    }`}
                                >
                                    Proceed to Complete Registration <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {verificationStatus === 'not-found' && (
                    <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-md animate-fade-in">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <AlertCircle size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-800">No Record Found</p>
                                <p className="text-sm text-slate-500">We couldn't find a record for this ID.</p>
                            </div>
                         </div>
                         
                         <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mb-4 text-sm text-amber-800 text-left">
                             <strong>Note:</strong> No records found or you are not eligible to register. You need to be age 60 and up.
                         </div>

                         <p className="text-sm text-slate-500 mb-4 text-left">
                             If you are eligible, you can still register manually. You will need to fill out all personal details and upload necessary documents.
                         </p>
                         <button 
                            onClick={() => setStep('form')}
                            className="w-full py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                        >
                            Proceed to Manual Registration <ArrowRight size={18} />
                         </button>
                    </div>
                )}
            </div>
        ) : (
            <>
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('verify')} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold">Registration Form</h2>
                            <p className="text-white/80 text-xs">
                                {verificationStatus === 'found' ? 'Verified Application (Pre-filled)' : 'Manual Application'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto p-8 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information */}
                        <section className="space-y-4">
                        <h3 className="text-[#1e3a8a] font-bold border-b border-slate-100 pb-2 flex items-center gap-2">
                            <User size={18} /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                                <input 
                                type="text" 
                                name="firstName" 
                                required
                                value={formData.firstName}
                                onChange={handleInputChange}
                                readOnly={verificationStatus === 'found'}
                                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Middle Name</label>
                                <input 
                                type="text" 
                                name="middleName" 
                                value={formData.middleName}
                                onChange={handleInputChange}
                                readOnly={verificationStatus === 'found' && !!formData.middleName}
                                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all ${verificationStatus === 'found' && !!formData.middleName ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                                <input 
                                type="text" 
                                name="lastName" 
                                required
                                value={formData.lastName}
                                onChange={handleInputChange}
                                readOnly={verificationStatus === 'found'}
                                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Calendar size={12} /> Date of Birth
                                </label>
                                <input 
                                type="date" 
                                name="birthDate" 
                                required
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                readOnly={verificationStatus === 'found'}
                                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <MapPin size={12} /> Place of Birth
                                </label>
                                <input 
                                type="text" 
                                name="birthPlace" 
                                required
                                placeholder="City/Municipality, Province"
                                value={formData.birthPlace}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Sex</label>
                                <select 
                                name="sex" 
                                value={formData.sex}
                                onChange={handleInputChange}
                                disabled={verificationStatus === 'found'}
                                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}
                                >
                                <option>Male</option>
                                <option>Female</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Civil Status</label>
                                <select 
                                name="civilStatus" 
                                value={formData.civilStatus}
                                onChange={handleInputChange}
                                disabled={verificationStatus === 'found'}
                                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}
                                >
                                <option>Single</option>
                                <option>Married</option>
                                <option>Widowed</option>
                                <option>Separated</option>
                                </select>
                            </div>
                        </div>
                        </section>

                        {/* Address & Contact */}
                        <section className="space-y-4">
                        <h3 className="text-[#1e3a8a] font-bold border-b border-slate-100 pb-2 flex items-center gap-2">
                            <MapPin size={18} /> Address & Contact Details
                        </h3>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Current Address</label>
                            <input 
                                type="text" 
                                name="address" 
                                required
                                placeholder="House No., Street, Barangay, City"
                                value={formData.address}
                                onChange={handleInputChange}
                                readOnly={verificationStatus === 'found'}
                                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all ${verificationStatus === 'found' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                    type="tel" 
                                    name="contactNumber" 
                                    required
                                    placeholder="0912 345 6789"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                <input 
                                type="email" 
                                name="email" 
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-4">
                            <h4 className="font-bold text-red-800 text-sm flex items-center gap-2">
                                <Heart size={14} /> In Case of Emergency
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Contact Person</label>
                                    <input 
                                    type="text" 
                                    name="emergencyContactName" 
                                    required
                                    placeholder="Name of relative/guardian"
                                    value={formData.emergencyContactName}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Emergency Number</label>
                                    <input 
                                    type="tel" 
                                    name="emergencyContactNumber" 
                                    required
                                    placeholder="0912 345 6789"
                                    value={formData.emergencyContactNumber}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Create Password</label>
                            <input 
                            type="password" 
                            name="password" 
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        </section>

                        {/* Document Upload */}
                        <section className="space-y-4">
                        <h3 className="text-[#1e3a8a] font-bold border-b border-slate-100 pb-2 flex items-center gap-2">
                            <Upload size={18} /> Documents
                        </h3>
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group hover:border-primary-500 transition-colors relative cursor-pointer">
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary-500 transition-colors">
                                    {file ? <FileCheck /> : <Upload />}
                                </div>
                                {file ? (
                                    <p className="font-bold text-primary-600">{file}</p>
                                ) : (
                                    <div>
                                    <p className="text-sm font-bold text-slate-700">Click to upload Birth Certificate</p>
                                    <p className="text-xs text-slate-400">Supported files: JPG, PNG, PDF</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        </section>

                        {/* Terms */}
                        <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-600"
                        />
                        <label htmlFor="terms" className="text-sm text-slate-600">
                            I certify that the information provided is true and correct. I agree to the <span onClick={() => setShowTerms(true)} className="text-primary-600 font-bold cursor-pointer hover:underline">Terms and Conditions</span> and <span onClick={() => setShowTerms(true)} className="text-primary-600 font-bold cursor-pointer hover:underline">Data Privacy Policy</span> of the Senior Citizen Management System.
                        </label>
                        </div>

                        <button 
                            type="submit"
                            disabled={!agreed || submitted}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all
                                ${agreed && !submitted ? 'bg-[#1e3a8a] hover:bg-blue-900 hover:scale-[1.01]' : 'bg-slate-300 cursor-not-allowed'}
                            `}
                        >
                            {submitted ? 'Processing...' : 'Complete Registration'}
                        </button>
                    </form>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
