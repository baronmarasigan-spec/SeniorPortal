import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint } from '../../types';
import { Send, AlertTriangle, MessageSquare, ThumbsUp } from 'lucide-react';

export const CitizenComplaints: React.FC = () => {
  const { currentUser, addComplaint, complaints } = useApp();
  const [submissionType, setSubmissionType] = useState<'Complaint' | 'Feedback'>('Complaint');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addComplaint({
      userId: currentUser.id,
      userName: currentUser.name,
      subject: `[${submissionType}] ${subject}`,
      details,
    });
    setSubmitted(true);
    setSubject('');
    setDetails('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const myComplaints = complaints.filter(c => c.userId === currentUser?.id);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">
          {submissionType === 'Complaint' ? 'File a Complaint' : 'Submit Feedback'}
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          {submissionType === 'Complaint' 
            ? 'We are here to help. Let us know about your concerns or grievances.' 
            : 'We value your opinion. Help us improve our services.'}
        </p>

        {/* Toggle Switch */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSubmissionType('Complaint')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                submissionType === 'Complaint' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <AlertTriangle size={16} />
              Complaint
            </button>
            <button
              onClick={() => setSubmissionType('Feedback')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                submissionType === 'Feedback' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ThumbsUp size={16} />
              Feedback
            </button>
        </div>
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
            placeholder={submissionType === 'Complaint' ? "e.g. Delayed Pension, Disrespectful Staff" : "e.g. Great Service, Suggestion for ID"}
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
            placeholder={submissionType === 'Complaint' ? "Please describe what happened..." : "Tell us your thoughts or suggestions..."}
          />
          <p className="text-xs text-slate-400 mt-2 text-right">
            {submissionType === 'Complaint' ? 'Our smart system helps prioritize urgent issues.' : 'Your feedback helps us serve you better.'}
          </p>
        </div>

        <button 
          type="submit"
          className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
            submissionType === 'Complaint' 
              ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
          }`}
        >
          <Send size={20} />
          {submissionType === 'Complaint' ? 'Submit Report' : 'Send Feedback'}
        </button>

        {submitted && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center font-medium animate-pulse">
            {submissionType} submitted successfully! Thank you.
          </div>
        )}
      </form>

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 ml-2">Your History</h3>
        {myComplaints.length === 0 && <p className="text-slate-400 ml-2 text-sm">No previous submissions.</p>}
        {myComplaints.map(c => {
          const isFeedback = c.subject.includes('[Feedback]');
          const displaySubject = c.subject.replace(/\[.*?\]\s*/, '');
          
          return (
            <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
              <div className={`p-2 rounded-lg shrink-0 ${isFeedback ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                 {isFeedback ? <ThumbsUp size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isFeedback ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {isFeedback ? 'Feedback' : 'Complaint'}
                    </span>
                    <span className="text-xs text-slate-400">{c.date}</span>
                 </div>
                 <p className="font-bold text-slate-800">{displaySubject}</p>
                 <p className="text-sm text-slate-500 line-clamp-2 mt-1">{c.details}</p>
                 <div className="mt-2">
                   <span className={`text-xs px-2 py-1 rounded-md font-medium ${c.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                     {c.status}
                   </span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};