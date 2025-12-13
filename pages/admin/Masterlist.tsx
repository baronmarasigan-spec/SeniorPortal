import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, ApplicationType, ApplicationStatus, User } from '../../types';
import { Search, Download, Printer, CheckCircle2, XCircle, Clock, AlertCircle, Eye, X, Mail, Phone, MapPin, Key, User as UserIcon, Heart, FileText, Banknote, Stethoscope, Home, Calendar, Paperclip, CreditCard } from 'lucide-react';

export const Masterlist: React.FC = () => {
  const { users, applications } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter only Citizens
  const citizens = users.filter(u => u.role === Role.CITIZEN && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (u.seniorIdNumber && u.seniorIdNumber.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Helper to get status of a specific service type for a user
  const getStatus = (userId: string, type: ApplicationType | 'BENEFITS') => {
    // For Benefits, check if ANY benefit is active or approved
    if (type === 'BENEFITS') {
        const benefitApps = applications.filter(a => 
            a.userId === userId && 
            (a.type === ApplicationType.BENEFIT_CASH || a.type === ApplicationType.BENEFIT_MED)
        );
        if (benefitApps.some(a => a.status === ApplicationStatus.ISSUED || a.status === ApplicationStatus.APPROVED)) return { label: 'Active', color: 'bg-green-100 text-green-700' };
        if (benefitApps.some(a => a.status === ApplicationStatus.PENDING)) return { label: 'For Approval', color: 'bg-amber-100 text-amber-700' };
        return { label: 'None', color: 'bg-slate-100 text-slate-400' };
    }

    // For ID and PhilHealth
    let relevantTypes: ApplicationType[] = [];
    if (type === ApplicationType.ID_NEW) relevantTypes = [ApplicationType.ID_NEW, ApplicationType.ID_RENEWAL, ApplicationType.ID_REPLACEMENT];
    else if (type === ApplicationType.PHILHEALTH) relevantTypes = [ApplicationType.PHILHEALTH];

    const apps = applications.filter(a => a.userId === userId && relevantTypes.includes(a.type));
    
    // Sort by date descending to get latest
    apps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = apps[0];

    if (!latest) return { label: 'None', color: 'bg-slate-100 text-slate-400' };

    if (latest.status === ApplicationStatus.ISSUED) return { label: 'Issued', color: 'bg-purple-100 text-purple-700' };
    if (latest.status === ApplicationStatus.APPROVED) return { label: 'Approved', color: 'bg-green-100 text-green-700' };
    if (latest.status === ApplicationStatus.PENDING) return { label: 'For Approval', color: 'bg-amber-100 text-amber-700' };
    if (latest.status === ApplicationStatus.REJECTED) return { label: 'Rejected', color: 'bg-red-100 text-red-700' };
    
    return { label: 'None', color: 'bg-slate-100 text-slate-400' };
  };

  const StatusBadge = ({ status }: { status: { label: string, color: string } }) => (
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${status.color}`}>
          {status.label}
      </span>
  );

  const UserProfileModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
    // Find Registration Application to get documents
    const registrationApp = applications.find(a => a.userId === user.id && a.type === ApplicationType.REGISTRATION);
    const uploadedDocs = registrationApp?.documents || [];

    // Fallback/Mock documents if none found but user is in Masterlist (for demo purposes)
    const displayDocs = uploadedDocs.length > 0 ? uploadedDocs : ['BirthCertificate_PSA.pdf', 'ValidID.jpg'];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
         <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="relative h-32 bg-slate-900 flex items-center px-8 shrink-0 overflow-hidden">
               {/* Decorative Background */}
               <div className="absolute inset-0 opacity-20">
                   <div className="absolute -right-10 -top-20 w-64 h-64 bg-primary-500 rounded-full blur-3xl"></div>
                   <div className="absolute -left-10 bottom-0 w-48 h-48 bg-blue-500 rounded-full blur-2xl"></div>
               </div>

               <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white rounded-full transition-colors z-20">
                 <X size={20} />
               </button>
               <h2 className="text-2xl font-bold text-white flex items-center gap-3 relative z-10">
                 <UserIcon size={24} className="text-primary-400" /> 
                 <span className="tracking-tight">Citizen Profile</span>
               </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 px-8 pb-8">
               
               {/* Profile Header Card */}
               <div className="relative -mt-12 mb-8 flex flex-col md:flex-row gap-6 items-end md:items-end z-10 px-2">
                 <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-xl shrink-0 mx-auto md:mx-0 relative group">
                    <img 
                        src={user.avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover rounded-xl bg-slate-100 border border-slate-100 group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 pointer-events-none"></div>
                 </div>
                 
                 <div className="pb-2 text-center md:text-left flex-1 min-w-0 space-y-2">
                    <h3 className="text-3xl font-extrabold text-slate-900 leading-tight">{user.name}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold shadow-sm border ${user.seniorIdNumber ? 'bg-slate-800 text-white border-slate-700' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                            <CreditCard size={14} />
                            <span className="font-mono tracking-wide">{user.seniorIdNumber || 'NO ID ISSUED'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-white text-slate-600 border border-slate-200 shadow-sm">
                            <Mail size={14} className="text-slate-400"/> 
                            <span className="truncate max-w-[200px]">{user.email}</span>
                        </span>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Personal & Contact Information */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
                          <UserIcon size={18} className="text-blue-500" /> Personal Details
                      </h4>
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Civil Status</label>
                              <p className="font-semibold text-slate-700 text-sm">{user.civilStatus || 'N/A'}</p>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sex</label>
                              <p className="font-semibold text-slate-700 text-sm">{user.sex || 'N/A'}</p>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Calendar size={10}/> Birth Date</label>
                              <p className="font-semibold text-slate-700 text-sm">{user.birthDate}</p>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1"><MapPin size={10}/> Birth Place</label>
                              <p className="font-semibold text-slate-700 text-sm truncate" title={user.birthPlace}>{user.birthPlace || 'San Juan City'}</p>
                          </div>
                          <div className="col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Address</label>
                              <p className="font-semibold text-slate-700 text-sm leading-snug">{user.address}</p>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Phone size={10}/> Mobile</label>
                              <p className="font-semibold text-slate-700 text-sm font-mono">{user.contactNumber || 'N/A'}</p>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Home size={10}/> Living Arrangement</label>
                              <p className="font-semibold text-slate-700 text-sm">{user.livingArrangement || 'Owned'}</p>
                          </div>
                      </div>
                  </div>

                  {/* Socio-Economic & Health */}
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
                              <Banknote size={18} className="text-emerald-500" /> Economic Status
                          </h4>
                          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                              <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pensioner?</label>
                                  <p className={`font-bold text-sm ${user.isPensioner ? 'text-emerald-600' : 'text-slate-500'}`}>{user.isPensioner ? 'Yes' : 'No'}</p>
                              </div>
                              {user.isPensioner && (
                                  <>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Amount</label>
                                        <p className="font-mono font-bold text-slate-700 text-sm">{user.pensionAmount ? `₱${user.pensionAmount}` : 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source</label>
                                        <p className="font-semibold text-slate-700 text-sm">{user.pensionSource || 'SSS/GSIS'}</p>
                                    </div>
                                  </>
                              )}
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
                              <Stethoscope size={18} className="text-red-500" /> Health Condition
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                              <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Existing Illness</label>
                                  <p className="font-semibold text-slate-700 text-sm">{user.hasIllness ? 'Yes' : 'None Declared'}</p>
                              </div>
                              {user.hasIllness && (
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Details</label>
                                      <p className="font-medium text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        {user.illnessDetails || 'N/A'}
                                      </p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 lg:col-span-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
                          <FileText size={18} className="text-orange-500" /> Submitted Documents
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                         {displayDocs.map((doc, idx) => (
                             <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group">
                                 <div className="p-2.5 bg-white rounded-lg text-slate-400 group-hover:text-primary-500 transition-colors shadow-sm border border-slate-100">
                                     <Paperclip size={18} />
                                 </div>
                                 <div className="overflow-hidden">
                                     <p className="text-sm font-semibold text-slate-700 truncate">{doc}</p>
                                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">View File</p>
                                 </div>
                             </div>
                         ))}
                         {displayDocs.length === 0 && (
                             <p className="text-slate-500 text-sm italic p-4">No documents found.</p>
                         )}
                      </div>
                  </div>

                  {/* Credentials Section */}
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 lg:col-span-2">
                       <h4 className="text-amber-800 font-bold flex items-center gap-2 mb-4">
                         <Key size={18} /> Account Credentials
                       </h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                              <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider mb-1">Username</p>
                              <p className="font-mono text-slate-800 font-bold text-base">{user.username || 'Not set'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                              <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider mb-1">Password</p>
                              <p className="font-mono text-slate-800 font-bold text-base">{user.password || '••••••'}</p>
                          </div>
                       </div>
                       <p className="text-xs text-amber-700/70 mt-3 italic flex items-center gap-1">
                         <AlertCircle size={12} /> Admin view only. Ensure confidentiality when viewing user credentials.
                       </p>
                   </div>
               </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
               <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg">
                 Close Profile
               </button>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Citizen Masterlist</h1>
          <p className="text-slate-500">Comprehensive database of registered senior citizens and their service statuses.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                <Printer size={18} />
                <span className="hidden md:inline">Print</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20">
                <Download size={18} />
                <span className="hidden md:inline">Export</span>
            </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100">
           <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text"
               placeholder="Search by name, email, or ID..."
               className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-semibold">User Details</th>
                <th className="p-4 font-semibold">Senior ID</th>
                <th className="p-4 font-semibold">ID Issuance</th>
                <th className="p-4 font-semibold">Benefits</th>
                <th className="p-4 font-semibold">PhilHealth</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citizens.map((citizen) => (
                <tr key={citizen.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={citizen.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                      <div>
                        <p className="font-bold text-slate-800">{citizen.name}</p>
                        <p className="text-xs text-slate-500">{citizen.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono font-medium">
                      {citizen.seniorIdNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                      <StatusBadge status={getStatus(citizen.id, ApplicationType.ID_NEW)} />
                  </td>
                  <td className="p-4">
                      <StatusBadge status={getStatus(citizen.id, 'BENEFITS')} />
                  </td>
                  <td className="p-4">
                      <StatusBadge status={getStatus(citizen.id, ApplicationType.PHILHEALTH)} />
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedUser(citizen)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 justify-end hover:underline"
                    >
                      <Eye size={16} /> View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {citizens.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-500">No citizens found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};