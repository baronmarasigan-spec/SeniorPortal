
import React from 'react';
import { useApp } from '../../context/AppContext';
import { CreditCard, HeartHandshake, Megaphone, User, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const menuItems = [
    { 
      label: 'ID Issuance', 
      icon: CreditCard, 
      desc: 'Apply for a new ID',
      path: '/citizen/id?tab=new', 
      color: 'bg-blue-500',
      shadow: 'shadow-blue-500/30'
    },
    { 
      label: 'ID Renewal / Replacement', 
      icon: RefreshCw, 
      desc: 'Renew or replace lost ID',
      path: '/citizen/id?tab=renew', 
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/30'
    },
    { 
      label: 'Benefits', 
      icon: HeartHandshake, 
      desc: 'View pensions & cash gifts',
      path: '/citizen/benefits', 
      color: 'bg-orange-500',
      shadow: 'shadow-orange-500/30'
    },
    { 
      label: 'Complaints and Feedback', 
      icon: Megaphone, 
      desc: 'Submit concerns to OSCA',
      path: '/citizen/complaints', 
      color: 'bg-red-500',
      shadow: 'shadow-red-500/30'
    },
    { 
      label: 'My Profile', 
      icon: User, 
      desc: 'Manage personal details',
      path: '/citizen/profile', 
      color: 'bg-purple-500',
      shadow: 'shadow-purple-500/30'
    },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Header */}
      <div className="text-center md:text-left space-y-2 mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800">
            Welcome, {currentUser?.name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-500 text-lg">What would you like to do today?</p>
      </div>

      {/* Big Icon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
            <button 
                key={index}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group text-left flex flex-col h-64 justify-between relative overflow-hidden"
            >
                {/* Decorative Background Circle */}
                <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${item.color}`}></div>

                <div className={`w-20 h-20 rounded-3xl ${item.color} ${item.shadow} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon size={40} strokeWidth={1.5} />
                </div>
                
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">{item.label}</h3>
                    <p className="text-slate-500 font-medium">{item.desc}</p>
                </div>

                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                    <div className="bg-slate-50 p-2 rounded-full text-slate-400">
                         <ArrowRight size={24} />
                    </div>
                </div>
            </button>
        ))}
      </div>

      {/* Quick Status Summary */}
      <div className="mt-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <User size={24} />
              </div>
              <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Senior Citizen ID</p>
                  <p className="text-lg font-bold text-slate-800 font-mono">{currentUser?.seniorIdNumber || 'PROCESSING'}</p>
              </div>
          </div>
          <div className="h-px w-full md:w-px md:h-12 bg-slate-200"></div>
          <div className="text-center md:text-right">
              <p className="text-slate-500 text-sm">Need help?</p>
              <p className="font-bold text-primary-600">Call (02) 8888-9900</p>
          </div>
      </div>
    </div>
  );
};
