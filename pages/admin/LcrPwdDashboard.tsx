
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, UserCheck, Users, Filter, CheckCircle, XCircle } from 'lucide-react';

export const LcrPwdDashboard: React.FC = () => {
  const { registryRecords } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LCR' | 'PWD'>('ALL');

  const filteredRecords = registryRecords.filter(record => {
    const matchesSearch = 
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || record.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Agency Portal</h1>
          <p className="text-slate-500">Masterlist Verification for LCR and PWD Records</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
            <button 
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'ALL' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                All Records
            </button>
            <button 
                onClick={() => setFilterType('LCR')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'LCR' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                LCR
            </button>
            <button 
                onClick={() => setFilterType('PWD')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'PWD' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                PWD
            </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Users size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-sm font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-slate-800">{registryRecords.length}</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserCheck size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-sm font-medium">Registered Citizens</p>
                  <p className="text-2xl font-bold text-slate-800">{registryRecords.filter(r => r.isRegistered).length}</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Filter size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-sm font-medium">Unregistered</p>
                  <p className="text-2xl font-bold text-slate-800">{registryRecords.filter(r => !r.isRegistered).length}</p>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
           <div className="relative max-w-md w-full">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text"
               placeholder="Search by ID or Name..."
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
                <th className="p-4 font-semibold">ID Number</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Full Name</th>
                <th className="p-4 font-semibold">Birth Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-slate-600 font-medium">{record.id}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${record.type === 'LCR' ? 'bg-primary-50 text-primary-700' : 'bg-blue-50 text-blue-700'}`}>
                        {record.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-800">{record.firstName} {record.lastName}</td>
                  <td className="p-4 text-slate-600">{record.birthDate}</td>
                  <td className="p-4">
                      {record.isRegistered ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                              <CheckCircle size={14} /> Registered
                          </span>
                      ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                              <XCircle size={14} /> Unregistered
                          </span>
                      )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">View Details</button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-500">No records found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
