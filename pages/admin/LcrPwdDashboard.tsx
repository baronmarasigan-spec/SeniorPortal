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
                     {/* Badge Status */}
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
                         
                         {/* Personal Information */}
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
                                <div>
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <Flag size={12} /> Citizenship
                                    </label>
                                    <p className="font-medium text-slate-800">{record.citizenship || 'Filipino'}</p>
                                </div>
                             </div>
                         </div>

                         {/* Address Information */}
                         <div className="space-y-4">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 flex items-center gap-2">
                                <MapPin size={16} /> Residential Address
                             </h3>
                             <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400">House No.</label>
                                            <p className="font-medium text-slate-800">{record.houseNo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400">Street</label>
                                            <p className="font-medium text-slate-800">{record.street || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400">Barangay</label>
                                        <p className="font-medium text-slate-800">{record.barangay || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400">District</label>
                                        <p className="font-medium text-slate-800">{record.district || 'N/A'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400">City</label>
                                            <p className="font-medium text-slate-800">{record.city || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400">Province</label>
                                            <p className="font-medium text-slate-800">{record.province || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                             
                             {/* Meta Info */}
                             <div className="mt-4 pt-4 border-t border-slate-100">
                                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Briefcase size={16} /> Record Source
                                 </h3>
                                 <div className="flex items-center gap-2">
                                     <span className={`px-3 py-1 rounded-lg text-sm font-bold ${record.type === 'LCR' ? 'bg-primary-50 text-primary-700' : 'bg-blue-50 text-blue-700'}`}>
                                        {record.type === 'LCR' ? 'Local Civil Registry' : 'PWD Registry'}
                                     </span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Footer */}
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
                  <Database size={24} />
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
                    <button 
                        onClick={() => setSelectedRecord(record)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-end gap-1 hover:underline w-full"
                    >
                        <Eye size={16} /> View Details
                    </button>
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