import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint } from '../../types';
import { Send, AlertTriangle } from 'lucide-react';

export const CitizenComplaints: React.FC = () => {
  const { currentUser, addComplaint, complaints } = useApp();
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addComplaint({
      userId: currentUser.id,
      userName: currentUser.name,
      subject,
      details,
    });
    setSubmitted(true);
    setSubject('');
    setDetails('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const myComplaints = complaints.filter(c => c.userId === currentUser?.id);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">File a Complaint</h1>
        <p className="text-slate-500 mt-2">We are here to help. Let us know about your concerns.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
          <input 
            type="text" 
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            placeholder="e.g. Delayed Pension, Disrespectful Staff"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Details</label>
          <textarea 
            required
            rows={5}
            value={details}
            onChange={e => setDetails(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
            placeholder="Please describe what happened..."
          />
          <p className="text-xs text-slate-400 mt-2 text-right">Our smart system helps prioritize urgent issues.</p>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Send size={20} />
          Submit Report
        </button>

        {submitted && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center font-medium animate-pulse">
            Complaint submitted successfully! We will review it shortly.
          </div>
        )}
      </form>

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 ml-2">Your Complaint History</h3>
        {myComplaints.length === 0 && <p className="text-slate-400 ml-2 text-sm">No previous complaints.</p>}
        {myComplaints.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg shrink-0">
               <AlertTriangle size={20} />
            </div>
            <div>
               <p className="font-bold text-slate-800">{c.subject}</p>
               <p className="text-sm text-slate-500 line-clamp-2">{c.details}</p>
               <div className="mt-2 flex gap-2">
                 <span className={`text-xs px-2 py-1 rounded-md font-medium ${c.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                   {c.status}
                 </span>
                 <span className="text-xs text-slate-400 py-1">{c.date}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
