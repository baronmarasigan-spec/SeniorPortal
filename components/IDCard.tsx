
import React from 'react';
import { User } from '../types';

interface IDCardProps {
  user: User;
}

export const IDCard: React.FC<IDCardProps> = ({ user }) => {
  return (
    <div className="w-[400px] h-[250px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col font-sans select-none">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-3 flex items-center gap-3 text-white z-10 relative">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold border border-white/30 text-lg">
          SC
        </div>
        <div>
          <h2 className="text-xs font-bold opacity-80 uppercase tracking-widest">Republic of the Philippines</h2>
          <h1 className="text-sm font-bold leading-tight">Senior Citizen Identity Card</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex gap-4 z-10 relative">
        {/* Photo Section */}
        <div className="flex flex-col gap-2 w-28">
           <div className="w-28 h-28 bg-slate-200 rounded-lg overflow-hidden border-2 border-primary-100 shadow-inner">
             <img src={user.avatarUrl} alt="ID Photo" className="w-full h-full object-cover" />
           </div>
           <div className="text-[10px] text-center font-mono text-slate-400">ID-1234-5678</div>
        </div>

        {/* Details Section */}
        <div className="flex-1 space-y-2">
            <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Name</p>
                <p className="text-slate-900 font-bold leading-tight text-lg">{user.name}</p>
            </div>
            
            <div className="flex gap-4">
                 <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Birth Date</p>
                    <p className="text-slate-800 font-medium text-sm">{user.birthDate}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ID Number</p>
                    <p className="text-primary-600 font-bold font-mono text-sm">{user.seniorIdNumber || 'PENDING'}</p>
                 </div>
            </div>

            <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Address</p>
                <p className="text-slate-600 text-xs leading-snug">{user.address}</p>
            </div>
        </div>
      </div>

      {/* Footer / Barcode Simulation */}
      <div className="h-8 bg-white border-t border-slate-100 flex items-center justify-between px-4 z-10 relative">
         <div className="flex gap-1">
            {[...Array(20)].map((_, i) => (
                <div key={i} className={`h-4 w-${i % 3 === 0 ? '0.5' : '1'} bg-slate-800`}></div>
            ))}
         </div>
         <p className="text-[9px] text-slate-400 font-bold uppercase">Non-Transferable</p>
      </div>
    </div>
  );
};
