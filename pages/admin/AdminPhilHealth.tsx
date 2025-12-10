
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType } from '../../types';
import { Stethoscope, CheckCircle, Clock } from 'lucide-react';

export const AdminPhilHealth: React.FC = () => {
  const { applications, updateApplicationStatus } = useApp();

  const philhealthApps = applications.filter(a => a.type === ApplicationType.PHILHEALTH);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">PhilHealth Facilitation</h1>
        <p className="text-slate-500">Manage member data record updates and coverage requests.</p>
      </header>

      <div className="grid gap-4">
          {philhealthApps.length === 0 && (
              <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                  <Stethoscope size={32} className="mx-auto mb-4" />
                  <p>No PhilHealth requests found.</p>
              </div>
          )}
          {philhealthApps.map(app => (
              <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Stethoscope size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-800">{app.userName}</h3>
                          <p className="text-sm text-slate-500">{app.description}</p>
                          <div className="flex gap-2 mt-2">
                             <span className={`text-xs px-2 py-1 rounded font-bold ${
                                 app.status === ApplicationStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                 app.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                 'bg-amber-100 text-amber-700'
                             }`}>
                                 {app.status}
                             </span>
                          </div>
                      </div>
                  </div>
                  {app.status === ApplicationStatus.PENDING && (
                      <button 
                         onClick={() => updateApplicationStatus(app.id, ApplicationStatus.APPROVED)}
                         className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
                      >
                          Process Request
                      </button>
                  )}
              </div>
          ))}
      </div>
    </div>
  );
};
