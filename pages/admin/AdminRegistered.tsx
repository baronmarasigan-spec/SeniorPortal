
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType, Role, User } from '../../types';
import { CheckCircle, XCircle, Clock, Archive, Search, FileText, Key, X, MapPin, Phone, Mail, Calendar } from 'lucide-react';

export const AdminRegistered: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const { applications, users, updateApplicationStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // 1. FOR APPROVAL
  if (tab === 'approval') {
    const pendingRegistrations = applications.filter(a => 
      a.type === ApplicationType.REGISTRATION && a.status === ApplicationStatus.PENDING
    );

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-800">Registration Approvals</h1>
          <p className="text-slate-500">Review pending new senior citizen registrations.</p>
        </header>
        
        {pendingRegistrations.length === 0 ? (
           <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
             <p className="text-slate-500">No pending registrations to review.</p>
           </div>
        ) : (
          <div className="grid gap-4">
            {pendingRegistrations.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Clock size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{app.userName}</h3>
                    <p className="text-slate-600 text-sm mb-2">Application Date: {app.date}</p>
                    
                    {/* Credential Display for Test Data */}
                    {app.description.includes('Credentials') ? (
                       <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 inline-block max-w-sm">
                          <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
                             <Key size={12} /> Test Credentials (Mock Data)
                          </p>
                          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{app.description}</pre>
                       </div>
                    ) : (
                       <p className="text-sm text-slate-500 italic mb-2">{app.description}</p>
                    )}

                    {app.documents && (
                        <div className="flex gap-2 flex-wrap">
                            {app.documents.map((doc, i) => (
                                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                                    <FileText size={12} /> {doc}
                                </span>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateApplicationStatus(app.id, ApplicationStatus.REJECTED, "Incomplete requirements")}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(app.id, ApplicationStatus.APPROVED)}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all font-medium text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. MASTERLIST (APPROVED)
  if (tab === 'masterlist') {
    const citizens = users.filter(u => u.role === Role.CITIZEN && 
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-6 relative">
        {/* Detail Modal */}
        {viewingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingUser(null)}></div>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in-up">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white flex justify-between items-start">
                        <div className="flex gap-4 items-center">
                            <img src={viewingUser.avatarUrl} className="w-20 h-20 rounded-2xl bg-white border-4 border-white/20 object-cover" alt="Profile" />
                            <div>
                                <h2 className="text-2xl font-bold">{viewingUser.name}</h2>
                                <p className="text-white/70 font-mono bg-white/10 px-2 py-0.5 rounded text-sm inline-block mt-1">
                                    {viewingUser.seniorIdNumber || 'ID Pending'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setViewingUser(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        {/* Credentials Section */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
                                <Key size={18} /> User Login Credentials
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs uppercase text-amber-600 font-bold block">Username</span>
                                    <span className="text-amber-900 font-mono font-medium">{viewingUser.username || 'Not set'}</span>
                                </div>
                                <div>
                                    <span className="text-xs uppercase text-amber-600 font-bold block">Password</span>
                                    <span className="text-amber-900 font-mono font-medium">{viewingUser.password || '******'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                                    <Calendar size={14} /> Birth Date
                                </div>
                                <p className="text-slate-800 font-medium">{viewingUser.birthDate}</p>
                             </div>
                             <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                                    <Mail size={14} /> Email Address
                                </div>
                                <p className="text-slate-800 font-medium">{viewingUser.email}</p>
                             </div>
                             <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                                    <Phone size={14} /> Mobile Number
                                </div>
                                <p className="text-slate-800 font-medium">{viewingUser.contactNumber || 'N/A'}</p>
                             </div>
                             <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                                    <MapPin size={14} /> Address
                                </div>
                                <p className="text-slate-800 font-medium">{viewingUser.address}</p>
                             </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={() => setViewingUser(null)} className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}

        <header>
          <h1 className="text-3xl font-bold text-slate-800">Registered Masterlist</h1>
          <p className="text-slate-500">Database of approved registered senior citizens.</p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
             <div className="relative max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                 type="text"
                 placeholder="Search by name or email..."
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Senior ID</th>
                  <th className="p-4 font-semibold">Birth Date</th>
                  <th className="p-4 font-semibold">Address</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={citizen.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{citizen.name}</p>
                          <p className="text-xs text-slate-500">{citizen.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">{citizen.seniorIdNumber || 'N/A'}</span></td>
                    <td className="p-4 text-sm text-slate-600">{citizen.birthDate}</td>
                    <td className="p-4 text-sm text-slate-600 truncate max-w-xs">{citizen.address}</td>
                    <td className="p-4 text-right">
                        <button 
                            onClick={() => setViewingUser(citizen)}
                            className="text-primary-600 text-xs font-bold hover:underline"
                        >
                            View
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. LIST OF DISAPPROVED
  if (tab === 'disapproved') {
    const rejectedApps = applications.filter(a => 
      a.type === ApplicationType.REGISTRATION && a.status === ApplicationStatus.REJECTED
    );

    return (
      <div className="space-y-6">
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
            <div className="grid gap-4">
                {rejectedApps.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                        <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                            <XCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{app.userName}</h3>
                            <p className="text-sm text-slate-500">Date: {app.date}</p>
                            <p className="text-sm text-red-600 mt-2 font-medium bg-red-50 px-3 py-1 rounded inline-block">
                                Reason: {app.rejectionReason || 'Not specified'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    );
  }

  return <div>Select a sub-menu</div>;
};
