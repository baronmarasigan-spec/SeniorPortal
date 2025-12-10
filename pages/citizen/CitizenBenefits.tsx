
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationType, ApplicationStatus } from '../../types';
import { HeartHandshake, Banknote, Stethoscope, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenBenefits: React.FC = () => {
  const { currentUser, applications, addApplication } = useApp();
  const navigate = useNavigate();

  const benefits = [
    {
      id: 'pension',
      type: ApplicationType.BENEFIT_CASH,
      title: 'Social Pension',
      amount: '₱500 / month',
      description: 'Monthly stipend for indigent senior citizens to augment daily subsistence.',
      icon: Banknote,
      color: 'bg-emerald-500',
    },
    {
      id: 'cash_gift',
      type: ApplicationType.BENEFIT_CASH,
      title: 'Annual Cash Gift',
      amount: '₱1,000 / year',
      description: 'Annual financial assistance given every October during Senior Citizen week.',
      icon: HeartHandshake,
      color: 'bg-orange-500',
    },
    {
      id: 'philhealth',
      type: ApplicationType.PHILHEALTH,
      title: 'PhilHealth Coverage',
      amount: 'Full Coverage',
      description: 'Mandatory PhilHealth coverage for all senior citizens.',
      icon: Stethoscope,
      color: 'bg-blue-500',
    },
  ];

  const getStatus = (type: ApplicationType) => {
    return applications.find(a => a.userId === currentUser?.id && a.type === type && a.status !== ApplicationStatus.REJECTED);
  };

  const handleApply = (benefit: typeof benefits[0]) => {
     addApplication({
        userId: currentUser!.id,
        userName: currentUser!.name,
        type: benefit.type,
        description: `Application for ${benefit.title}`,
     });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">My Benefits</h1>
        <p className="text-slate-500">Manage your entitlements and apply for financial assistance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {benefits.map((benefit) => {
          const status = getStatus(benefit.type);
          const isApplied = !!status;

          return (
            <div key={benefit.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${benefit.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                    <benefit.icon size={28} />
                  </div>
                  {isApplied && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        status.status === ApplicationStatus.ISSUED || status.status === ApplicationStatus.APPROVED 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                        {status.status === ApplicationStatus.APPROVED ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {status.status}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-800">{benefit.title}</h3>
                <p className="text-primary-600 font-bold text-lg mb-2">{benefit.amount}</p>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{benefit.description}</p>
              </div>

              <button
                onClick={() => handleApply(benefit)}
                disabled={isApplied}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  isApplied 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                }`}
              >
                {isApplied ? 'Application Submitted' : 'Apply Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
