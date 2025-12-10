import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { Search, Download, Printer } from 'lucide-react';

export const Masterlist: React.FC = () => {
  const { users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const citizens = users.filter(u => u.role === Role.CITIZEN && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Citizen Masterlist</h1>
          <p className="text-slate-500">Comprehensive database of registered seniors</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                <Printer size={18} />
                <span className="hidden md:inline">Print</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20">
                <Download size={18} />
                <span className="hidden md:inline">Export</span>
            </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100">
           <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text"
               placeholder="Search by name or email..."
               className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        {/* Table */}
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
                <tr key={citizen.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={citizen.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                      <div>
                        <p className="font-bold text-slate-800">{citizen.name}</p>
                        <p className="text-xs text-slate-500">{citizen.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono font-medium">
                      {citizen.seniorIdNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{citizen.birthDate}</td>
                  <td className="p-4 text-slate-600 truncate max-w-xs">{citizen.address}</td>
                  <td className="p-4 text-right">
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">View Profile</button>
                  </td>
                </tr>
              ))}
              {citizens.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-500">No citizens found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
