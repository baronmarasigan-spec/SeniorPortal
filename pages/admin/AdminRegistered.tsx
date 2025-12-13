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

  // 2. LIST OF DISAPPROVED
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