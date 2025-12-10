
import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Mail, Calendar, MapPin, Phone, Heart, CreditCard } from 'lucide-react';
import { IDCard } from '../../components/IDCard';

export const CitizenProfile: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500">Manage your personal information and account settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-600 to-primary-800"></div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6 mt-8">
                      <img 
                        src={currentUser.avatarUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
                      />
                      <div className="text-center sm:text-left">
                          <h2 className="text-2xl font-bold text-slate-800">{currentUser.name}</h2>
                          <p className="text-primary-600 font-medium">{currentUser.seniorIdNumber || 'ID Not Issued'}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Mail size={14} /> Email Address
                          </label>
                          <p className="font-medium text-slate-700">{currentUser.email}</p>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Calendar size={14} /> Date of Birth
                          </label>
                          <p className="font-medium text-slate-700">{currentUser.birthDate}</p>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                              <MapPin size={14} /> Address
                          </label>
                          <p className="font-medium text-slate-700">{currentUser.address}</p>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Phone size={14} /> Mobile Number
                          </label>
                          <p className="font-medium text-slate-700">{currentUser.contactNumber || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                              <Heart size={14} /> Emergency Contact
                          </label>
                          <p className="font-medium text-slate-700">{currentUser.emergencyContact || 'Not provided'}</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Digital ID Preview */}
          <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 w-full">
                       <CreditCard size={18} className="text-primary-500" /> Digital ID
                   </h3>
                   <div className="transform scale-[0.65] origin-top">
                       <IDCard user={currentUser} />
                   </div>
                   <button className="w-full mt-[-60px] py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">
                       Download / Print
                   </button>
              </div>
          </div>
      </div>
    </div>
  );
};
