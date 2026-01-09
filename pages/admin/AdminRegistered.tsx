
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType, Role, User, RegistryRecord, Application } from '../../types';
import { 
  CheckCircle, XCircle, Clock, Archive, Search, 
  FileText, Key, X, MapPin, Phone, Mail, 
  Calendar, UserCheck, AlertCircle, Info, Upload,
  ArrowLeft, ArrowRight, User as UserIcon, Heart, Banknote, HelpCircle, UserPlus, Eye, Download, File, UserMinus, Printer, ZoomIn, ZoomOut, ChevronDown, Filter, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle as QuestionMark
} from 'lucide-react';
import { notifyRegistrationSuccess } from '../../services/notification';

type SortKey = 'date' | 'userName' | 'type' | 'source';
type SortDir = 'asc' | 'desc';

interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText: string;
  type: 'primary' | 'emerald' | 'danger';
}

export const AdminRegistered: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { applications, users, updateApplicationStatus, registryRecords, addApplication } = useApp();
  
  // Walk-in State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RegistryRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RegistryRecord | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  
  // Viewing Details State
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  // Reject with Remarks State
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  // --- Confirmation Modal State ---
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // --- For Approval Filters & Sort ---
  const [approvalSearch, setApprovalSearch] = useState('');
  const [approvalRegType, setApprovalRegType] = useState('All');
  const [approvalDate, setApprovalDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
    }
    const filtered = registryRecords.filter(r => 
      r.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
    setHasSearched(true);
  };

  const handleManualEntry = () => {
      setSelectedRecord(null);
      setIsManualEntry(true);
      setFormData({
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
  };

  const handleSelectRecord = (record: RegistryRecord) => {
    const age = calculateAge(record.birthDate);
    if (record.isRegistered) return; 
    if (age < 60) return; 

    setConfirmConfig({
      title: 'Select Registry Record',
      message: `Are you sure you want to select ${record.firstName} ${record.lastName}? This will pre-fill the walk-in registration form with their registry data.`,
      confirmText: 'Yes, Select Record',
      type: 'primary',
      onConfirm: () => {
        setIsManualEntry(false);
        setSelectedRecord(record);
        setFormData({
          ...formData,
          firstName: record.firstName,
          middleName: record.middleName || '',
          lastName: record.lastName,
          suffix: record.suffix || '',
          birthDate: record.birthDate,
          birthPlace: record.birthPlace || '',
          sex: record.sex || '',
          civilStatus: record.civilStatus || '',
          address: record.address || `${record.houseNo || ''} ${record.street || ''} ${record.barangay || ''} ${record.city || ''}`.trim()
        });
        setSearchQuery('');
        setHasSearched(false);
        setConfirmConfig(null);
      }
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`;

    setConfirmConfig({
      title: 'Complete Registration',
      message: `Are you sure you want to complete the walk-in registration for ${fullName}? This will submit their application for administrative processing.`,
      confirmText: 'Submit Registration',
      type: 'emerald',
      onConfirm: async () => {
        addApplication({
          userId: `walkin_${Date.now()}`,
          userName: fullName,
          type: ApplicationType.REGISTRATION,
          description: `Walk-in Registration Details:\nFirst Name: ${formData.firstName}\nLast Name: ${formData.lastName}\nBirth Date: ${formData.birthDate}\nBirth Place: ${formData.birthPlace}\nGender: ${formData.sex}\nCivil Status: ${formData.civilStatus}\nAddress: ${formData.address}\nEmail: ${formData.email}\nPhone: ${formData.contactNumber}\nLiving: ${formData.livingArrangement}\nPensioner: ${formData.isPensioner ? 'Yes' : 'No'}\nPension Source: ${formData.pensionSource}\nPension Amount: ${formData.pensionAmount}\nHas Illness: ${formData.hasIllness ? 'Yes' : 'No'}\nIllness Details: ${formData.illnessDetails}\nVerified via Registry: ${selectedRecord?.type === 'LCR' ? 'LCR' : selectedRecord?.type === 'PWD' ? 'PWD' : 'MANUAL'}`,
          documents: files.length > 0 ? files : ['Verified_By_Admin.pdf']
        });

        await notifyRegistrationSuccess(fullName, formData.contactNumber, formData.email);
        
        setSelectedRecord(null);
        setIsManualEntry(false);
        setFiles([]);
        setConfirmConfig(null);
        navigate('/admin/registered/approval');
      }
    });
  };

  const handleRejectSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (rejectingApp) {
      const capturedRemarks = rejectionRemarks;
      setConfirmConfig({
        title: 'Confirm Rejection',
        message: `Are you sure you want to REJECT ${rejectingApp.userName}'s registration? The provided remarks will be sent as a notification.`,
        confirmText: 'Reject Application',
        type: 'danger',
        onConfirm: () => {
          updateApplicationStatus(rejectingApp.id, ApplicationStatus.REJECTED, capturedRemarks || 'Requirements incomplete or inconsistent.');
          setRejectingApp(null);
          setRejectionRemarks('');
          setConfirmConfig(null);
          if (viewingApp) setViewingApp(null);
        }
      });
    }
  };

  const handleApproveAction = (app: Application, closeModal?: () => void) => {
    setConfirmConfig({
      title: 'Approve Registration',
      message: `Are you sure you want to approve ${app.userName}'s registration? This will grant them official status and notify them via SMS/Email.`,
      confirmText: 'Approve Now',
      type: 'emerald',
      onConfirm: () => {
        updateApplicationStatus(app.id, ApplicationStatus.APPROVED);
        if (closeModal) closeModal();
        setConfirmConfig(null);
        // All approved registration status redirects to Masterlist
        navigate('/admin/masterlist');
      }
    });
  };

  // Function to simulate real browser download
  const handleDownloadFile = (filename: string) => {
    const dummyContent = `Placeholder content for document: ${filename}\nApplication ID: ${viewingApp?.id || 'N/A'}\nTimestamp: ${new Date().toLocaleString()}`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.includes('.') ? filename : `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to parse source and type from app
  const getRegDetails = (app: Application) => {
    const isWalkIn = app.userId.startsWith('walkin_') || app.description.includes('Walk-in');
    const sourceString = app.description.match(/Verified via Registry: (.*)/)?.[1] || 'MANUAL';
    const birthDateMatch = app.description.match(/Birth Date: (.*)/);
    const birthDate = birthDateMatch ? birthDateMatch[1].trim() : 'Not Specified';
    
    let source = 'Manual';
    if (sourceString.includes('LCR')) source = 'Local Civil';
    else if (sourceString.includes('PWD')) source = 'PWD';

    return {
      type: isWalkIn ? 'Walk-in' : 'Online',
      source: source,
      birthDate: birthDate
    };
  };

  // --- Sort Handler ---
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDir('asc');
    }
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={12} className="text-slate-500 opacity-30" />;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-primary-400" /> : <ArrowDown size={12} className="text-primary-400" />;
  };

  // --- Filtered & Sorted Registrations ---
  const pendingRegistrations = useMemo(() => {
    let filtered = applications.filter(a => 
      a.type === ApplicationType.REGISTRATION && a.status === ApplicationStatus.PENDING
    );

    // Apply Name Search
    if (approvalSearch) {
        filtered = filtered.filter(a => a.userName.toLowerCase().includes(approvalSearch.toLowerCase()));
    }

    // Apply Reg Type Filter
    if (approvalRegType !== 'All') {
        filtered = filtered.filter(a => {
            const { type } = getRegDetails(a);
            return type === approvalRegType;
        });
    }

    // Apply Date Filter
    if (approvalDate) {
        filtered = filtered.filter(a => a.date === approvalDate);
    }

    // Apply Sorting
    return filtered.sort((a, b) => {
        let valA: any = '';
        let valB: any = '';

        if (sortKey === 'date') {
            valA = new Date(a.date).getTime();
            valB = new Date(b.date).getTime();
        } else if (sortKey === 'userName') {
            valA = a.userName.toLowerCase();
            valB = b.userName.toLowerCase();
        } else if (sortKey === 'type') {
            valA = getRegDetails(a).type;
            valB = getRegDetails(b).type;
        } else if (sortKey === 'source') {
            valA = getRegDetails(a).source;
            valB = getRegDetails(b).source;
        }

        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });
  }, [applications, approvalSearch, approvalRegType, approvalDate, sortKey, sortDir]);

  // --- Modal Rendering Logic (Extracted for Stability) ---
  
  const renderConfirmationModal = () => {
    if (!confirmConfig) return null;
    const { type, title, message, confirmText, onConfirm } = confirmConfig;
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmConfig(null)} />
        <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up">
           <div className={`p-8 text-center space-y-4`}>
              <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${
                type === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
              }`}>
                 <QuestionMark size={32} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                 <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
              </div>
           </div>
           <div className="p-4 bg-slate-50 flex gap-3">
              <button 
                type="button"
                onClick={() => setConfirmConfig(null)} 
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={onConfirm} 
                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-widest ${
                  type === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 
                  type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20'
                }`}
              >
                {confirmText}
              </button>
           </div>
        </div>
      </div>
    );
  };

  const renderRejectionModal = () => {
    if (!rejectingApp) return null;
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRejectingApp(null)} />
        <form 
          onSubmit={(e) => handleRejectSubmit(e)}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-20 overflow-hidden animate-scale-up"
        >
           <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                 <UserMinus size={20} />
              </div>
              <h3 className="font-bold text-red-800">Reject Registration</h3>
           </div>
           <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Provide a reason for rejecting <strong>{rejectingApp.userName}</strong>'s application. This will be sent to the citizen.</p>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                rows={4}
                placeholder="Reason for rejection (e.g., PSA copy is blurred, residency not verified...)"
                value={rejectionRemarks}
                required
                onChange={(e) => setRejectionRemarks(e.target.value)}
              />
           </div>
           <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setRejectingApp(null)} 
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
              >
                Submit Rejection
              </button>
           </div>
        </form>
      </div>
    );
  };

  const renderApplicationDetailsModal = () => {
    if (!viewingApp) return null;
    const lines = viewingApp.description.split('\n');
    const { type, source } = getRegDetails(viewingApp);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingApp(null)} />
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
          
          <div className="bg-slate-900 p-8 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white">
                  <UserIcon size={24} />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white leading-none">Detailed Registration Review</h2>
                   <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/70 px-2 py-0.5 rounded">{type}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded">{source}</span>
                   </div>
                </div>
             </div>
             <button type="button" onClick={() => setViewingApp(null)} className="p-2 text-slate-400 hover:text-white transition-colors">
               <X size={24} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
            {/* Form Details Grid */}
            <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Citizen Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    {lines.map((line, idx) => {
                    if (!line.includes(':')) return null;
                    const [label, ...valueParts] = line.split(':');
                    const value = valueParts.join(':').trim();
                    if (!value || value === 'No' || value === 'None' || value === 'undefined' || label.includes('Verified via Registry')) return null;

                    return (
                        <div key={idx} className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{value}</p>
                        </div>
                    );
                    })}
                </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                 Supporting Documents
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewingApp.documents?.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:bg-white hover:border-primary-200 transition-all">
                       <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-primary-500 shadow-sm border border-slate-100">
                             <File size={20} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 truncate">{doc}</span>
                       </div>
                       <div className="flex items-center gap-1 shrink-0">
                          <button 
                            type="button"
                            title="View Online"
                            onClick={() => setActiveFile(doc)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                          >
                             <Eye size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDownloadFile(doc)}
                            title="Download File"
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                          >
                             <Download size={18} />
                          </button>
                       </div>
                    </div>
                  ))}
                  {(!viewingApp.documents || viewingApp.documents.length === 0) && (
                    <p className="text-slate-400 text-sm italic">No digital copies provided.</p>
                  )}
               </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
             <button
                type="button"
                onClick={() => { setRejectingApp(viewingApp); }}
                className="px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all text-xs"
             >
                Reject
             </button>
             <button
                type="button"
                onClick={() => handleApproveAction(viewingApp, () => setViewingApp(null))}
                className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all text-xs"
             >
                Approve & Register
             </button>
          </div>
        </div>

        {/* Improved Document Viewer Overlay */}
        {activeFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
             <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setActiveFile(null)} />
             <div className="bg-slate-50 w-full max-w-5xl h-full rounded-[2.5rem] relative z-20 flex flex-col overflow-hidden animate-scale-up shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                
                {/* Viewer Header */}
                <div className="px-8 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                         <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-none">{activeFile}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Registry Document Scan</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Zoom In"><ZoomIn size={20}/></button>
                      <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Zoom Out"><ZoomOut size={20}/></button>
                      <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Print"><Printer size={20}/></button>
                      <div className="w-px h-6 bg-slate-200 mx-2"></div>
                      <button type="button" onClick={() => setActiveFile(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><X size={24}/></button>
                   </div>
                </div>

                {/* Simulated Document Content */}
                <div className="flex-1 bg-slate-200 overflow-y-auto p-12 flex justify-center custom-scrollbar">
                   <div className="w-full max-w-[800px] aspect-[1/1.4] bg-white shadow-2xl rounded-sm p-16 relative overflow-hidden ring-1 ring-slate-300">
                      {/* Paper Texture Overlay */}
                      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
                      
                      {/* Header Logo */}
                      <div className="flex flex-col items-center text-center mb-12 border-b-2 border-slate-100 pb-8">
                         <img src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" className="w-20 h-20 mb-4 opacity-80" alt="Seal" />
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Republic of the Philippines</h4>
                         <h3 className="text-lg font-black text-slate-800">CITY GOVERNMENT OF SAN JUAN</h3>
                         <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Official Registry Document Document Scan</p>
                      </div>

                      {/* Content Placeholders */}
                      <div className="space-y-8 animate-pulse">
                         <div className="h-4 bg-slate-50 w-1/3 rounded"></div>
                         <div className="space-y-3">
                            <div className="h-10 bg-slate-50 w-full rounded-lg border border-slate-100"></div>
                            <div className="h-10 bg-slate-50 w-full rounded-lg border border-slate-100"></div>
                            <div className="h-10 bg-slate-50 w-2/3 rounded-lg border border-slate-100"></div>
                         </div>
                         <div className="h-40 bg-slate-50 w-full rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <div className="text-center opacity-30">
                               <File size={48} className="mx-auto mb-2" />
                               <p className="text-xs font-bold uppercase tracking-widest">Document Data Visualized</p>
                            </div>
                         </div>
                         <div className="flex justify-between pt-12">
                            <div className="space-y-2">
                               <div className="h-1 bg-slate-300 w-32"></div>
                               <div className="h-3 bg-slate-50 w-24"></div>
                            </div>
                            <div className="space-y-2">
                               <div className="h-1 bg-slate-300 w-32"></div>
                               <div className="h-3 bg-slate-50 w-24"></div>
                            </div>
                         </div>
                      </div>

                      {/* Document Watermark */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-30deg] pointer-events-none select-none text-[80px] font-black whitespace-nowrap">
                         CERTIFIED OFFICIAL SCAN
                      </div>
                   </div>
                </div>

                {/* Viewer Footer */}
                <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={14} /> Confidential Document for Administrative Review Only
                   </p>
                   <div className="flex gap-4">
                      <button type="button" onClick={() => setActiveFile(null)} className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-xs">Close</button>
                      <button 
                        type="button"
                        onClick={() => handleDownloadFile(activeFile)}
                        className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all text-xs flex items-center gap-2"
                      >
                         <Download size={16} /> Download Copy
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  // 0. WALK-IN TAB
  if (tab === 'walk-in') {
    const showForm = selectedRecord || isManualEntry;

    return (
      <div className="space-y-6 animate-fade-in">
        {renderConfirmationModal()}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Walk-in Registration</h1>
            <p className="text-slate-500">Search registry or enter citizen details manually from scratch.</p>
          </div>
          {showForm ? (
            <button 
              type="button"
              onClick={() => { setSelectedRecord(null); setIsManualEntry(false); }}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
            >
              <ArrowLeft size={18} />
              Change Method
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleManualEntry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all text-xs"
            >
              <UserPlus size={18} /> Manual Registration
            </button>
          )}
        </header>

        {!showForm ? (
          <div className="space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
              <div className="flex flex-col items-center text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Search size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Registry Verification</h3>
                <p className="text-slate-500 text-sm">Verify the citizen against the LCR/PWD Masterlist or proceed with a manual registration if not found.</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 max-w-3xl mx-auto">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                    <input 
                    type="text"
                    placeholder="Type Full Name or Registry ID Number..."
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button 
                    type="button"
                    onClick={handleSearch}
                    className="px-8 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 w-full md:w-auto"
                >
                    Search
                </button>
              </div>

              {hasSearched && (
                <div className="mt-8 border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl animate-fade-in-up">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="p-6">ID Number</th>
                        <th className="p-6">Registry Source</th>
                        <th className="p-6">Name & Birthdate</th>
                        <th className="p-6 text-center">Eligibility / Status</th>
                        <th className="p-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {searchResults.length > 0 ? (
                        searchResults.map(record => {
                          const age = calculateAge(record.birthDate);
                          const isEligible = age >= 60;
                          
                          return (
                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-6 font-mono text-sm text-slate-600 font-bold">{record.id}</td>
                              <td className="p-6">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${record.type === 'LCR' ? 'bg-primary-50 text-primary-700' : 'bg-blue-50 text-blue-700'}`}>
                                  {record.type === 'LCR' ? 'Local Civil' : 'PWD Database'}
                                </span>
                              </td>
                              <td className="p-6">
                                <p className="font-black text-slate-800 text-lg leading-none mb-1">{record.firstName} {record.lastName}</p>
                                <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><Calendar size={12}/> Born {record.birthDate}</p>
                              </td>
                              <td className="p-6 text-center">
                                {record.isRegistered ? (
                                  <div className="inline-flex flex-col items-center">
                                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                                      <CheckCircle size={12} /> Already Registered
                                    </span>
                                  </div>
                                ) : isEligible ? (
                                  <div className="inline-flex flex-col items-center">
                                    <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                                      <UserCheck size={12} /> Eligible
                                    </span>
                                    <span className="text-[10px] text-blue-500 font-bold">Age {age}</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex flex-col items-center">
                                    <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                                      <XCircle size={12} /> Not Eligible
                                    </span>
                                    <span className="text-[10px] text-red-400 font-bold">Age {age}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-6 text-right">
                                <button 
                                  type="button"
                                  disabled={record.isRegistered || !isEligible}
                                  onClick={() => handleSelectRecord(record)}
                                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md ${
                                    record.isRegistered || !isEligible 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20 transform hover:-translate-x-1'
                                  }`}
                                >
                                  {record.isRegistered ? 'Registered' : !isEligible ? 'Ineligible' : 'Select'} <ArrowRight size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-20 text-center">
                            <HelpCircle size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6">No matching registry records found.</p>
                            <button 
                                type="button"
                                onClick={handleManualEntry}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-primary-50 text-primary-600 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-100 transition-all border-2 border-primary-200 shadow-lg shadow-primary-500/5"
                            >
                                <UserPlus size={20} /> Register Citizen Manually
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleWalkInSubmit} className="space-y-8 pb-20">
              
              {/* Profile Section */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
                <div className="bg-slate-900 p-10 text-white flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl rotate-3">
                      <UserIcon size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">Personal Profile</h2>
                      <p className="text-slate-400 text-sm font-medium mt-1">
                          {isManualEntry ? 'Manual Registration Entry' : `Registry Record: ${selectedRecord?.id}`}
                      </p>
                    </div>
                  </div>
                  {!isManualEntry && (
                    <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 flex items-center gap-2">
                        <CheckCircle size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Verified Eligible</span>
                    </div>
                  )}
                </div>

                <div className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Birth Date</label>
                      <input type="date" name="birthDate" value={formData.birthDate} onChange={handleFormChange} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gender</label>
                      <select name="sex" value={formData.sex} onChange={handleFormChange} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg appearance-none">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Residential Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleFormChange} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg" placeholder="juan@email.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Number</label>
                      <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleFormChange} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg" placeholder="09XX XXX XXXX" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Socio-Economic Section */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-12 space-y-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900">Socio-Economic Info</h3>
                  <p className="text-slate-500 text-base font-medium">Verify living conditions for assistance program prioritization.</p>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <MapPin size={16} className="text-primary-500"/> Living Arrangement
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Owned', 'Rent', 'Living with Relatives', 'Others'].map(opt => (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => setFormData(prev => ({...prev, livingArrangement: opt}))}
                          className={`px-4 py-5 rounded-2xl border-2 text-sm font-black transition-all ${
                            formData.livingArrangement === opt 
                            ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-lg shadow-primary-500/10' 
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <label className="text-sm font-black text-slate-700 flex items-center gap-3 uppercase tracking-wider">
                          <Banknote size={20} className="text-emerald-500" /> Pensioner?
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="isPensioner" checked={formData.isPensioner} onChange={handleFormChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                      {formData.isPensioner && (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in-down p-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source (e.g. SSS)</label>
                            <input type="text" name="pensionSource" value={formData.pensionSource} onChange={handleFormChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</label>
                            <input type="number" name="pensionAmount" value={formData.pensionAmount} onChange={handleFormChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <label className="text-sm font-black text-slate-700 flex items-center gap-3 uppercase tracking-wider">
                          <Heart size={20} className="text-red-500" /> Major Illness?
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="hasIllness" checked={formData.hasIllness} onChange={handleFormChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                      </div>
                      {formData.hasIllness && (
                        <div className="animate-fade-in-down p-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</label>
                          <textarea name="illnessDetails" value={formData.illnessDetails} onChange={handleFormChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none resize-none focus:border-primary-500" rows={2} placeholder="List medical conditions..."></textarea>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Scan Section */}
              <div className="bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 p-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <FileText size={18} className="text-primary-600" /> Document Verification Session
                </h3>
                
                <div className="relative border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-white p-16 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary-300 transition-all cursor-pointer group">
                  <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Upload size={36} />
                  </div>
                  <p className="font-black text-slate-800 text-xl mb-2">Upload Physical Proofs</p>
                  <p className="text-sm text-slate-400 max-w-sm font-medium">Attach scans of PSA Birth Certificate, Barangay Certificate, and Valid Government IDs.</p>
                </div>

                {files.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-lg text-sm group">
                        <span className="flex items-center gap-3 font-bold text-slate-700">
                          <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
                            <CheckCircle size={16} />
                          </div> 
                          {f}
                        </span>
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition-colors">
                          <X size={20}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-6 pt-4">
                 <button 
                  type="button"
                  onClick={() => { setSelectedRecord(null); setIsManualEntry(false); }}
                  className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-500 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                  type="submit"
                  className="px-14 py-5 bg-primary-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-primary-700 shadow-2xl shadow-primary-600/40 transition-all flex items-center gap-4 transform hover:-translate-y-2 active:translate-y-0"
                 >
                   <UserCheck size={28} />
                   Complete Registration
                 </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // 1. FOR APPROVAL
  if (tab === 'approval') {
    return (
      <div className="space-y-6">
        {renderConfirmationModal()}
        {renderApplicationDetailsModal()}
        {renderRejectionModal()}
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Registration Approvals</h1>
            <p className="text-slate-500">Review pending new senior citizen registrations.</p>
          </div>
        </header>

        {/* Filter Toolbar */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 md:space-y-0 md:flex items-center gap-4 animate-fade-in-down">
            {/* Search by Name */}
            <div className="flex-1 relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search by Full Name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                    value={approvalSearch}
                    onChange={(e) => setApprovalSearch(e.target.value)}
                />
            </div>

            {/* Reg Type Dropdown */}
            <div className="relative min-w-[180px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Filter size={16} />
                </div>
                <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold appearance-none cursor-pointer"
                    value={approvalRegType}
                    onChange={(e) => setApprovalRegType(e.target.value)}
                >
                    <option value="All">All Reg Types</option>
                    <option value="Online">Online</option>
                    <option value="Walk-in">Walk-in</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                </div>
            </div>

            {/* Submission Date Filter */}
            <div className="relative min-w-[200px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Calendar size={16} />
                </div>
                <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold cursor-pointer"
                    value={approvalDate}
                    onChange={(e) => setApprovalDate(e.target.value)}
                />
                {approvalDate && (
                    <button 
                        type="button"
                        onClick={() => setApprovalDate('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            
            {/* Clear All Filters */}
            {(approvalSearch || approvalRegType !== 'All' || approvalDate) && (
                <button 
                    type="button"
                    onClick={() => { setApprovalSearch(''); setApprovalRegType('All'); setApprovalDate(''); }}
                    className="text-primary-600 font-bold text-xs uppercase tracking-widest hover:underline px-2"
                >
                    Clear All
                </button>
            )}
        </div>
        
        {pendingRegistrations.length === 0 ? (
           <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No matching registrations</h3>
             <p className="text-slate-500 mt-2">Adjust your filters or wait for new submissions.</p>
           </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                    <th 
                        className="p-6 cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('date')}
                    >
                       <div className="flex items-center gap-2">Submission Date <SortIcon colKey="date" /></div>
                    </th>
                    <th 
                        className="p-6 cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('userName')}
                    >
                       <div className="flex items-center gap-2">Name & Birthdate <SortIcon colKey="userName" /></div>
                    </th>
                    <th 
                        className="p-6 cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('type')}
                    >
                       <div className="flex items-center gap-2">Reg Type <SortIcon colKey="type" /></div>
                    </th>
                    <th 
                        className="p-6 cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => handleSort('source')}
                    >
                       <div className="flex items-center gap-2">Registry Source <SortIcon colKey="source" /></div>
                    </th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRegistrations.map((app) => {
                    const { type, source, birthDate } = getRegDetails(app);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-6">
                           <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{app.date}</span>
                        </td>
                        <td className="p-6">
                           <div className="space-y-1">
                             <p className="font-black text-slate-800 text-base leading-tight">{app.userName}</p>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
                               <Calendar size={10} /> Born {birthDate}
                             </p>
                           </div>
                        </td>
                        <td className="p-6">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${type === 'Walk-in' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                              {type}
                           </span>
                        </td>
                        <td className="p-6">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${source === 'Manual' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {source}
                           </span>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                 type="button"
                                 onClick={() => setViewingApp(app)}
                                 className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-wider flex items-center gap-2"
                              >
                                 <Eye size={14} /> Details
                              </button>
                              <div className="h-6 w-px bg-slate-100 mx-1"></div>
                              <button 
                                 type="button"
                                 onClick={() => { setRejectingApp(app); setRejectionRemarks(''); }}
                                 className="p-2 bg-white border border-slate-200 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                 title="Reject with Remarks"
                              >
                                 <UserMinus size={18} />
                              </button>
                              <button 
                                 type="button"
                                 onClick={() => handleApproveAction(app)}
                                 className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 transition-all"
                                 title="Quick Approve"
                              >
                                 <CheckCircle size={18} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. LIST OF DISAPPROVED
  if (tab === 'disapproved') {
    const rejectedApps = applications.filter(a => 
      a.type === ApplicationType.REGISTRATION && a.status === ApplicationStatus.REJECTED
    );

    return (
      <div className="space-y-6">
        {renderApplicationDetailsModal()}
        <header>
          <h1 className="text-3xl font-bold text-slate-800">Disapproved Registrations</h1>
          <p className="text-slate-500">History of rejected registration applications.</p>
        </header>

        {rejectedApps.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive size={32} />
                </div>
                <p className="text-slate-500">No disapproved registrations found.</p>
            </div>
        ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="p-6">Date</th>
                      <th className="p-6">Full Name</th>
                      <th className="p-6">Rejection Reason</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rejectedApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 text-xs font-bold text-slate-400">{app.date}</td>
                        <td className="p-6 font-bold text-slate-800">{app.userName}</td>
                        <td className="p-6 text-sm text-red-600 font-medium italic">{app.rejectionReason || 'No reason specified'}</td>
                        <td className="p-6 text-right">
                          <button 
                            type="button"
                            onClick={() => setViewingApp(app)}
                            className="text-primary-600 hover:text-primary-700 font-bold text-xs flex items-center justify-end gap-1"
                          >
                            <Eye size={16} /> View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}
      </div>
    );
  }

  return <div>Select a sub-menu</div>;
};
