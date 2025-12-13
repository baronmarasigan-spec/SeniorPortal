import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType } from '../../types';
import { CheckCircle, XCircle, HeartHandshake, Archive, Search, Banknote } from 'lucide-react';

export const AdminBenefits: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const { applications, updateApplicationStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const isBenefitType = (type: ApplicationType) => {
      return type === ApplicationType.BENEFIT_CASH || type === ApplicationType.BENEFIT_MED;
  };

  // 1. FOR APPROVAL
  if (tab === 'approval') {
    const pending = applications.filter(a => isBenefitType(a.type) && a.status === ApplicationStatus.PENDING);

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-800">Benefit Approvals</h1>
          <p className="text-slate-500">Review pending benefit claims and assistance requests.</p>
        </header>

        {pending.length === 0 ? (
           <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
               <HeartHandshake size={32} />
             </div>
             <p className="text-slate-500">No pending benefit applications.</p>
           </div>
        ) : (
          <div className="grid gap-4">
            {pending.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                    <Banknote size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{app.userName}</h3>
                    <p className="text-slate-600 font-medium text-sm">{app.type === ApplicationType.BENEFIT_CASH ? 'Cash Gift / Pension' : 'Medical Assistance'}</p>
                    <p className="text-xs text-slate-400 mt-1">{app.description}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateApplicationStatus(app.id, ApplicationStatus.REJECTED, "Not eligible")}
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
    const rejected = applications.filter(a => isBenefitType(a.type) && a.status === ApplicationStatus.REJECTED);

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-800">Disapproved Benefits</h1>
          <p className="text-slate-500">History of rejected benefit claims.</p>
        </header>

         {rejected.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive size={32} />
                </div>
                <p className="text-slate-500">No disapproved claims found.</p>
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