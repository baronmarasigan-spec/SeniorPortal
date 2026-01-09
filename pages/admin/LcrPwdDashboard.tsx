
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, UserCheck, Users, Filter, CheckCircle, XCircle, Database, Eye, X, MapPin, Calendar, User, Flag, Briefcase } from 'lucide-react';
import { RegistryRecord } from '../../types';

export const LcrPwdDashboard: React.FC = () => {
  const { registryRecords } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LCR' | 'PWD'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<RegistryRecord | null>(null);

  const filteredRecords = registryRecords.filter(record => {
    const matchesSearch = 
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || record.type === filterType;

    return matchesSearch && matchesType;
  });

  const ViewRecordModal = ({ record, onClose }: { record: RegistryRecord, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
             <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
                 {/* Header */}
                 <div className="bg-slate-900 p-6 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${record.type === 'LCR' ? 'bg-primary-500 text-white' : 'bg-blue-500 text-white'}`}>
                             <Database size={24} />
                         </div>
                         <div>
                             <h2 className="text-xl font-bold text-white leading-none">Record Details</h2>
                             <p className="text-slate-400 text-sm mt-1 font-mono">{record.id}</p>
                         </div>
                     </div>
                     <button onClick={onClose} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors">
                         <X size={20} />
                     </button>
                 </div>

                 <div className="p-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
                     <div className="flex justify-end mb-6">
                        {record.isRegistered ? (
                            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
                                <CheckCircle size={16} /> Already Registered in System
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                                <XCircle size={16} /> Unregistered
                            </span>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 flex items-center gap-2">
                                <User size={16} /> Personal Information
                             </h3>
                             <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Full Name</label>
                                    <p className="font-bold text-slate-800 text-lg">
                                        {record.firstName} {record.middleName} {record.lastName} {record.suffix}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <Calendar size={12} /> Birth Date
                                    </label>
                                    <p className="font-medium text-slate-800">{record.birthDate}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <MapPin size={12} /> Birth Place
                                    </label>
                                    <p className="font-medium text-slate-800">{record.birthPlace || 'Not Specified'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Sex</label>
                                        <p className="font-medium text-slate-800">{record.sex || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Civil Status</label>
                                        <p className="font-medium text-slate-800">{record.civilStatus || 'N/A'}</p>
                                    </div>
                                </div>
                             </div>
                         </div>

                         <div className="space-y-4">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 flex items-center gap-2">
                                <MapPin size={16} /> Residential Address
                             </h3>
                             <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100 text-sm">
                                <p><span className="font-bold text-slate-400">House No:</span> {record.houseNo || 'N/A'}</p>
                                <p><span className="font-bold text-slate-400">Street:</span> {record.street || 'N/A'}</p>
                                <p><span className="font-bold text-slate-400">Barangay:</span> {record.barangay || 'N/A'}</p>
                                <p><span className="font-bold text-slate-400">District:</span> {record.district || 'N/A'}</p>
                                <p><span className="font-bold text-slate-400">City/Prov:</span> {record.city || 'N/A'}, {record.province || 'N/A'}</p>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                     <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">
                         Close
                     </button>
                 </div>
             </div>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      {selectedRecord && <ViewRecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">LCR / PWD Registry Masterlist</h1>
          <p className="text-slate-500">Verified masterlist of Local Civil Registry and PWD records for cross-referencing.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                All
            </button>
            <button 
                onClick={() => setFilterType('LCR')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'LCR' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                LCR
            </button>
            <button 
                onClick={() => setFilterType('PWD')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'PWD' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                PWD
            </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
           <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text"
               placeholder="Search by ID or Name..."
               className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest">
                <th className="p-6">ID Number</th>
                <th className="p-6">Type</th>
                <th className="p-6">Full Name</th>
                <th className="p-6">Birth Date</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-mono text-slate-600 font-bold">{record.id}</td>
                  <td className="p-6">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${record.type === 'LCR' ? 'bg-primary-50 text-primary-700' : 'bg-blue-50 text-blue-700'}`}>
                        {record.type}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-slate-800">{record.firstName} {record.lastName}</td>
                  <td className="p-6 text-slate-600 font-medium">{record.birthDate}</td>
                  <td className="p-6 text-right">
                    <button 
                        onClick={() => setSelectedRecord(record)}
                        className="text-primary-600 hover:text-primary-700 font-bold text-xs flex items-center justify-end gap-1 group"
                    >
                        <Eye size={16} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
