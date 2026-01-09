
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, ApplicationType, ApplicationStatus, User } from '../../types';
import { Search, Download, Printer, X } from 'lucide-react';

export const Masterlist: React.FC = () => {
  const { users, applications } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const citizens = users.filter(u => u.role === Role.CITIZEN && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (u.seniorIdNumber && u.seniorIdNumber.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const getStatus = (userId: string, type: ApplicationType | 'BENEFITS') => {
    if (type === 'BENEFITS') {
        const benefitApps = applications.filter(a => 
            a.userId === userId && 
            (a.type === ApplicationType.BENEFIT_CASH || a.type === ApplicationType.BENEFIT_MED)
        );
        if (benefitApps.some(a => a.status === ApplicationStatus.ISSUED || a.status === ApplicationStatus.APPROVED)) return { label: 'Active', color: 'bg-green-100 text-green-700' };
        if (benefitApps.some(a => a.status === ApplicationStatus.PENDING)) return { label: 'For Approval', color: 'bg-amber-100 text-amber-700' };
        return { label: 'None', color: 'bg-slate-100 text-slate-400' };
    }

    let relevantTypes: ApplicationType[] = [];
    if (type === ApplicationType.ID_NEW) relevantTypes = [ApplicationType.ID_NEW, ApplicationType.ID_RENEWAL, ApplicationType.ID_REPLACEMENT];
    else if (type === ApplicationType.PHILHEALTH) relevantTypes = [ApplicationType.PHILHEALTH];

    const apps = applications.filter(a => a.userId === userId && relevantTypes.includes(a.type));
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
      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${status.color}`}>
          {status.label}
      </span>
  );

  const UserProfileModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const registrationApp = applications.find(a => a.userId === user.id && a.type === ApplicationType.REGISTRATION);
    const uploadedDocs = registrationApp?.documents || [];
    const displayDocs = uploadedDocs.length > 0 ? uploadedDocs : ['BirthCertificate_PSA.pdf', 'ValidID.jpg'];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
         <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
            <div className="bg-slate-900 p-8 shrink-0 flex items-center justify-between">
               <h2 className="text-2xl font-black text-white uppercase tracking-widest">Citizen Profile Review</h2>
               <button onClick={onClose} className="text-white/60 hover:text-white p-2 bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 p-8 space-y-8">
               <div className="pb-6 border-b border-slate-200">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{user.name}</h3>
                  <div className="flex gap-4 mt-4">
                     <div className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black font-mono tracking-widest uppercase">{user.seniorIdNumber || 'NO ID ISSUED'}</div>
                     <div className="px-3 py-1.5 bg-white text-slate-500 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider">{user.email}</div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                      <h4 className="font-black text-slate-400 border-b border-slate-50 pb-3 uppercase text-[10px] tracking-[0.2em]">Personal Details</h4>
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                          {[
                            { label: 'Civil Status', value: user.civilStatus || 'N/A' },
                            { label: 'Sex', value: user.sex || 'N/A' },
                            { label: 'Birth Date', value: user.birthDate },
                            { label: 'Birth Place', value: user.birthPlace || 'San Juan City' },
                            { label: 'Residential Address', value: user.address, full: true },
                            { label: 'Contact Mobile', value: user.contactNumber || 'N/A' },
                            { label: 'Living Condition', value: user.livingArrangement || 'Owned' }
                          ].map((item, idx) => (
                            <div key={idx} className={item.full ? 'col-span-2' : ''}>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">{item.label}</label>
                              <p className="font-bold text-slate-800 text-sm">{item.value}</p>
                            </div>
                          ))}
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                          <h4 className="font-black text-slate-400 border-b border-slate-50 pb-3 uppercase text-[10px] tracking-[0.2em]">Economic Profile</h4>
                          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Pensioner Status</label>
                                  <p className={`font-black text-sm uppercase ${user.isPensioner ? 'text-emerald-600' : 'text-slate-500'}`}>{user.isPensioner ? 'Yes' : 'No'}</p>
                              </div>
                              {user.isPensioner && (
                                  <>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Monthly Amount</label>
                                        <p className="font-mono font-black text-slate-800 text-sm">{user.pensionAmount ? `₱${user.pensionAmount}` : 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Pension Source</label>
                                        <p className="font-bold text-slate-800 text-sm">{user.pensionSource || 'SSS/GSIS'}</p>
                                    </div>
                                  </>
                              )}
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                          <h4 className="font-black text-slate-400 border-b border-slate-50 pb-3 uppercase text-[10px] tracking-[0.2em]">Health Record</h4>
                          <div className="space-y-4">
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Existing Condition</label>
                                  <p className="font-bold text-slate-800 text-sm uppercase">{user.hasIllness ? 'Yes' : 'None Declared'}</p>
                              </div>
                              {user.hasIllness && (
                                  <div>
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Medical Details</label>
                                      <p className="font-bold text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{user.illnessDetails || 'N/A'}</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                      <h4 className="font-black text-slate-400 border-b border-slate-50 pb-3 uppercase text-[10px] tracking-[0.2em]">Archived Attachments</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                         {displayDocs.map((doc, idx) => (
                             <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-primary-300 transition-all cursor-pointer">
                                 <p className="text-sm font-black text-slate-800 truncate">{doc}</p>
                                 <p className="text-[10px] text-primary-500 uppercase font-black tracking-[0.1em] mt-1">Review Document</p>
                             </div>
                         ))}
                      </div>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
               <button onClick={onClose} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl text-xs">
                 Close Masterlist Entry
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
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Citizen Masterlist</h1>
          <p className="text-slate-500 font-medium">Database of all officially registered and approved senior citizens.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-xs">
                <Printer size={16} />
                <span className="hidden md:inline">Print Masterlist</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all text-xs">
                <Download size={16} />
                <span className="hidden md:inline">Export Data</span>
            </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <div className="relative max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text"
               placeholder="Search by Name, Email, or ID..."
               className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6">Name and Birthdate</th>
                <th className="p-6">Senior ID</th>
                <th className="p-6">ID Status</th>
                <th className="p-6">Benefits</th>
                <th className="p-6">PhilHealth</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citizens.map((citizen) => (
                <tr key={citizen.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{citizen.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">Born: {citizen.birthDate || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-black font-mono tracking-widest border border-slate-200">
                      {citizen.seniorIdNumber || 'NOT ISSUED'}
                    </span>
                  </td>
                  <td className="p-6">
                      <StatusBadge status={getStatus(citizen.id, ApplicationType.ID_NEW)} />
                  </td>
                  <td className="p-6">
                      <StatusBadge status={getStatus(citizen.id, 'BENEFITS')} />
                  </td>
                  <td className="p-6">
                      <StatusBadge status={getStatus(citizen.id, ApplicationType.PHILHEALTH)} />
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => setSelectedUser(citizen)}
                      className="text-primary-600 hover:text-primary-700 font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {citizens.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-20 text-center text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No matching entries found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
