import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType } from '../../types';
import { IDCard } from '../../components/IDCard';
import { Printer, CheckCircle, Search, CreditCard, XCircle, Clock, Archive } from 'lucide-react';

export const AdminIssuance: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const { applications, users, updateApplicationStatus, issueIdCard } = useApp();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Helper to check if application is ID related
  const isIdApplication = (type: ApplicationType) => {
      return type === ApplicationType.ID_NEW || type === ApplicationType.ID_RENEWAL || type === ApplicationType.ID_REPLACEMENT;
  };

  // 1. FOR APPROVAL (Pending ID Applications)
  if (tab === 'approval') {
      const pending = applications.filter(a => isIdApplication(a.type) && a.status === ApplicationStatus.PENDING);

      return (
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold text-slate-800">ID Issuance Approvals</h1>
            <p className="text-slate-500">Review pending New, Renewal, and Replacement ID applications.</p>
          </header>
  
          {pending.length === 0 ? (
             <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CreditCard size={32} />
               </div>
               <p className="text-slate-500">No pending ID applications.</p>
             </div>
          ) : (
            <div className="grid gap-4">
              {pending.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{app.userName}</h3>
                      <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              app.type === ApplicationType.ID_NEW ? 'bg-purple-100 text-purple-700' :
                              app.type === ApplicationType.ID_RENEWAL ? 'bg-emerald-100 text-emerald-700' :
                              'bg-amber-100 text-amber-700'
                          }`}>
                              {app.type}
                          </span>
                      </div>
                      <p className="text-xs text-slate-400">{app.description}</p>
                      {app.documents && (
                          <div className="text-xs text-slate-500 mt-2">
                              Documents: {app.documents.join(', ')}
                          </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateApplicationStatus(app.id, ApplicationStatus.REJECTED, "Invalid documents")}
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

  // 2. DISAPPROVED
  if (tab === 'disapproved') {
      const rejected = applications.filter(a => isIdApplication(a.type) && a.status === ApplicationStatus.REJECTED);

      return (
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold text-slate-800">Disapproved IDs</h1>
            <p className="text-slate-500">History of rejected ID applications.</p>
          </header>
  
          {rejected.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Archive size={32} />
                  </div>
                  <p className="text-slate-500">No disapproved ID applications found.</p>
              </div>
          ) : (
              <div className="grid gap-4">
                  {rejected.map(app => (
                      <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                              <XCircle size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800">{app.userName}</h3>
                              <p className="text-sm text-slate-500">{app.type} - {app.date}</p>
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