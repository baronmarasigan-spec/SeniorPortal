
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationType, ApplicationStatus } from '../../types';
import { Upload, FileCheck, Camera, X, CheckCircle, RefreshCw, AlertTriangle, Calendar, ShieldAlert, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IDCard } from '../../components/IDCard';

export const CitizenID: React.FC = () => {
  const { currentUser, addApplication, applications } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Determine Mode based on URL or internal selection
  const activeTab = searchParams.get('tab') || 'new';
  const [formMode, setFormMode] = useState<ApplicationType | null>(null);

  // Check if user already has an issued ID
  // Logic: User has a seniorIdNumber assigned.
  const hasIssuedID = !!currentUser?.seniorIdNumber;

  // Form State
  const [files, setFiles] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  
  // Contact Update State
  const [contactData, setContactData] = useState({
    address: '',
    contactNumber: '',
    email: ''
  });
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState('');

  // --- Expiration Logic ---
  const today = new Date();
  
  // Get Expiration Date from User Record (or null if not set)
  const expirationDateStr = currentUser?.seniorIdExpiryDate;
  const expirationDate = expirationDateStr ? new Date(expirationDateStr) : null;
  
  // Calculate Renewal Eligibility (3 months before expiration)
  // If no expiration date exists (but ID exists), we assume valid unless told otherwise or handle strictly.
  // For safety, if no date is present, we disable renewal unless explicitly handled.
  let isEligibleForRenewal = false;
  let renewalStartDate: Date | null = null;
  let daysUntilExpiration = 0;

  if (expirationDate) {
      renewalStartDate = new Date(expirationDate);
      renewalStartDate.setMonth(renewalStartDate.getMonth() - 3);

      isEligibleForRenewal = today >= renewalStartDate;
      daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  // -----------------------------------

  // Check for existing pending application
  const activeApplication = applications.find(
      a => a.userId === currentUser?.id && 
      (a.type === ApplicationType.ID_NEW || a.type === ApplicationType.ID_RENEWAL || a.type === ApplicationType.ID_REPLACEMENT) &&
      a.status === ApplicationStatus.PENDING
  );

  useEffect(() => {
    // Reset form when tab changes
    setFormMode(null);
    setFiles([]);
    setReason('');
  }, [activeTab]);

  // Pre-fill contact data when entering renewal/replacement mode
  useEffect(() => {
    if (currentUser && (formMode === ApplicationType.ID_RENEWAL || formMode === ApplicationType.ID_REPLACEMENT)) {
        setContactData({
            address: currentUser.address || '',
            contactNumber: currentUser.contactNumber || '',
            email: currentUser.email || ''
        });
    }
  }, [formMode, currentUser]);

  useEffect(() => {
    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setFiles(prev => [...prev, `Captured_Photo_${Date.now()}.jpg`]);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const newFiles = Array.from(e.target.files).map((f: File) => f.name);
       setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    
    // Determine the type based on context
    let type = ApplicationType.ID_NEW;
    if (formMode) type = formMode;
    else if (activeTab === 'new') type = ApplicationType.ID_NEW;

    // Build description including updated details if applicable
    let description = reason || `${type} Application`;
    
    if (type === ApplicationType.ID_RENEWAL || type === ApplicationType.ID_REPLACEMENT) {
        description += `\n\n[Updated Details]\nAddress: ${contactData.address}\nMobile: ${contactData.contactNumber}\nEmail: ${contactData.email}`;
    }

    addApplication({
      userId: currentUser.id,
      userName: currentUser.name,
      type: type,
      description: description,
      documents: files,
    });
    navigate('/citizen/dashboard');
  };

  if (activeApplication) {
      return (
          <div className="max-w-xl mx-auto text-center space-y-6 pt-10 animate-fade-in">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <RefreshCw size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Application in Progress</h2>
              <p className="text-slate-500">
                  You already have a pending application for <strong>{activeApplication.type}</strong> submitted on {activeApplication.date}.
                  Please wait for admin approval.
              </p>
              <button onClick={() => navigate('/citizen/dashboard')} className="px-6 py-2 bg-slate-100 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors">
                  Back to Dashboard
              </button>
          </div>
      )
  }

  // --- RENDER CONDITION ---
  // If user has an issued ID, always show the dashboard view (even if they clicked 'New ID')
  // unless they have explicitly entered a Form Mode (Renewal/Replacement form).
  const showIdDashboard = (hasIssuedID && !formMode) || (activeTab === 'renew' && !formMode);

  if (showIdDashboard) {
      // If user is here via 'renew' tab but has NO ID, show appropriate message
      if (!hasIssuedID) {
           return (
              <div className="max-w-xl mx-auto text-center space-y-6 pt-10 animate-fade-in">
                  <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">No Active ID Found</h2>
                  <p className="text-slate-500">
                      You do not have a Senior Citizen ID record yet. Please apply for a <strong>New ID</strong> first.
                  </p>
                  <button onClick={() => navigate('/citizen/id?tab=new')} className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                      Apply for ID
                  </button>
              </div>
           );
      }

      return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">
                    {activeTab === 'new' ? 'My Senior Citizen ID' : 'ID Renewal & Replacement'}
                </h1>
                <p className="text-slate-500">
                     {activeTab === 'new' ? 'View your digital ID status.' : 'Manage your Senior Citizen ID status.'}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ID Status Card */}
                <div className="space-y-6">
                    <div className="bg-slate-100 p-8 rounded-3xl flex items-center justify-center border border-slate-200">
                         <div className="transform scale-90 md:scale-100 transition-transform">
                            {currentUser && <IDCard user={currentUser} />}
                         </div>
                    </div>
                </div>

                {/* Info & Actions */}
                <div className="flex flex-col justify-center space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar className="text-primary-500" size={20} /> Expiration Status
                        </h3>
                        
                        {expirationDate ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                    <span className="text-slate-500 text-sm">Expiration Date</span>
                                    <span className="font-mono font-bold text-slate-800">
                                        {expirationDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                {isEligibleForRenewal ? (
                                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium flex items-start gap-3">
                                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                                        <div>
                                            {daysUntilExpiration > 0 
                                                ? `Your ID expires in ${daysUntilExpiration} days. You are eligible for renewal.` 
                                                : `Your ID has expired. Please renew immediately.`}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-start gap-3">
                                        <CheckCircle className="shrink-0 mt-0.5" size={16} />
                                        <div>
                                            Your ID is valid. Renewal becomes available on {renewalStartDate?.toLocaleDateString()}.
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-3 bg-slate-50 text-slate-500 rounded-xl text-sm font-medium">
                                Expiration date not available for this legacy record.
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => setFormMode(ApplicationType.ID_RENEWAL)}
                            disabled={!isEligibleForRenewal}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                                isEligibleForRenewal 
                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <RefreshCw size={20} />
                            Renew ID
                        </button>
                        
                        <button 
                            onClick={() => setFormMode(ApplicationType.ID_REPLACEMENT)}
                            className="w-full py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShieldAlert size={20} />
                            Lost or Damaged ID?
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER: APPLICATION FORM (New, Renewal, or Replacement) ---
  const currentMode = formMode || (activeTab === 'new' ? ApplicationType.ID_NEW : null);
  
  if (!currentMode) return null;

  const getTitle = () => {
      switch(currentMode) {
          case ApplicationType.ID_RENEWAL: return 'Renew ID Application';
          case ApplicationType.ID_REPLACEMENT: return 'Replace Lost/Damaged ID';
          default: return 'New ID Application';
      }
  };

  const getRequirements = () => {
      switch(currentMode) {
          case ApplicationType.ID_RENEWAL:
              return [
                  "Current Senior Citizen ID (if available)",
                  "Recent 1x1 ID Photo",
                  "Proof of Residency (Barangay Cert)"
              ];
          case ApplicationType.ID_REPLACEMENT:
              return [
                  "Affidavit of Loss (Notarized)",
                  "Valid Government Issued ID",
                  "Recent 1x1 ID Photo"
              ];
          default:
              return [
                  "Birth Certificate (PSA Copy)",
                  "Valid Government Issued ID",
                  "1x1 ID Photo (Recent)",
                  "Proof of Residency"
              ];
      }
  };

  const isRenewalOrReplacement = currentMode === ApplicationType.ID_RENEWAL || currentMode === ApplicationType.ID_REPLACEMENT;
  const isFormValid = files.length > 0 && 
                      (!isRenewalOrReplacement || (contactData.address && contactData.contactNumber));

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <header className="flex items-center gap-4">
        {(activeTab === 'renew' || hasIssuedID) && (
            <button onClick={() => setFormMode(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <ArrowRight className="rotate-180" size={24} />
            </button>
        )}
        <div>
            <h1 className="text-3xl font-bold text-slate-800">ID Issuance</h1>
            <p className="text-slate-500">Submit your application documents.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-primary-50 p-6 border-b border-primary-100">
            <h2 className="font-bold text-primary-800 text-lg flex items-center gap-2">
                {getTitle()}
            </h2>
            <p className="text-primary-600 text-sm mt-1">Please ensure all details and documents are correct.</p>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-8">
          
          {/* Mandatory Contact Update for Renewal/Replacement */}
          {isRenewalOrReplacement && (
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
                  <h3 className="font-bold text-blue-900 flex items-center gap-2">
                      <RefreshCw size={18} /> Update Contact Information
                  </h3>
                  <p className="text-sm text-blue-700">Please confirm or update your current address and contact details.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                              <MapPin size={12} /> Current Address <span className="text-red-500">*</span>
                          </label>
                          <input 
                              type="text" 
                              value={contactData.address}
                              onChange={(e) => setContactData(prev => ({...prev, address: e.target.value}))}
                              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                              placeholder="House No., Street, Barangay, City"
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                              <Phone size={12} /> Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input 
                              type="tel" 
                              value={contactData.contactNumber}
                              onChange={(e) => setContactData(prev => ({...prev, contactNumber: e.target.value}))}
                              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                              placeholder="0912 345 6789"
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                              <Mail size={12} /> Email Address
                          </label>
                          <input 
                              type="email" 
                              value={contactData.email}
                              onChange={(e) => setContactData(prev => ({...prev, email: e.target.value}))}
                              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                              placeholder="email@example.com"
                          />
                      </div>
                  </div>
              </div>
          )}

          {/* Requirements List */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-3">Requirements</h3>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                 {getRequirements().map((req, i) => (
                     <li key={i} className="flex items-center gap-2">
                         <CheckCircle size={16} className="text-green-500 shrink-0" /> {req}
                     </li>
                 ))}
             </ul>
          </div>

          {/* Photo / Document Section */}
          <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">
                  {currentMode === ApplicationType.ID_REPLACEMENT ? 'Upload Affidavit & Photo' : 'Upload Documents & Photo'} <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Upload */}
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary-300 transition-all cursor-pointer group h-48">
                      <input 
                        type="file" 
                        multiple
                        onChange={handleFileUpload}
                        accept="image/*,.pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Upload size={24} />
                      </div>
                      <p className="font-bold text-slate-700">Upload Files</p>
                      <p className="text-xs text-slate-400 mt-1">Select from device</p>
                  </div>

                  {/* Option 2: Camera */}
                  <button 
                    onClick={startCamera}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary-300 transition-all cursor-pointer group h-48"
                  >
                      <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Camera size={24} />
                      </div>
                      <p className="font-bold text-slate-700">Take a Photo</p>
                      <p className="text-xs text-slate-400 mt-1">Use your camera</p>
                  </button>
              </div>

              {/* Camera Modal / Area */}
              {isCameraOpen && (
                  <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
                      <div className="w-full max-w-2xl bg-black rounded-3xl overflow-hidden relative flex items-center justify-center">
                          <video 
                             ref={videoRef} 
                             autoPlay 
                             playsInline 
                             className="w-full h-auto bg-black relative z-10 max-h-[70vh] object-cover"
                          />
                          
                          {/* Face Frame Overlay */}
                          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                              <div className="w-64 h-80 sm:w-72 sm:h-96 border-4 border-white/80 border-dashed rounded-[50%] shadow-[0_0_0_2000px_rgba(0,0,0,0.7)] relative">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white/50 opacity-50">
                                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
                                      <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white"></div>
                                  </div>
                              </div>
                              <div className="absolute top-8 left-0 right-0 text-center z-30">
                                  <span className="bg-black/40 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                                      Position your face within the frame
                                  </span>
                              </div>
                          </div>

                          <canvas ref={canvasRef} className="hidden" />
                          
                          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 z-30">
                             <button 
                               onClick={stopCamera}
                               className="p-4 bg-white/20 text-white rounded-full backdrop-blur-md hover:bg-white/30 transition-colors"
                               title="Cancel"
                             >
                                <X size={24} />
                             </button>
                             <button 
                               onClick={capturePhoto}
                               className="p-1 rounded-full border-4 border-white/30 hover:scale-105 transition-transform"
                             >
                                <div className="p-5 bg-white rounded-full border-4 border-slate-900"></div>
                             </button>
                          </div>

                          {cameraError && (
                              <div className="absolute top-4 left-4 right-4 p-4 bg-red-500/80 text-white rounded-xl text-center z-40">
                                  {cameraError}
                              </div>
                          )}
                      </div>
                      <p className="text-white/60 mt-6 font-medium text-center text-sm max-w-md">
                          Ensure there is good lighting and your face is fully visible inside the oval guide.
                      </p>
                  </div>
              )}

              {/* File List */}
              {files.length > 0 && (
                  <div className="space-y-2 mt-4 bg-white border border-slate-100 rounded-xl p-2">
                      {files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <FileCheck size={18} className="text-primary-500" />
                              <span className="text-sm text-slate-700 flex-1 truncate">{file}</span>
                              <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors">
                                  <X size={16} />
                              </button>
                          </div>
                      ))}
                      {capturedImage && files.some(f => f.includes('Captured')) && (
                          <div className="p-2">
                              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Last Captured Preview</p>
                              <img src={capturedImage} alt="Captured" className="h-32 rounded-lg border border-slate-200 object-cover" />
                          </div>
                      )}
                  </div>
              )}
          </div>

          <div className="space-y-2">
             <label className="block text-sm font-bold text-slate-700">Remarks (Optional)</label>
             <textarea 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                rows={3}
                placeholder={currentMode === ApplicationType.ID_REPLACEMENT ? "Briefly explain how the ID was lost..." : "Any additional notes..."}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
             />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
};
